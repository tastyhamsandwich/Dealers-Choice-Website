import { Scene, Types } from 'phaser';
import { Room, Client } from "colyseus.js";
import * as c from '../lib/constants';
import Server from '../services/Server';
import { Card, Deck, Player, Sidepot } from '../lib/classes';
import { IUserData, getUserData } from '../../main';

interface SceneUI {
    potText?: Phaser.GameObjects.Text;
    actionButtons?: {
        fold?: Phaser.GameObjects.Container;
        check?: Phaser.GameObjects.Container;
        call?: Phaser.GameObjects.Container;
        bet?: Phaser.GameObjects.Container;
        raise?: Phaser.GameObjects.Container;
    };
}

export class PokerGame extends Scene {
    private room: Room | null = null;
    private userData: IUserData | null = null;
    private gameState: {
        players: any[];
        gamePhase: string;
        pot: number;
        communityCards: Card[];
        currentPlayerTurn: number;
        currentBet: number;
        sidepots: Sidepot[];
    } | null = null;
    
    private sceneUI: SceneUI = {};
    private tableSprite?: Phaser.GameObjects.Sprite;
    private cardSprites: Phaser.GameObjects.Sprite[] = [];

    constructor() {
        super({ key: 'PokerGame' });
    }

    init() {
        // Get user data in the init phase
        this.userData = getUserData();
        console.log('User data in PokerGame:', this.userData);
    }

    preload() {
        // DEF Load all necessary assets
        this.load.image('poker_table', './public/assets/table.png');
        this.load.image('cardBack', './public/assets/cardback.png');
        
        // DEF Load card assets
        const suits = ['H', 'D', 'C', 'S'];
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
        
        suits.forEach(suit => {
            values.forEach(value => {
                const key = `${value}${suit[0].toUpperCase()}`;
                this.load.image(key, `./public/assets/cards_en/${key}.png`);
            });
        });

        // DEF Load UI elements
        this.load.image('button', './public/assets/buttons/button_blue_up.png');
        this.load.image('chipSpade', './public/assets/chip_spade.png');
        this.load.image('chipDiamond', './public/assets/chip_diamond.png');
    }

    async create(data: { server: Server }) {
        const { server } = data;
        
        // DEF Create the poker table
        this.createGameTable();

        try {
            // Connect to room
            this.room = await server.client.joinOrCreate("poker", {
                name: this.userData?.display_name || this.userData?.username || "Player",
                userId: this.userData?.id
            });

            // Set up room event listeners
            this.setupRoomListeners();

            // Create UI elements
            this.createUI();
            this.createPlayerInfoUI();

        } catch (error) {
            console.error("Failed to join room:", error);
        }
    }

    private createGameTable() {
        // Add the poker table sprite
        this.tableSprite = this.add.sprite(c.GAME_X_MID, c.GAME_Y_MID, 'poker_table');
        this.tableSprite.setScale(0.8); // Adjust scale as needed

        // Add pot text
        this.sceneUI.potText = this.add.text(c.GAME_X_MID, c.GAME_Y_MID - 50, 'Pot: $0', {
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);
    }

    private createUI() {
        this.sceneUI.actionButtons = {};
        
        // Create action buttons
        const buttonY = c.GAME_HEIGHT - 100;
        const buttonSpacing = 120;
        let startX = c.GAME_X_MID - (buttonSpacing * 2);

        ['fold', 'check', 'call', 'bet', 'raise'].forEach((action, index) => {
            const button = this.createActionButton(
                startX + (buttonSpacing * index),
                buttonY,
                action
            );
            this.sceneUI.actionButtons![action] = button;
        });
    }

    private createPlayerInfoUI() {
        if (!this.userData) return;
        
        // Create player info display
        const infoX = 100;
        const infoY = c.GAME_HEIGHT - 50;
        
        // Display name
        const displayName = this.userData.display_name || this.userData.username;
        this.add.text(infoX, infoY - 40, displayName, {
            fontSize: '18px',
            color: '#ffffff'
        });
        
        // Display balance
        this.add.text(infoX, infoY - 15, `Balance: $${this.userData.balance}`, {
            fontSize: '16px',
            color: '#ffffff'
        });
        
        // If you have an avatar image
        // if (this.userData.avatar) {
        //     // You would need to preload this image first
        //     // this.add.image(infoX - 40, infoY - 25, 'playerAvatar').setScale(0.5);
        // }
    }

    private createActionButton(x: number, y: number, action: string): Phaser.GameObjects.Container {
        const container = this.add.container(x, y);
        
        const button = this.add.image(0, 0, 'button');
        const text = this.add.text(0, 0, action.toUpperCase(), {
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5);

        container.add([button, text]);
        container.setSize(button.width, button.height);
        
        button.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.sendAction(action));

        return container;
    }

    private setupRoomListeners() {
        if (!this.room) return;

        // Listen for state changes
        this.room.onStateChange((state) => {
            this.gameState = state;
            this.updateGameDisplay();
        });

        // Listen for specific game events
        this.room.onMessage("gameStarted", () => {
            this.hideWaitingMessage();
            this.startGameAnimation();
        });

        this.room.onMessage("playerTurn", (playerId) => {
            const isMyTurn = playerId === this.room?.sessionId;
            this.updateActionButtons(isMyTurn);
        });

        this.room.onMessage("handResult", (result) => {
            this.showHandResult(result);
        });

        // Handle errors
        this.room.onError((error) => {
            console.error("Room error:", error);
        });
    }

    private updateGameDisplay() {
        if (!this.gameState) return;

        // Update pot display
        this.updatePotDisplay(this.gameState.pot);

        // Update community cards
        this.updateCommunityCards(this.gameState.communityCards);

        // Update player displays
        this.updatePlayerDisplays(this.gameState.players);

        // Update action buttons based on current player
        const isMyTurn = this.gameState.currentPlayerTurn === this.getLocalPlayerIndex();
        this.updateActionButtons(isMyTurn);

        // Update game phase display
        this.updatePhaseDisplay(this.gameState.gamePhase);
    }

    private getLocalPlayerIndex(): number {
        return this.gameState?.players.findIndex(p => p.id === this.room?.sessionId) ?? -1;
    }

    private updatePotDisplay(pot: number) {
        if (this.sceneUI.potText) {
            this.sceneUI.potText.setText(`Pot: $${pot}`);
        }
    }

    private updateCommunityCards(cards: Card[]) {
        // Clear existing community cards
        this.cardSprites.forEach(sprite => sprite.destroy());
        this.cardSprites = [];

        // Add new community cards
        let xPos = c.GAME_X_MID - ((cards.length * 100) / 2);
        let indexOffset = 0;
        cards.forEach((card, index) => {
            if (index > 2) indexOffset = 50;
            const cardSprite = this.add.sprite(xPos + (index * 100) + indexOffset, c.GAME_Y_MID, card as unknown as string)
                .setScale(0.75);
            this.cardSprites.push(cardSprite);
        });
    }

    private updatePlayerDisplays(players: Player[]) {
        players.forEach((player, index) => {
            const position = this.getPlayerPosition(index, players.length);
            this.updatePlayerInfo(player, position);
            
            const shouldShowCards = player.id === this.room?.sessionId || this.gameState?.gamePhase === "showdown";
            this.updatePlayerCards(player, position, shouldShowCards);
        });
    }

    private getPlayerPosition(index: number, totalPlayers: number) {
        const angle = (index / totalPlayers) * Math.PI * 2 - (Math.PI / 2);
        const radius = 250;
        
        return {
            x: c.GAME_X_MID + Math.cos(angle) * radius,
            y: c.GAME_Y_MID + Math.sin(angle) * radius
        };
    }

    private updatePlayerInfo(player: Player, position: {x: number, y: number}) {
        const playerInfo = `${player.displayName}\n$${player.chips}`;
        // TODO Add or update player info text - this would need to track existing text objects for updates
    }

    private updatePlayerCards(player: Player, position: {x: number, y: number}, showCards: boolean) {
        player.cards.forEach((card: string, i: number) => {
            const cardImage = this.add.sprite(
                position.x + (i * 30) - 15, 
                position.y, 
                showCards ? card : 'cardBack'
            ).setScale(0.5);
        });
    }

    private updateActionButtons(isMyTurn: boolean) {
        if (!this.gameState || !this.sceneUI.actionButtons) return;

        const validActions = isMyTurn ? this.getValidActions(this.gameState.currentBet) : [];

        // Show/hide buttons based on valid actions
        Object.entries(this.sceneUI.actionButtons).forEach(([action, button]) => {
            button.setVisible(validActions.includes(action));
        });
    }

    private getValidActions(currentBet: number): string[] {
        if (!this.gameState) return [];

        const player = this.gameState.players.find(p => p.id === this.room?.sessionId);
        if (!player) return [];

        const actions = ['fold'];
        
        if (currentBet === player.currentBet)
            actions.push('check');
        else if (player.chips >= currentBet - player.currentBet)
            actions.push('call');

        if (player.chips > currentBet) {
            actions.push(currentBet === 0 ? 'bet' : 'raise');
        }

        return actions;
    }

    private sendAction(action: string, amount?: number) {
        if (!this.room) return;

        switch (action) {
            case 'fold':
                this.room.send("fold");
                break;
            case 'check':
                this.room.send("check");
                break;
            case 'call':
                this.room.send("call");
                break;
            case 'bet':
            case 'raise':
                this.room.send("bet", amount);
                break;
        }
    }

    private hideWaitingMessage() {
        // TODO Implement hiding waiting message
    }

    private startGameAnimation() {
        // TODO Implement game start animation
    }

    private showHandResult(result: any) {
        // TODO Implement showing hand result
    }

    private updatePhaseDisplay(phase: string) {
        // TODO Implement phase display update
    }

    update(time: number, delta: number) {
        // TODO Handle any continuous updates - this might include animations or timer updates, though I'm not sure exactly as of this writing
    }
}
import { Scene } from 'phaser';
import { Room, Client, getStateCallbacks } from "colyseus.js";
import * as c from '../lib/constants';
import * as utils from '../lib/utils';
import Server from '../services/Server';
import { Card, Deck, Player, Sidepot } from '../lib/classes';
import { IUserData, getUserData } from '../../main';
import { EventBus } from '../../EventBus';

interface SceneUI {
    potText?: Phaser.GameObjects.Text;
    disabledButtons?: {
        foldDisabled?: Phaser.GameObjects.Container;
        checkDisabled?: Phaser.GameObjects.Container;
        callDisabled?: Phaser.GameObjects.Container;
        betDisabled?: Phaser.GameObjects.Container;
        raiseDisabled?: Phaser.GameObjects.Container;
    }
    actionButtons?: {
        fold?: Phaser.GameObjects.Container;
        check?: Phaser.GameObjects.Container;
        call?: Phaser.GameObjects.Container;
        bet?: Phaser.GameObjects.Container;
        raise?: Phaser.GameObjects.Container;
    }
    sceneMessages?: {
        waitingMessage?: Phaser.GameObjects.Text;
        gameStartedMessage?: Phaser.GameObjects.Text;
        handResultMessage?: Phaser.GameObjects.Text;
    }
    readyButton?: Phaser.GameObjects.Container;
    returnButton?: Phaser.GameObjects.Container;
}

// Extend Phaser.Game to include userData property
declare global {
    interface PhaserGameWithUserData extends Phaser.Game {
        userData?: IUserData;
    }
}

export class PokerGame extends Scene {
    private room: Room | null = null;
    private gameState: {
        players: any[];
        gamePhase: string;
        pot: number;
        communityCards: Card[];
        currentPlayerTurn: number;
        currentBet: number;
        sidepots: Sidepot[];
        dealerIndex: number;
    } | null = null;
    
    private sceneUI: SceneUI = {};
    private tableSprite?: Phaser.GameObjects.Sprite;
    private cardSprites: Phaser.GameObjects.Sprite[] = [];
    private enlargedCardSprites: Phaser.GameObjects.Sprite[] = []; // Array for the enlarged card sprites
    private userData: IUserData | null = null;
    private tokenSprites: {[key: string]: Phaser.GameObjects.Sprite} = {};

    constructor() {
        super({ key: 'PokerGame' });
    }

    preload() {
        // Get user data as early as possible
        this.userData = getUserData();
        console.log('User data in PokerGame:', this.userData);

        // DEF Load all necessary assets
        this.load.image('poker_table', 'assets/table.png');
        this.load.image('cardBack', 'assets/cardback.png');
        
        // DEF Load card assets
        const suits = ['H', 'D', 'C', 'S'];
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
        
        suits.forEach(suit => {
            values.forEach(value => {
                const key = `${value}${suit}`.toUpperCase();
                this.load.image(key, `assets/cards_en/${key}.png`);
            });
        });

        // DEF Load UI elements
        this.load.image('button', 'assets/buttons/button_blue_up.png');
        this.load.image('disabledButton', 'assets/buttons/button_blue_down.png');
        this.load.image('chipSpade', 'assets/chip_spade.png');
        this.load.image('chipDiamond', 'assets/chip_diamond.png');
        this.load.image('chipsIcon', 'assets/chips_stack_icon.png');
        this.load.image('dealerToken', 'assets/d-token.png');
        this.load.image('smallBlindToken', 'assets/sb-token.png');
        this.load.image('bigBlindToken', 'assets/bb-token.png');
        
        // Load sounds
        this.load.audio('notification', 'assets/sounds/notification.mp3');
        this.load.audio('cardFlip', 'assets/sounds/card_flip.mp3');
        this.load.audio('chipSound', 'assets/sounds/chip_sound.mp3');
    }

    async create(data: { server?: Server } = {}) {
        // If server is not provided, create a new one
        const server = data.server || new Server();
        
        // DEF Create the poker table
        this.createGameTable();

        // Make sure we have user data
        if (!this.userData) {
            this.userData = getUserData();
        }

        // Listen for user data updates
        this.setupUserDataListener();

        try {
            // Connect to room with user data
            this.room = await server.client.joinOrCreate("poker", {
                id: this.userData?.id || 'guest',
                name: this.userData?.username || 'Guest',
                balance: this.userData?.balance || 0
            });

            // Set up room event listeners
            //const _ = getStateCallbacks(this.room);
            this.setupRoomListeners();

            // Create UI elements
            this.createUI();

            // Display user's balance on screen
            this.displayUserInfo();

        } catch (error) {
            console.error("Failed to join room:", error);
        }
    }

    private createGameTable() {
        // Add the poker table sprite
        this.tableSprite = this.add.sprite(c.GAME_X_MID, c.GAME_Y_MID, 'poker_table');
        this.tableSprite.setScale(0.8); // Adjust scale as needed

        // Add pot text
        this.sceneUI.potText = this.add.text(100, 250, 'Pot: 0', {
            fontSize: '24px',
            color: '#ffffff',
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000',
                blur: 5,
            }
        }).setOrigin(0.5);
    }

    private createUI() {
        this.sceneUI.disabledButtons = {};
        this.sceneUI.actionButtons = {};
        this.sceneUI.sceneMessages = {};
        
        // DEF Button positioning
        const startY = c.GAME_Y_MID - 100;
        const buttonSpacing = 60;
        let buttonX = c.GAME_WIDTH - 100;

        // DEF Create action buttons & disabled variants
        ['fold', 'check', 'call', 'bet', 'raise'].forEach((action, index) => {
            const disabledButton = this.createDisabledButton(
                buttonX,
                startY + (buttonSpacing * index),
                action
            );
            this.sceneUI.disabledButtons![`${action}Disabled`] = disabledButton;
            
            const button = this.createActionButton(
                buttonX,
                startY + (buttonSpacing * index),
                action
            );
            this.sceneUI.actionButtons![action] = button;
        });

        // DEF Create scene messages
        // Waiting for players
        this.sceneUI.sceneMessages.waitingMessage = this.add.text(c.GAME_X_MID, c.GAME_Y_MID - 50, 'Waiting for players...', {
            fontSize: '24px',
            color: '#ffffff',
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000',
                blur: 5,
            }
        })
        .setOrigin(0.5)
        .setVisible(false);

        // Game started
        this.sceneUI.sceneMessages.gameStartedMessage = this.add.text(c.GAME_X_MID, c.GAME_Y_MID + 50, 'Game started!', {
            fontSize: '24px',
            color: '#ffffff',
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000',
                blur: 5,
            }
        })
        .setOrigin(0.5)
        .setVisible(false);

        // Hand result
        // TODO Properly handle hand result messages
        this.sceneUI.sceneMessages.handResultMessage = this.add.text(c.GAME_X_MID, c.GAME_Y_MID, 'Hand result goes here', {
            fontSize: '24px',
            color: '#ffffff',
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000',
                blur: 5,
            }
        })
        .setOrigin(0.5)
        .setVisible(false);

        this.sceneUI.readyButton = this.add.container(c.GAME_WIDTH - 100, 50);
        const readyButton = this.add.image(0, 0, 'button').setScale(0.5);
        const readyButtonText = this.add.text(0, 0, 'Ready', {
            fontSize: '20px',
            color: '#ffffff',
        }).setOrigin(0.5);
        this.sceneUI.readyButton.add([readyButton, readyButtonText]);
        
        // Set up interactivity with proper hit area
        readyButton.setInteractive({ useHandCursor: true });
        
        // Use the button's input events instead of the container
        readyButton.on('pointerdown', () => {
            if (this.room) {
                // Send ready message to the server
                this.room.send("ready");
                console.log("Sent ready message to server");
                
                // Update button text and disable it permanently
                readyButtonText.setText("Ready ✓");
                readyButton.disableInteractive();
                readyButton.setTint(0x666666); // Visual feedback that it's disabled
                
                // Hide the button after a short delay
                this.time.delayedCall(1000, () => {
                    if (this.sceneUI.readyButton) {
                        this.sceneUI.readyButton.setVisible(false);
                    }
                });
            }
        });
        
        this.sceneUI.readyButton.setVisible(true);

        // Create button to return to Main Menu
        this.sceneUI.returnButton = this.add.container(100, 50);
        
        const returnButton = this.add.image(0, 0, 'button').setScale(0.5);
        const returnButtonText = this.add.text(0, 0, 'Main Menu', {
            fontSize: '20px',
            color: '#ffffff',
        }).setOrigin(0.5);
        this.sceneUI.returnButton.add([returnButton, returnButtonText]);

        returnButton.setInteractive({ useHandCursor: true });
        returnButton.on('pointerdown', () => {
            //this.room?.send("leave");
            this.scene.start('MainMenu');
        });
    }

    private displayUserInfo() {
        if (this.userData) {

            // Show player name
            const playerName = this.add.text(50, 100, this.userData?.username || 'ERROR', {
                fontSize: '24px',
                color: '#ffffff',
                shadow: {
                    offsetX: 2,
                    offsetY: 2,
                    color: '#000',
                    blur: 5,
                    stroke: false,
                    fill: false
                },
            });

            // Show player balance
            const balanceIcon = this.add.image(50, 150, 'chipsIcon');

            const balanceText = this.add.text(balanceIcon.x + balanceIcon.width + 5, balanceIcon.y, `${this.userData?.balance}`, {
                fontSize: '24px',
                color: '#ffffff',
                shadow: {
                    offsetX: 2,
                    offsetY: 2,
                    color: '#000',
                    blur: 5,
                    stroke: false,
                    fill: false
                },
            });
        }
    }

    private createActionButton(x: number, y: number, action: string): Phaser.GameObjects.Container {
        const container = this.add.container(x, y);
        
        // Create the button background
        const button = this.add.image(0, 0, 'button').setScale(0.5);
        
        // Create the button text
        const buttonText = this.add.text(0, 0, action.charAt(0).toUpperCase() + action.slice(1), {
            fontSize: '20px',
            color: '#ffffff',
        }).setOrigin(0.5);
        
        // Add components to the container
        container.add([button, buttonText]);
        
        // Set up interactivity on the button image, not the container
        button.setInteractive({ useHandCursor: true });
        
        // Add the click handler to the button
        button.on('pointerdown', () => {
            if (action === 'bet' || action === 'raise') {
                // For bet and raise, we need to get the amount
                const amount = 20; // Default amount, you can replace with a prompt or UI element
                this.sendAction(action, amount);
            } else {
                // For other actions, just send the action
                this.sendAction(action);
            }
        });
        
        return container;
    }

    private createDisabledButton(x: number, y: number, action: string): Phaser.GameObjects.Container {
        const container = this.add.container(x, y);
        
        // Create the button background with a gray tint to indicate it's disabled
        const button = this.add.image(0, 0, 'button')
            .setScale(0.5)
            .setTint(0x888888);
        
        // Create the button text
        const buttonText = this.add.text(0, 0, action.charAt(0).toUpperCase() + action.slice(1), {
            fontSize: '20px',
            color: '#999999',
        }).setOrigin(0.5);
        
        // Add components to the container
        container.add([button, buttonText]);
        
        // Disabled buttons are not interactive
        // We don't set any interactivity here
        
        return container;
    }

    private displaySceneMessage(message: string) {
        if (this.sceneUI.sceneMessages && this.sceneUI.sceneMessages[`${message}Message`]) {
            this.sceneUI.sceneMessages[`${message}Message`].setVisible(true);
        }
    }

    private showReadyButton() {
        if (!this.sceneUI.readyButton) return;
        
        // Make sure the button is properly configured
        if (!this.sceneUI.readyButton.visible)
            this.sceneUI.readyButton.setVisible(true);
    }

    private hideReadyButton() {
        if (!this.sceneUI.readyButton) return;
        
        // Make sure the button is properly configured
        if (this.sceneUI.readyButton.visible)
            this.sceneUI.readyButton.setVisible(false);
    }

    private setupRoomListeners() {
        if (!this.room) return;
        
        // Listen for state changes
        this.room.onStateChange((state) => {
            console.log("Game state updated:", state);
            
            // Update our local game state
            this.gameState = {
                players: state.players,
                gamePhase: state.gamePhase,
                pot: state.pot,
                communityCards: state.communityCards.map((card: string) => card),
                currentPlayerTurn: state.currentPlayerTurn,
                currentBet: state.currentBet,
                sidepots: state.sidepots,
                dealerIndex: state.dealerIndex
            };
            
            // Update the game display with the new state
            this.updateGameDisplay();
        });
        
        // Listen for game start event
        this.room.onMessage("gameStarted", (data) => {
            console.log("Game started message received:", data);
            
            // Hide waiting message and ready button
            this.hideWaitingMessage();
            this.hideReadyButton();
            
            // Show game started message
            this.showGameStartedMessage();
            
            // Start the game animation which will also highlight the first active player
            this.startGameAnimation();
            
            // Force an update of the game display to ensure everything is in the correct state
            if (this.gameState) {
                this.time.delayedCall(1000, () => {
                    this.updateGameDisplay();
                });
            }
        });
        
        // Listen for player turn notification
        this.room.onMessage("playerTurn", (data) => {
            console.log("Player turn message received:", data);
            
            // If it's this player's turn, play a notification sound
            if (data === this.room?.sessionId) {
                // Play a sound to alert the player it's their turn
                this.sound.play('notification');
            }
            
            // Update the game display to highlight the active player
            this.updateGameDisplay();
        });
        
        // Listen for hand result
        this.room.onMessage("handResult", (result) => {
            console.log("Hand result received:", result);
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
        
        // Determine if it's the local player's turn
        const localPlayerIndex = this.getLocalPlayerIndex();
        const isMyTurn = localPlayerIndex === this.gameState.currentPlayerTurn && 
                        this.gameState.players[localPlayerIndex]?.canAct === true;
        
        // Update action buttons based on whether it's the player's turn
        this.updateActionButtons(isMyTurn);
        
        // Highlight the active player
        this.highlightActivePlayer();
        
        // Update phase display
        this.updatePhaseDisplay(this.gameState.gamePhase);
    }

    private getLocalPlayerIndex(): number {
        return this.gameState?.players.findIndex(p => p.id === this.room?.sessionId) ?? -1;
    }

    private updatePotDisplay(pot: number) {
        if (this.sceneUI.potText) {
            this.sceneUI.potText.setText(`Pot: ${pot}`);
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
        // Clear any existing player displays and tokens first
        this.children.list
            .filter(obj => obj.name && (
                obj.name.startsWith('player-') || 
                obj.name.startsWith('turn-text-') ||
                obj.name.startsWith('token-')
            ))
            .forEach(obj => obj.destroy());
        
        // Get the local player index
        const localPlayerIndex = this.getLocalPlayerIndex();
        
        // Display each player
        players.forEach((player, index) => {
            // Calculate position based on player index relative to local player
            const position = this.getPlayerPosition(index, players.length);
            
            // Update player info (name, chips, etc.)
            this.updatePlayerInfo(player, position);
            
            // Update player cards
            const showCards = player.id === this.room?.sessionId || this.gameState?.gamePhase === "showdown";
            this.updatePlayerCards(player, position, showCards);
            
            // Display tokens for dealer, small blind, and big blind
            this.displayPlayerTokens(index, position, players.length);
        });
    }

    private getPlayerPosition(index: number, totalPlayers: number) {
        // Get the local player index
        const localPlayerIndex = this.getLocalPlayerIndex();
        
        // Calculate the relative position (0 = local player, 1 = next player clockwise, etc.)
        let relativePosition = (index - localPlayerIndex + totalPlayers) % totalPlayers;
        
        // Table center coordinates
        const centerX = c.GAME_WIDTH / 2;
        const centerY = c.GAME_HEIGHT / 2;
        
        // Table radius - distance from center to player positions
        const tableRadius = 250;
        
        // Calculate positions in a circle, with local player at the bottom
        let angle;
        
        if (totalPlayers === 2) {
            // Special case for heads-up: local player at bottom, opponent at top
            angle = relativePosition === 0 ? Math.PI / 2 : -Math.PI / 2;
        } else {
            // For more players, distribute them around the table
            // Start from bottom (π/2) and go clockwise
            // Local player (relativePosition 0) is always at the bottom
            angle = Math.PI / 2 + relativePosition * (2 * Math.PI / totalPlayers);
        }
        
        // Calculate position using trigonometry
        const x = centerX + tableRadius * Math.cos(angle);
        const y = centerY + tableRadius * Math.sin(angle);
        
        return { x, y };
    }

    private updatePlayerInfo(player: Player, position: {x: number, y: number}) {
        const playerInfo = `${player.displayName}\n$${player.chips}`;
        // TODO Add or update player info text - this would need to track existing text objects for updates
    }

    private updatePlayerCards(player: Player, position: {x: number, y: number}, showCards: boolean) {
        // Clear existing card sprites for this position
        this.cardSprites = this.cardSprites.filter(sprite => {
            if (sprite.getData('position')?.x === position.x && sprite.getData('position')?.y === position.y) {
                sprite.destroy();
                return false;
            }
            return true;
        });

        // If this is the local player, also clear enlarged cards
        const isLocalPlayer = player.id === this.room?.sessionId;
        if (isLocalPlayer) {
            this.enlargedCardSprites.forEach(sprite => sprite.destroy());
            this.enlargedCardSprites = [];
        }

        if (!player.cards || player.cards.length === 0) return;

        const cardSpacing = 30;
        const startX = position.x - ((player.cards.length - 1) * cardSpacing) / 2;

        player.cards.forEach((card, index) => {
            const x = startX + index * cardSpacing;
            const y = position.y;
            
            // Regular sized card
            const cardSprite = this.add.sprite(x, y, showCards ? card : 'cardBack');
            cardSprite.setScale(0.5);
            cardSprite.setData('position', position);
            this.cardSprites.push(cardSprite);

            // If this is the local player, also create enlarged cards in bottom-left
            if (isLocalPlayer) {
                const enlargedX = 100 + index * 80; // Position in bottom-left, more spacing between cards
                const enlargedY = this.game.canvas.height - 100; // Near bottom of screen
                const enlargedCard = this.add.sprite(enlargedX, enlargedY, card);
                enlargedCard.setScale(0.8); // Larger scale
                enlargedCard.setDepth(100); // Ensure it's above other game elements
                this.enlargedCardSprites.push(enlargedCard);
            }
        });
    }

    // Add method to update enlarged cards separately if needed
    private updateEnlargedCards() {
        const localPlayer = this.gameState?.players.find(p => p.id === this.room?.sessionId);
        if (!localPlayer || !localPlayer.cards) return;

        // Clear existing enlarged cards
        this.enlargedCardSprites.forEach(sprite => sprite.destroy());
        this.enlargedCardSprites = [];

        // Create new enlarged cards
        localPlayer.cards.forEach((card, index) => {
            const x = 100 + index * 80;
            const y = this.game.canvas.height - 100;
            const enlargedCard = this.add.sprite(x, y, card);
            enlargedCard.setScale(0.8);
            enlargedCard.setDepth(100);
            this.enlargedCardSprites.push(enlargedCard);
        });
    }

    private displayLocalPlayerCards() {
        if (!this.gameState) return;
        
        // Find the local player in the game state
        const localPlayerIndex = this.getLocalPlayerIndex();
        if (localPlayerIndex < 0) return;
        
        const localPlayer = this.gameState.players[localPlayerIndex];
        if (!localPlayer || !localPlayer.cards || localPlayer.cards.length === 0) return;
        
        // Clear any existing local card sprites
        const existingCards = this.children.getAll().filter(obj => 
            obj.name && obj.name.startsWith('local-card-'));
        existingCards.forEach(card => card.destroy());
        
        // Position for the local player's cards in the bottom-left corner
        const startX = 100;
        const startY = c.GAME_HEIGHT - 100;
        
        // Display the cards with a slight overlap
        localPlayer.cards.forEach((card: Card, index: number) => {
            const cardSprite = this.add.sprite(
                startX + (index * 60), 
                startY,
                card.name
            ).setScale(0.75);
            
            // Set a name to identify these sprites later
            cardSprite.setName(`local-card-${index}`);
            
            // Add a slight animation for the cards being dealt
            cardSprite.setAlpha(0);
            cardSprite.y = startY + 50;
            
            this.tweens.add({
                targets: cardSprite,
                y: startY,
                alpha: 1,
                duration: 300,
                delay: index * 150,
                ease: 'Back.easeOut'
            });
        });
    }
    private updateActionButtons(isMyTurn: boolean) {
        // If we don't have action buttons or disabled buttons, exit early
        if (!this.sceneUI.actionButtons || !this.sceneUI.disabledButtons) return;
        
        console.log(`Updating action buttons, isMyTurn: ${isMyTurn}`);
        
        // Get valid actions based on the current game state
        const validActions = isMyTurn ? this.getValidActions(this.gameState?.currentBet || 0) : [];
        
        // List of all possible actions
        const allActions = ['fold', 'check', 'call', 'bet', 'raise'];
        
        // Update each action button
        allActions.forEach(action => {
            const actionButton = this.sceneUI.actionButtons?.[action as keyof typeof this.sceneUI.actionButtons];
            const disabledButton = this.sceneUI.disabledButtons?.[`${action}Disabled` as keyof typeof this.sceneUI.disabledButtons];
            
            if (actionButton && disabledButton) {
                // If it's my turn and the action is valid, show the action button
                if (isMyTurn && validActions.includes(action)) {
                    actionButton.setVisible(true);
                    disabledButton.setVisible(false);
                    
                    // Make sure the button is interactive
                    const buttonImage = actionButton.getAt(0) as Phaser.GameObjects.Image;
                    if (buttonImage) {
                        buttonImage.setInteractive({ useHandCursor: true });
                    }
                } 
                // Otherwise, show the disabled button
                else {
                    actionButton.setVisible(false);
                    disabledButton.setVisible(true);
                    
                    // Make sure the button is not interactive
                    const buttonImage = actionButton.getAt(0) as Phaser.GameObjects.Image;
                    if (buttonImage) {
                        buttonImage.disableInteractive();
                    }
                }
            }
        });
    }

    private updateUserBalance(newBalance: number) {
        if (this.userData) {
            
            // Update local userData
            this.userData.balance = newBalance;
            
            // Update display
            // ...
            
            // Emit event for React to handle
            const customEvent = new CustomEvent('phaser-balance-update', { 
                detail: { balance: newBalance, userId: this.userData.id }
            });
            window.dispatchEvent(customEvent);
        }
    }

    private getValidActions(currentBet: number): string[] {
        // If we don't have game state or it's not a betting phase, return empty array
        if (!this.gameState || 
            this.gameState.gamePhase === "waiting" || 
            this.gameState.gamePhase === "dealing" ||
            this.gameState.gamePhase === "showdown") {
            return [];
        }
        
        // Get the local player
        const localPlayerIndex = this.getLocalPlayerIndex();
        if (localPlayerIndex < 0) return [];
        
        const localPlayer = this.gameState.players[localPlayerIndex];
        if (!localPlayer || !localPlayer.canAct) return [];
        
        // Get the player's current bet
        const playerBet = localPlayer.currentBet || 0;
        
        // Calculate the call amount (difference between current bet and player's bet)
        const callAmount = currentBet - playerBet;
        
        // Initialize valid actions array
        const validActions: string[] = [];
        
        // Fold is always valid unless it's a check situation
        if (currentBet > 0) {
            validActions.push('fold');
        }
        
        // Check is valid only if there's no current bet to call
        if (currentBet === 0) {
            validActions.push('check');
        }
        
        // Call is valid if there's a bet to call and player has enough chips
        if (currentBet > 0 && localPlayer.chips > 0) {
            validActions.push('call');
        }
        
        // Bet is valid only if there's no current bet and player has chips
        if (currentBet === 0 && localPlayer.chips > 0) {
            validActions.push('bet');
        }
        
        // Raise is valid if there's a current bet and player has enough chips to raise
        if (currentBet > 0 && localPlayer.chips > callAmount) {
            validActions.push('raise');
        }
        
        console.log(`Valid actions for player: ${validActions.join(', ')}`);
        return validActions;
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
        if (this.sceneUI.sceneMessages && this.sceneUI.sceneMessages.waitingMessage)
            this.tweens.add({
                targets: this.sceneUI.sceneMessages.waitingMessage,
                alpha: 0,           // Fade to completely transparent
                duration: 1000,     // Duration in milliseconds (1 second)
                ease: 'Power2',     // Easing function (many options available)
                delay: 2000,        // Optional: wait 2 seconds before starting fade
                onComplete: function() {
                    this.sceneUI.sceneMessages.waitingMessage.setVisible(false);
                }
            });
    }

    private showGameStartedMessage() {
        if (this.sceneUI.sceneMessages && this.sceneUI.sceneMessages.gameStartedMessage) {
            this.sceneUI.sceneMessages.gameStartedMessage.setVisible(true);
            this.tweens.add({
                targets: this.sceneUI.sceneMessages.gameStartedMessage,
                alpha: 0,
                duration: 1000,
                ease: 'Power2',
                delay: 3000,
                onComplete: function() {
                    this.sceneUI.sceneMessages.gameStartedMessage.setVisible(false);
                }
            });
        }
    }

    private startGameAnimation() {
        // Play card dealing animation
        this.sound.play('cardFlip');
        
        // After animation completes, update the game display
        this.time.delayedCall(500, () => {
            if (this.gameState) {
                // Make sure the game display is updated with the latest state
                this.updateGameDisplay();
                
                // Ensure the first active player is highlighted
                this.highlightActivePlayer();
                
                console.log("Game started, first active player highlighted");
            }
        });
    }

    private showHandResult(result: any) {
        // TODO Implement showing hand result
    }

    private updatePhaseDisplay(phase: string) {
        // TODO Implement phase display update
    }

    private setupUserDataListener() {
        // Listen for user data updates from React
        EventBus.on('user-data-updated', (newUserData: IUserData) => {
            console.log('User data updated in PokerGame:', newUserData);
            this.userData = newUserData;
            // Update any UI that shows user data
            this.displayUserInfo();
        });
    }

    // Make sure to also clean up the event listener when the scene is destroyed
    shutdown() {
        console.log("PokerGame scene shutdown");
        
        // Clean up all interactive elements before shutting down
        if (this.sceneUI.readyButton) {
            this.sceneUI.readyButton.removeInteractive();
        }
        
        if (this.sceneUI.actionButtons) {
            Object.values(this.sceneUI.actionButtons).forEach(button => {
                if (button) button.removeInteractive();
            });
        }
        
        // Disable input manager to prevent callbacks
        this.input.enabled = false;
        
        // Disconnect from the room
        if (this.room) {
            this.room.leave();
            this.room.removeAllListeners();
            this.room = null;
        }
        
        // Clear event listeners
        this.events.removeAllListeners();
        
        // Clear game state
        this.gameState = null;

        // Clean up enlarged card sprites
        this.enlargedCardSprites.forEach(sprite => sprite.destroy());
        this.enlargedCardSprites = [];
    }

    // Handle visibility changes to prevent gl errors
    handleVisibilityChange(isVisible: boolean) {
        console.log(`PokerGame scene visibility changed: ${isVisible}`);
        
        // When visibility changes, make sure to clean up any problematic interactive objects
        if (!isVisible) {
            // Temporarily disable all interactive objects to prevent input issues
            this.input.enabled = false;
        } else {
            // Re-enable input when coming back to the game
            this.input.enabled = true;
            
            // Refresh the scene's display
            if (this.gameState) {
                this.updateGameDisplay();
            }
        }
    }

    private highlightActivePlayer() {
        // First, remove any existing highlights and turn indicators
        this.children.list
            .filter(obj => obj.name && (obj.name.startsWith('player-highlight-') || obj.name.startsWith('turn-text-')))
            .forEach(obj => obj.destroy());
        
        // If we don't have game state or players, exit early
        if (!this.gameState || !this.gameState.players || this.gameState.players.length === 0) {
            return;
        }
        
        // Find the active player (the one whose turn it is)
        const activePlayerIndex = this.gameState.currentPlayerTurn;
        
        // If there's a valid active player
        if (activePlayerIndex >= 0 && activePlayerIndex < this.gameState.players.length) {
            // Get the active player
            const activePlayer = this.gameState.players[activePlayerIndex];
            
            // Only highlight if the player can act
            if (activePlayer && activePlayer.canAct) {
                console.log(`Highlighting active player: ${activePlayer.name} (index: ${activePlayerIndex})`);
                
                // Get the position for this player
                const position = this.getPlayerPosition(activePlayerIndex, this.gameState.players.length);
                
                // Create a highlight circle around the active player
                const highlight = this.add.circle(
                    position.x,
                    position.y,
                    60, // Radius slightly larger than the player avatar
                    0x00ff00, // Green color
                    0.3 // Alpha transparency
                );
                highlight.setName(`player-highlight-${activePlayerIndex}`);
                
                // Add a pulsing animation to draw attention
                this.tweens.add({
                    targets: highlight,
                    alpha: { from: 0.3, to: 0.6 },
                    duration: 800,
                    yoyo: true,
                    repeat: -1
                });
                
                // Add "YOUR TURN" text only for the local player
                if (activePlayerIndex === this.getLocalPlayerIndex()) {
                    const turnText = this.add.text(
                        position.x,
                        position.y - 80,
                        "YOUR TURN",
                        {
                            fontFamily: 'Arial',
                            fontSize: '18px',
                            color: '#FFFFFF',
                            stroke: '#000000',
                            strokeThickness: 4,
                            align: 'center'
                        }
                    ).setOrigin(0.5);
                    turnText.setName(`turn-text-${activePlayerIndex}`);
                    
                    // Add a slight bounce animation
                    this.tweens.add({
                        targets: turnText,
                        y: position.y - 85,
                        duration: 500,
                        yoyo: true,
                        repeat: -1,
                        ease: 'Sine.easeInOut'
                    });
                    
                    // Play a notification sound
                    this.sound.play('notification');
                }
            } else {
                console.log(`Player ${activePlayerIndex} cannot act right now`);
            }
        } else {
            console.log("No active player found or invalid player index");
        }
    }

    private displayPlayerTokens(playerIndex: number, position: {x: number, y: number}, totalPlayers: number) {
        if (!this.gameState) return;

        const tokenScale = 0.5;
        const tokenOffset = 40; // Base offset from player position

        // Calculate if this player has any special positions
        const isDealer = playerIndex === this.gameState.dealerIndex;
        const isSmallBlind = playerIndex === (this.gameState.dealerIndex + 1) % totalPlayers;
        const isBigBlind = playerIndex === (this.gameState.dealerIndex + 2) % totalPlayers;

        // Calculate positions for each token type
        const tokenPositions = {
            dealer: { x: position.x - tokenOffset, y: position.y - tokenOffset },
            smallBlind: { x: position.x + tokenOffset, y: position.y - tokenOffset },
            bigBlind: { x: position.x + tokenOffset, y: position.y + tokenOffset }
        };

        // Special case for 2 players where one player might be both dealer and big blind
        if (totalPlayers === 2 && isDealer && isBigBlind) {
            // Adjust positions to prevent overlap
            tokenPositions.dealer.x = position.x - tokenOffset;
            tokenPositions.dealer.y = position.y - tokenOffset;
            tokenPositions.bigBlind.x = position.x + tokenOffset;
            tokenPositions.bigBlind.y = position.y + tokenOffset;
        }

        // Display dealer token
        if (isDealer) {
            const dealerToken = this.add.sprite(tokenPositions.dealer.x, tokenPositions.dealer.y, 'd-token')
                .setScale(tokenScale)
                .setName(`token-dealer-${playerIndex}`);
        }

        // Display small blind token
        if (isSmallBlind) {
            const sbToken = this.add.sprite(tokenPositions.smallBlind.x, tokenPositions.smallBlind.y, 'sb-token')
                .setScale(tokenScale)
                .setName(`token-sb-${playerIndex}`);
        }

        // Display big blind token
        if (isBigBlind) {
            const bbToken = this.add.sprite(tokenPositions.bigBlind.x, tokenPositions.bigBlind.y, 'bb-token')
                .setScale(tokenScale)
                .setName(`token-bb-${playerIndex}`);
        }
    }

    update(time: number, delta: number) {
        // Check if we're waiting for players
        if (this.gameState && this.gameState.gamePhase === "waiting") {
            // Show waiting message if we have fewer than 2 players
            if (this.gameState.players.length < 2 && 
                this.sceneUI.sceneMessages && 
                this.sceneUI.sceneMessages.waitingMessage) {
                
                this.sceneUI.sceneMessages.waitingMessage.setVisible(true);
                
                // Make sure the ready button is visible if it exists
                if (this.sceneUI.readyButton) {
                    this.sceneUI.readyButton.setVisible(true);
                }
            } else if (this.sceneUI.sceneMessages && 
                      this.sceneUI.sceneMessages.waitingMessage) {
                // Hide waiting message if we have enough players
                this.sceneUI.sceneMessages.waitingMessage.setVisible(false);
            }
        }
        
        // Any other continuous updates can go here
    }
}
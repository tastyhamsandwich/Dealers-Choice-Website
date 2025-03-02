import { Scene } from 'phaser';
import { Card, Deck, Hand, Table, Player } from '../lib/classes';
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin';
import { GameConfig, GamePhase, PlayerAction } from '../lib/types';
import * as funcs from '../lib/utils';
import * as CONSTS from '../lib/constants';

const c = CONSTS;

export class SingleGame extends Scene
{
    rexUI: RexUIPlugin;
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    msg_text : Phaser.GameObjects.Text;
    gameConfig: GameConfig;
    table: Table;
    cards: Phaser.GameObjects.Image[] = [];
    chipsDisplay: Phaser.GameObjects.Text;
    potDisplay: Phaser.GameObjects.Text;
    private actionButtons: Phaser.GameObjects.Text[] = [];
    cardsDealtDebug: boolean = false;
    amountToBet: number = 0;
    layerUI: Phaser.GameObjects.Layer;
    layerGameUI: Phaser.GameObjects.Layer;
    layerActionButtons: Phaser.GameObjects.Layer;
    layerBettingElements: Phaser.GameObjects.Layer;
    

    constructor ()
    {
        super('SingleGame');
    }

    create ()
    {

        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x000000);

        this.background = this.add.image(c.GAME_X_MID, c.GAME_Y_MID, 'background').setOrigin(0.5).setAlpha(0.5,0.5,1.0,0.1);

        this.add.image(c.GAME_X_MID, c.GAME_Y_MID, 'table').setOrigin(0.5);

        const player1 = new Player('Player 1', 100, this);
        const player2 = new Player('Player 2', 100, this);

        // Initialize table with Texas Hold'em configuration
        const gameConfig: GameConfig = {
            variant: 'TexasHoldEm',
            cardsPerPlayer: 2,
            numberOfFlops: 1,
            numberOfTurns: 1,
            numberOfRivers: 1
        };

        this.gameConfig = gameConfig;

        this.table = new Table(this, 5, 10, 2, 6, 100, 2000);
        this.table.addPlayer(player1);
        this.table.addPlayer(player2);


        // Add UI elements      
        const layerUI = this.createUIElements();
        const layerGameUI = this.createGameUIElements();
        const layerActionButtons = this.createActionButtons();
        const layerBettingElements = this.createBettingElements();

        layerUI.setVisible(true);

        if (layerUI) {

          const dealButton      = layerUI.getAt(0);
          const mainMenuButton  = layerUI.getAt(1);
          const evalButton      = layerUI.getAt(2);
          const chipsDebugBtn   = layerUI.getAt(3);

          chipsDebugBtn.on('pointerdown', () => {
            if (this.table.players[0]) {
              this.table.players[0].chips += 1000;
            }
        });

          dealButton.on('pointerdown', () => {
            if (this.table.gameState === GamePhase.IDLE) {
              //this.startNewHand();
              
              if (layerActionButtons)
                layerActionButtons.setVisible(true);
              if (layerGameUI)
                layerGameUI.setVisible(true);
              
            }
          });

          evalButton.on('pointerdown', () => {
            if (this.cardsDealtDebug) {
              //const boardCards = [...this.table.board.flops[0],...this.table.board.turns,...this.table.board.rivers];
              let p1Cards: Card[] = [];
              let p2Cards: Card[] = [];
              
              if (this.table.players[0].cards)
                p1Cards = [...this.table.players[0].cards];
              if (this.table.players[1].cards)
                p2Cards = [...this.table.players[1].cards];
              
              //const p1Hand = new Hand([...p1Cards, ...boardCards]);
              //const p2Hand = new Hand([...p2Cards, ...boardCards]);

              //const p1Eval = funcs.evaluateHand(p1Hand);
              //const p2Eval = funcs.evaluateHand(p2Hand);

              //console.log(`P1 Cards: ${p1Hand.cards.length} | ${JSON.stringify(p1Hand)}`);
              //console.log(`P2 Cards: ${p2Hand.cards.length} | ${JSON.stringify(p2Hand)}`);
              //console.log(`Player 1: ${p1Eval.string} (${p1Eval.value})`);
              //console.log(`Player 2: ${p2Eval.string} (${p2Eval.value})`);

              //if (p1Eval.rank > p2Eval.rank)
              //  console.log('Player 1 wins!');
              //else if (p1Eval.rank < p2Eval.rank)
              //  console.log('Player 2 wins!');
              //else
              //  console.log('It\'s a tie!');
            }
          }); 

          mainMenuButton.on('pointerdown', () => {
            this.scene.start('MainMenu');
          });
        }
        // Add event listener for player actions completion
        /*
        this.events.on('playerActionsComplete', () => {
          
            if (this.table.players[this.table.activePlayerIndex].currentBet > 0)
              this.table.collectBet(this.table.players[this.table.activePlayerIndex]);

            // Move to next player
            this.table.activePlayerIndex = this.table.getNextActivePlayer();

            // Check if betting round is complete after player action
            if (this.table.isBettingComplete()) {
                this.events.emit('bettingRoundComplete');
            }
            this.actionButtons.forEach(button => button.setVisible(false));
            this.updateUI();
        });

        this.events.on('bettingRoundComplete', () => {
            // Collect bets into pot
            this.table.collectBets();

            // Hide action buttons during phase transition

            switch (this.table.gameState) {
                case GameState.PREFLOP:
                    this.table.gameState = GameState.FLOP;
                    this.table.dealCards(this);
                    break;
                case GameState.FLOP:
                    this.table.gameState = GameState.TURN;
                    this.table.dealCards(this);
                    break;
                case GameState.TURN:
                    this.table.gameState = GameState.RIVER;
                    this.table.dealCards(this);
                    break;
                case GameState.RIVER:
                    this.table.gameState = GameState.SHOWDOWN;
                    this.table.determineWinner();
                    this.table.gameState = GameState.IDLE;
                    return;
            }
            
            // Reset for next betting round
            this.table.activePlayerIndex = 0;
            this.table.currentBet = 0;
            this.showActionButtons();
        });
    }

    update() {

      this.chipsDisplay.text = this.table.players[0].currentChips.toString();
      this.potDisplay.text = this.table.pot.toString();
    }

    private startNewHand(): void {
        this.table.clearTable();
        this.table.dealCards(this);
        
        // Post blinds
        this.table.players[this.table.smallBlindToken].placeBet(this.table.smallBlindAmount);
        this.table.players[this.table.bigBlindToken].placeBet(this.table.bigBlindAmount);
        
        this.table.gameState = GameState.PREFLOP;
        this.showActionButtons();
    }

    private handlePlayerAction(action: PlayerAction): void {
        const player = this.table.players[this.table.activePlayerIndex];
        
        switch (action) {
            case 'Check':
                if (player.currentBet === this.table.currentBet) {
                    this.table.processBettingRound();
                }
                break;
            case 'Call':
                const callAmount = this.table.currentBet - player.currentBet;
                if (player.placeBet(callAmount)) {
                    this.table.processBettingRound();
                }
                break;
            case 'Bet':
                // Add bet amount input logic here
                this.toggleBetButtonVisibility();
                /**
                  const betAmt = this.amountToBet;
                  if (player.placeBet(betAmt)) {
                      this.table.currentBet = betAmt;
                      this.table.processBettingRound();
                      this.toggleBetButtonVisibility();
                  }
                */
               /*
                break;
            case 'Fold':
                player.fold();
                this.table.processBettingRound();
                break;
        }
        
        this.updateUI();*/
    }

    private updateUI(): void {
        // Update chip counts, pot size, current bet, etc.
        this.chipsDisplay.text = `${this.table.players[0].chips}`;
        // Add more UI updates as needed
    }

    private showActionButtons(): void {
        this.actionButtons.forEach(button => button.setVisible(true));
    }

    private toggleBetButtonVisibility(): void {
      
      if (Phaser.Scene['Game'].plusOne.visible) {
        Phaser.Scene['Game'].plusOne.setVisible(false);
        Phaser.Scene['Game'].minusOne.setVisible(false);
        Phaser.Scene['Game'].plusFive.setVisible(false);
        Phaser.Scene['Game'].minusFive.setVisible(false);
        Phaser.Scene['Game'].plusTen.setVisible(false);
        Phaser.Scene['Game'].minusTen.setVisible(false);
        Phaser.Scene['Game'].betInputAmount.setVisible(false);
        Phaser.Scene['Game'].confirmBet.setVisible(false);
      } else {
        Phaser.Scene['Game'].plusOne.setVisible(true);
        Phaser.Scene['Game'].minusOne.setVisible(true);
        Phaser.Scene['Game'].plusFive.setVisible(true);
        Phaser.Scene['Game'].minusFive.setVisible(true);
        Phaser.Scene['Game'].plusTen.setVisible(true);
        Phaser.Scene['Game'].minusTen.setVisible(true);
        Phaser.Scene['Game'].betInputAmount.setVisible(true);
        Phaser.Scene['Game'].confirmBet.setVisible(true);
      }

    }

    textAreaChanged() {
        //var text = this.formUtil.getTextAreaValue("area51");
        //console.log(text);
    }

    createUIElements(): Phaser.GameObjects.Layer {

      const dealButton = this.add.text(c.GAME_WIDTH-100,50, 'DEAL', {
            fontFamily: 'Arial Black', fontSize: 48, color: '#ffffff',
            stroke: '#FF0000', strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5).setInteractive( { useHandCursor: true } )//.setVisible(false);

      const mainMenuButton = this.add.text(c.GAME_WIDTH - 250, 100, "Menu", {
          fontFamily: 'Arial Black', fontSize: 48, color: '#ffffff',
          stroke: '#00ffff', strokeThickness: 6,
          align: 'center'
      }).setOrigin(0.5).setInteractive( { useHandCursor: true } )//.setVisible(false);

      const evalButton = this.add.text(c.GAME_WIDTH-100, 200, 'EVAL', {
          fontFamily: 'Arial Black', fontSize: 48, color: '#ffffff',
          stroke: '#FF0000', strokeThickness: 6,
          align: 'center'
      }).setOrigin(0.5).setInteractive( { useHandCursor: true } )//.setVisible(false);

      const chipsDebugBtn = this.add.text(150, c.GAME_HEIGHT-100, "Add Chips", {
          fontFamily: 'Arial Black', fontSize: 36, color: '#ffffff',
          stroke: '#00ffff', strokeThickness: 6,
          align: 'center'
      }).setOrigin(0.5).setInteractive( { useHandCursor: true } )//.setVisible(false);
    
      

      const layerUI = this.add.layer();
      layerUI.add([dealButton, mainMenuButton, evalButton, chipsDebugBtn]);
      layerUI.setVisible(false);
      
      return layerUI;
    }

    createGameUIElements(): Phaser.GameObjects.Layer {
        
        const chipsLabel = this.add.text(25, 25, 'Chips: ', {
            fontFamily: 'Courier New', fontSize: 30, color: '#ffffff',
            stroke: '#000000', strokeThickness: 3, fontStyle: 'bold',
            align: 'left'
        }).setOrigin(0.0)//.setVisible(false);

        const potLabel = this.add.text(25, 60, 'Pot Size: ', {
            fontFamily: 'Courier New', fontSize: 30, color: '#ffffff',
            stroke: '#000000', strokeThickness: 3, fontStyle: 'bold',
            align: 'left'
        }).setOrigin(0.0)//.setVisible(false);

        this.chipsDisplay = this.add.text(150, 28, `${this.table.players[0].chips.toString()}`, {
            fontFamily: 'Courier New', fontSize: 30, color: '#ffffff',
            stroke: '#000000', strokeThickness: 3,
            align: 'left'
        }).setOrigin(0.0)//.setVisible(false);
        
        this.potDisplay = this.add.text(200, 63, `${this.table.pot.toString()}`, {
          fontFamily: 'Courier New', fontSize: 30, color: '#ffffff',
          stroke: '#000000', strokeThickness: 3,
          align: 'left'
        }).setOrigin(0.0)//.setVisible(false);

        const layerGameUI = this.add.layer();
        layerGameUI.add([chipsLabel, potLabel, this.chipsDisplay, this.potDisplay]);
        layerGameUI.setVisible(false);

        return layerGameUI;
    }

    createActionButtons(): Phaser.GameObjects.Layer {

        const checkButton = this.add.text(400, c.GAME_HEIGHT - 50, 'Check', {
          font: 'Tahoma', fontSize: '24px', fontStyle: 'bold', color: '#ffffff', stroke: '#000000', strokeThickness: 2, align: 'center'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true })//.setVisible(false);
        
        const callButton = this.add.text(550, c.GAME_HEIGHT - 50, 'Call', {
          font: 'Tahoma', fontSize: '24px', fontStyle: 'bold', color: '#ffffff', stroke: '#000000', strokeThickness: 2, align: 'center'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true })//.setVisible(false);

        const betButton = this.add.text(700, c.GAME_HEIGHT - 50, 'Bet', {
          font: 'Tahoma', fontSize: '24px', fontStyle: 'bold', color: '#ffffff', stroke: '#000000', strokeThickness: 2, align: 'center'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        const raiseButton = this.add.text(850, c.GAME_HEIGHT - 50, 'Raise', {
          font: 'Tahoma', fontSize: '24px', fontStyle: 'bold', color: '#ffffff', stroke: '#000000', strokeThickness: 2, align: 'center'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true })//
        const foldButton = this.add.text(1000, c.GAME_HEIGHT - 50, 'Fold', {
          font: 'Tahoma', fontSize: '24px', fontStyle: 'bold', color: '#ffffff', stroke: '#000000', strokeThickness: 2, align: 'center'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true })//.setVisible(false);

        const layerActionButtons = this.add.layer();
        layerActionButtons.add([checkButton, callButton, betButton, raiseButton, foldButton]);
        layerActionButtons.setVisible(false);

        return layerActionButtons;

        
    }

    createBettingElements(): Phaser.GameObjects.Layer {

      const plusOne = this.add.text(725, c.GAME_HEIGHT - 200, '+1', {
            font: 'Courier New', fontSize: '24px', backgroundColor: '#444', color: '#fff', stroke: '#000', strokeThickness: 2, align: 'center'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true})//.setVisible(false);

        const minusOne = this.add.text(675, c.GAME_HEIGHT - 200, '-1', {
          font: 'Courier New', fontSize: '24px', backgroundColor: '#444', color: '#fff', stroke: '#000', strokeThickness: 2, align: 'center'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true})//.setVisible(false);

        const plusFive = this.add.text(725, c.GAME_HEIGHT - 150, '+5', {
          font: 'Courier New', fontSize: '24px', backgroundColor: '#444', color: '#fff', stroke: '#000', strokeThickness: 2, align: 'center'         
        }).setOrigin(0.5).setInteractive({ useHandCursor: true})//.setVisible(false);

        const minusFive = this.add.text(675, c.GAME_HEIGHT - 150, '-5', {
          font: 'Courier New', fontSize: '24px', backgroundColor: '#444', color: '#fff', stroke: '#000', strokeThickness: 2, align: 'center'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true})//.setVisible(false);
        
        const plusTen = this.add.text(725, c.GAME_HEIGHT - 100, '+10', {
          font: 'Courier New', fontSize: '24px', backgroundColor: '#444', color: '#fff', stroke: '#000', strokeThickness: 2, align: 'center'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true})//.setVisible(false);

        const minusTen = this.add.text(675, c.GAME_HEIGHT - 100, '-10', {
          font: 'Courier New', fontSize: '24px', backgroundColor: '#444', color: '#fff', stroke: '#000', strokeThickness: 2, align: 'center'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true})//.setVisible(false);
    
        const betInputAmount = this.add.text(700, c.GAME_HEIGHT - 250, this.amountToBet.toString(), {
          font: 'Courier New', fontSize: '32px', backgroundColor: '#444', color: '#fff', stroke: '#00ffff', strokeThickness: 2, align: 'center'
        }).setOrigin(0.5)//.setVisible(false);

        const confirmBet = this.add.text(755, c.GAME_HEIGHT - 150, 'Confirm', {
          font: 'Courier New', fontSize: '24px', backgroundColor: '#444', color: '#fff', stroke: '#000', strokeThickness: 2, align: 'center'
        }).setOrigin(0.5)//.setVisible(false);

        const layerBettingElements = this.add.layer();
        layerBettingElements.add([plusOne, minusOne, plusFive, minusFive, plusTen, minusTen, confirmBet, betInputAmount]);
        layerBettingElements.setVisible(false);

        return layerBettingElements;

        plusOne.on('pointerdown', () => {
          this.amountToBet += 1;
          betInputAmount.text = this.amountToBet.toString();
        });

        minusOne.on('pointerdown', () => {
          this.amountToBet -= 1;
          betInputAmount.text = this.amountToBet.toString();
        });

        plusFive.on('pointerdown', () => {
          this.amountToBet += 5;
          betInputAmount.text = this.amountToBet.toString();
        });

        minusFive.on('pointerdown', () => {
          this.amountToBet -= 5;
          betInputAmount.text = this.amountToBet.toString();
        });

        plusTen.on('pointerdown', () => {
          this.amountToBet += 10;
          betInputAmount.text = this.amountToBet.toString();
        });

        minusTen.on('pointerdown', () => {  
          this.amountToBet -= 10;
          betInputAmount.text = this.amountToBet.toString();
        });

        confirmBet.on('pointerdown', () => {
          this.amountToBet = parseInt(betInputAmount.text);
          //const player = this.table.players[this.table.activePlayerIndex];
          const betAmt = this.amountToBet;
          //if (player.placeBet(betAmt)) {
            //this.table.currentBet = betAmt;
            //this.table.processBettingRound();
            this.toggleBetButtonVisibility();
            this.amountToBet = 0;
            //this.events.emit('playerActionsComplete');
          //}
        });
    }

    
}
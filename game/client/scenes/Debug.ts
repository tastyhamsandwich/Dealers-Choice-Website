import { Cameras, Scene } from 'phaser';
import { Card, Deck, Hand } from '../lib/classes';
import { HandType, Result } from '../lib/types';
import { evaluateHand } from '../lib/utils';
import * as CONSTS from '../lib/constants';

const c = CONSTS;

export class Debug extends Scene {

  
  camera: Cameras.Scene2D.Camera | undefined;
  private deck: any;
  playerCards: any;
  evaluateText: string = '';
  private testCaseNum: number = 0;

  constructor() {
    super({key: 'Debug'});
  }
  create() {

    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0x000000);

    this.deck = new Deck();
    this.deck.shuffleDeck();

    const dealButton = this.add.text(c.GAME_X_MID,450, 'DEAL', {
            fontFamily: 'Arial Black', fontSize: 72, color: '#ffffff',
            stroke: '#FF0000', strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5).setInteractive();
        
    dealButton.on('pointerdown', () => {
      if (this.deck.cards.length < 5) {
        console.log('Not enough cards in the deck to deal a new hand. Regenerating and shuffling the deck.');
        this.shuffleDebug(this.deck);
      }
      const cards = this.dealDebug(this.deck);
      this.playerCards = new Hand(cards);
    });

    const evalMsg = this.add.text(c.GAME_X_MID, 200, this.evaluateText, {
      fontFamily: 'Arial Black', fontSize: 50, color: '#888',
      stroke: '#FFFFFF', strokeThickness: 2,
      align: 'center'
    })
    const evalButton = this.add.text(c.GAME_X_MID, 550, 'Evaluate', {
      fontFamily: 'Arial Black', fontSize: 72, color: '#ffffff',
      stroke: '#FF0000', strokeThickness: 6,
      align: 'center'
    }).setOrigin(0.5).setInteractive();

    evalButton.on('pointerdown', () => {
      const evalResponse = evaluateHand(this.playerCards);
      this.evaluateText = evalResponse.message;
      console.log(`Hand: ${evalResponse.message} | ${evalResponse.rank}`);
      evalMsg.text = this.evaluateText;
    });

    const shuffleButton = this.add.text(c.GAME_X_MID, 350, 'SHUFFLE', {
      fontFamily: 'Arial Black', fontSize: 50, color: '#ffffff',
      stroke: '#888888', strokeThickness: 6,
      align: 'center'
    }).setOrigin(0.5).setInteractive();

    shuffleButton.on('pointerdown', () => {
      this.shuffleDebug(this.deck);
      console.log(`Deck reshuffled. It now contains ${this.deck.cards.length} cards again.`);
    });

    const testCaseBtn = this.add.text(c.GAME_X_MID, 100, 'TEST CASES', {
      fontFamily: 'Arial Black', fontSize: 50, color: '#ffffff',
      stroke: '#888888', strokeThickness: 6,
      align: 'center'
    }).setOrigin(0.5).setInteractive();

    testCaseBtn.on('pointerdown', () => {
      const cards = this.dealTestCases();
      this.playerCards = new Hand(cards);
      this.testCaseNum++;
      if (this.testCaseNum > 10) this.testCaseNum = 0;
  });

}

  update() {
    //evalMsg.text = this.evaluateText;
    
    //this.deck.shuffleDeck();

  }

  shuffleDebug(deck: Deck) {
    deck.regenerateDeck();
    deck.shuffleDeck();
  }

  dealDebug(deck: Deck): HandType {
    let cardArray: Card[] = [];
    if (deck.cards.length < 5) {
      console.log('Not enough cards in the deck to deal a new hand.');
      return cardArray;
    }
    for (let i = 0; i < 5; i++) {
      const card = deck.cards.pop();
      if (card) {
        cardArray.push(card); // Ensure cards are added to cardArray
        let cardImg = this.add.image(100 + (200 * i), 800, card.name);

        cardImg.setDataEnabled();
        cardImg.data.set('name', card.name);
        cardImg.data.set('fullName', card.printFullName());

        console.log(`Card Dealt: ${card.printFullName()} - Cards Left in Deck: ${deck.cards.length}`);
      }
    }
    return cardArray; // Return the populated cardArray
  }

  dealTestCases(): HandType {

    
    const testCases = [
    [new Card('AH'), new Card('KH'), new Card('QH'), new Card('JH'), new Card('TH') ], 
    [new Card('7D'), new Card('4D'), new Card('6D'), new Card('8D'), new Card('5D') ],
    [new Card('3S'), new Card('TD'), new Card('3D'), new Card('3H'), new Card('3C') ],
    [new Card('QC'), new Card('9S'), new Card('QD'), new Card('9C'), new Card('QS') ],
    [new Card('8C'), new Card('4D'), new Card('5H'), new Card('7C'), new Card('6S') ],
    [new Card('4C'), new Card('2D'), new Card('AH'), new Card('5D'), new Card('3C') ],
    [new Card('QH'), new Card('3H'), new Card('8H'), new Card('TH'), new Card('4H') ],
    [new Card('6C'), new Card('2C'), new Card('6D'), new Card('9S'), new Card('6H') ],
    [new Card('AS'), new Card('4H'), new Card('7C'), new Card('7S'), new Card('4D') ],
    [new Card('AH'), new Card('AD'), new Card('KD'), new Card('3C'), new Card('5S') ],
    [new Card('QS'), new Card('6C'), new Card('7D'), new Card('JH'), new Card('5D') ]]

    for (let i = 0; i < 5; i++) {
      const card = testCases[this.testCaseNum][i];
      if (card) {
        let cardImg = this.add.image(100 + (200 * i), 800, card.name);

        cardImg.setDataEnabled();
        cardImg.data.set('name', card.name);
        cardImg.data.set('fullName', card.printFullName());

        console.log(`Card Dealt: ${card.printFullName()}`);
      }
    }
    return testCases[this.testCaseNum];
  }
}

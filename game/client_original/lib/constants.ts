import { CardSlots } from './types';

// Individual string chars for Ranks and Suits, as used in card filenames
export const RANK_CHARS = [ 'A', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K' ];
export const SUIT_CHARS = [ 'H', 'D', 'C', 'S' ];

export const RANK_VALUES = {
  two:    2,
  three:  3,
  four:   4,
  five:   5,
  six:    6,
  seven:  7,
  eight:  8,
  nine:   9,
  ten:    10,
  jack:   11,
  queen:  12,
  king:   13,
  ace:    14,
  wild:   100
}

export const SUIT_VALUES = {
  clubs:    1,
  diamonds: 2,
  hearts:   3,
  spades:   4
}

export const SUIT = {
  HEARTS:   'hearts',
  DIAMONDS: 'diamonds',
  CLUBS:    'clubs',
  SPADES:   'spades'
}

export const RANK = {
  ACE:    'ace',
  TWO:    'two',
  THREE:  'three',
  FOUR:   'four',
  FIVE:   'five',
  SIX:    'six',
  SEVEN:  'seven',
  EIGHT:  'eight',
  NINE:   'nine',
  TEN:    'ten',
  JACK:   'jack',
  QUEEN:  'queen',
  KING:   'king',
  WILD:   'wild'
}

export enum GAME_PHASE {
  DEAL          = 1,
  PRE_FLOP      = 2,
  FLOP          = 3,
  PRE_TURN      = 4,
  TURN          = 5,
  PRE_RIVER     = 6,
  RIVER         = 7,
  PRE_SHOWDOWN  = 8,
  SHOWDOWN      = 9,
  END_OF_ROUND  = 10
}

export enum ACTIONS {
  BET     = 'Bet',
  CHECK   = 'Check',
  FOLD    = 'Fold',
  CALL    = 'Call',
  RAISE   = 'Raise',
  ALL_IN  = 'All In',
}
// Game window dimensions
export const GAME_WIDTH   = 1900;
export const GAME_HEIGHT  = 1000;

// Game window locations for X axis (Half, Quarters, Thirds, Fifths)
export const GAME_X     =  GAME_WIDTH;
export const GAME_X_MID =  GAME_WIDTH  / 2;
export const GAME_X_1H  =  GAME_WIDTH  / 2;
export const GAME_X_1Q  =  GAME_WIDTH  / 4;
export const GAME_X_3Q  = (GAME_WIDTH  / 4) * 3;
export const GAME_X_1T  =  GAME_WIDTH  / 3;
export const GAME_X_2T  = (GAME_WIDTH  / 3) * 2;
export const GAME_X_1F  =  GAME_WIDTH  / 5;
export const GAME_X_2F  = (GAME_WIDTH  / 5) * 2;
export const GAME_X_3F  = (GAME_WIDTH  / 5) * 3;
export const GAME_X_4F  = (GAME_WIDTH  / 5) * 4;

// Game window locations for Y axis (Half, Quarters, Thirds, Fifths)
export const GAME_Y     =  GAME_HEIGHT;
export const GAME_Y_MID =  GAME_HEIGHT  / 2;
export const GAME_Y_1H  =  GAME_HEIGHT  / 2;
export const GAME_Y_1Q  =  GAME_HEIGHT  / 4;
export const GAME_Y_3Q  = (GAME_HEIGHT  / 4) * 3;
export const GAME_Y_1T  =  GAME_HEIGHT  / 3;
export const GAME_Y_2T  = (GAME_HEIGHT  / 3) * 2;
export const GAME_Y_1F  =  GAME_HEIGHT  / 5;
export const GAME_Y_2F  = (GAME_HEIGHT  / 5) * 2;
export const GAME_Y_3F  = (GAME_HEIGHT  / 5) * 3;
export const GAME_Y_4F  = (GAME_HEIGHT  / 5) * 4;

// Poker Table asset dimensions
export const TABLE_WIDTH  = 1250;
export const TABLE_HEIGHT = 1100;

// Card asset dimensions
export const CARD_WIDTH  = 142;
export const CARD_HEIGHT = 212;

// Starting location for Player One's pocket cards
export const PLAYER_ONE_CARDS = { 
  x: (GAME_WIDTH / 2), 
  y: (GAME_HEIGHT - (GAME_HEIGHT / 5)) 
};

// Starting location for main window display of pocket cards
export const POCKET_CARDS_DISPLAY = {
  x: (GAME_WIDTH  - (GAME_WIDTH / 10)),
  y: (GAME_HEIGHT - (GAME_HEIGHT / 5))
};

// Starting location for main window display of board cards
export const COMMUNITY_CARDS_DISPLAY = {
  x: (GAME_WIDTH - (GAME_WIDTH / 3)),
  y: (0 + (GAME_HEIGHT / 10))
};

// Card locations for various players and boards, dpeending on game type
export const CARD_SLOTS: CardSlots = {
        players: {
          p1: {
            TexasHoldEm: [
              { x: (GAME_X_MID - 100), y: (GAME_HEIGHT - 100)},
              { x: (GAME_X_MID + 100), y: (GAME_HEIGHT - 100)}
            ],
            Omaha: [
              { x: 0, y: 0 },
              { x: 0, y: 0 },
              { x: 0, y: 0 },
              { x: 0, y: 0 },
            ],
          },
          p2: {
            TexasHoldEm: [
              { x: 200, y: (GAME_Y_MID)},
              { x: 300, y: (GAME_Y_MID)}
            ],
            Omaha: [
              { x: 0, y: 0 },
              { x: 0, y: 0 },
              { x: 0, y: 0 },
              { x: 0, y: 0 },
            ],
          },
          p3: {
            TexasHoldEm: [
              { x: (GAME_X_MID - 50), y: (100)},
              { x: (GAME_X_MID + 50), y: (100)}
            ],
            Omaha: [
              { x: 0, y: 0 },
              { x: 0, y: 0 },
              { x: 0, y: 0 },
              { x: 0, y: 0 },
            ],
          },
          p4: {
            TexasHoldEm: [
              { x: (GAME_X_MID + 200), y: (GAME_Y_MID)},
              { x: (GAME_X_MID + 300), y: (GAME_Y_MID)}
            ],
            Omaha: [
              { x: 0, y: 0 },
              { x: 0, y: 0 },
              { x: 0, y: 0 },
              { x: 0, y: 0 },
            ],
          },
          p5: {
            TexasHoldEm: [
              { x: (GAME_X_MID - 300), y: (GAME_Y_MID)},
              { x: (GAME_X_MID - 200), y: (GAME_Y_MID)}
            ],
            Omaha: [
              { x: 0, y: 0 },
              { x: 0, y: 0 },
              { x: 0, y: 0 },
              { x: 0, y: 0 },
            ],
          },
          p6: {
            TexasHoldEm: [
              { x: (GAME_X_MID - 300), y: (GAME_Y_MID)},
              { x: (GAME_X_MID - 200), y: (GAME_Y_MID)}
            ],
            Omaha: [
              { x: 0, y: 0 },
              { x: 0, y: 0 },
              { x: 0, y: 0 },
              { x: 0, y: 0 },
            ],
          },
        },
        boards: {
          TexasHoldEm: {
            flop: [ 
              { x: GAME_X_MID - 300, y: GAME_Y_MID },
              { x: GAME_X_MID - 200, y: GAME_Y_MID },
              { x: GAME_X_MID - 100, y: GAME_Y_MID }],
            turn:   { x: GAME_X_MID + 150, y: GAME_Y_MID },
            river:  { x: GAME_X_MID + 300, y: GAME_Y_MID },
          },
          Omaha: {
            flop: [ 
              { x: GAME_X_MID - 300, y: GAME_Y_MID },
              { x: GAME_X_MID - 200, y: GAME_Y_MID },
              { x: GAME_X_MID - 100, y: GAME_Y_MID }],
            turn:   { x: GAME_X_MID + 200, y: GAME_Y_MID },
            river:  { x: GAME_X_MID + 350, y: GAME_Y_MID },
          },
          OmahaHiLo: {
            flop: [ 
              { x: GAME_X_MID - 300, y: GAME_Y_MID },
              { x: GAME_X_MID - 200, y: GAME_Y_MID },
              { x: GAME_X_MID - 100, y: GAME_Y_MID }],
            turn:   { x: GAME_X_MID + 200, y: GAME_Y_MID },
            river:  { x: GAME_X_MID + 350, y: GAME_Y_MID },}
        },
        
      };

export const ALL_CARD_NAMES = [
    'AH', '2H', '3H', '4H', '5H', '6H', '7H', '8H', '9H', 'TH', 'JH', 'QH', 'KH',
    'AD', '2D', '3D', '4D', '5D', '6D', '7D', '8D', '9D', 'TD', 'JD', 'QD', 'KD',
    'AC', '2C', '3C', '4C', '5C', '6C', '7C', '8C', '9C', 'TC', 'JC', 'QC', 'KC',
    'AS', '2S', '3S', '4S', '5S', '6S', '7S', '8S', '9S', 'TS', 'JS', 'QS', 'KS'
];


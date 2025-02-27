import { Card, Player } from './classes';

export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type SuitCapitalized = 'Hearts' | 'Diamonds' | 'Clubs' | 'Spades';

export type Rank = 'ace' | 'two' | 'three' | 'four' | 'five' | 'six' | 'seven' | 'eight' | 'nine' | 'ten' | 'jack' | 'queen' | 'king' | 'wild';
export type RankCapitalized = 'Ace' | 'Two' | 'Three' | 'Four' | 'Five' | 'Six' | 'Seven' | 'Eight' | 'Nine' | 'Ten' | 'Jack' | 'Queen' | 'King' | 'Wild';

export type RankValue = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 100;

export type CardName = 'AH' | '2H' | '3H' | '4H' | '5H' | '6H' | '7H' | '8H' | '9H' | 'TH' | 'JH' | 'QH' | 'KH' | 'AD' | '2D' | '3D' | '4D' | '5D' | '6D' | '7D' | '8D' | '9D' | 'TD' | 'JD' | 'QD' | 'KD' | 'AC' | '2C' | '3C' | '4C' | '5C' | '6C' | '7C' | '8C' | '9C' | 'TC' | 'JC' | 'QC' | 'KC' | 'AS' | '2S' | '3S' | '4S' | '5S' | '6S' | '7S' | '8S' | '9S' | 'TS' | 'JS' | 'QS' | 'KS';

export type HandType = Card[];

export type TableRole = 'Dealer' | 'SmallBlind' | 'BigBlind' | 'None';
export type BlindType = 'small' | 'big' | 'none';

export type GameVariant = 'TexasHoldEm' | 'Omaha' ;

export interface Board {
    flops: Array<Card[]>;
    turns: Array<Card>;
    rivers: Array<Card>;
}

export interface Result {
    rank: number;
    message: string;
}

export interface GameConfig {
    variant: GameVariant;
    cardsPerPlayer: number;
    numberOfFlops: number;
    numberOfTurns: number;
    numberOfRivers: number;
}

export interface CardPosition {
    x: number;
    y: number;
}

export interface BoardSlots {
    flop: CardPosition[];
    turn: CardPosition;
    river: CardPosition;
}

export interface GameVariantSlots {
    TexasHoldEm: CardPosition[];
    Omaha: CardPosition[];
    OmahaHiLo?: CardPosition[];
}

export interface PlayerSlots {
    p1: GameVariantSlots;
    p2: GameVariantSlots;
    p3: GameVariantSlots;
    p4: GameVariantSlots;
    p5: GameVariantSlots;
    p6: GameVariantSlots;
}

export interface GameBoardSlots {
    TexasHoldEm: BoardSlots;
    Omaha: BoardSlots;
    OmahaHiLo?: BoardSlots;
}

export interface CardSlots {
    players: PlayerSlots;
    boards: GameBoardSlots;
}

export enum GamePhase {
    IDLE = 'IDLE',
    DEALING = 'DEALING',
    PREFLOP = 'PREFLOP',
    FLOP = 'FLOP',
    TURN = 'TURN',
    RIVER = 'RIVER',
    SHOWDOWN = 'SHOWDOWN'
}

export enum RoundPhase {
    BET = 'BET',
    CALL = 'CALL',
}

export type Phase = 'idle' | 'dealing' | 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';
export type PlayerAction = 'check' | 'bet' | 'call' | 'raise' | 'fold';
export type LastActions = "NONE" | "CHECK" | "BET" | "CALL" | "RAISE" | "FOLD";

export enum Actions {
    NONE = 'None',
    CHECK = 'Check',
    BET = 'Bet',
    CALL = 'Call',
    RAISE = 'Raise',
    FOLD = 'Fold'
}

export interface BetInfo {
    amount: number;
    player: Player;
    action: PlayerAction;
}

export interface Flop {
    cardOne: Card;
    cardTwo: Card;
    cardThree: Card;
}

export interface Turn {
    card: Card;
}

export interface River {
    card: Card;
}

export interface SingleBoard {
    flop: Flop;
    turn: Turn;
    river: River;
}

export interface TableState {
    gameBoard: SingleBoard[],
    playerBoards: any//PlayerBoard[]
}
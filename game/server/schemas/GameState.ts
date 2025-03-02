import { Schema, ArraySchema, type } from '@colyseus/schema'
import PlayerState from "./PlayerState";

export class CardState extends Schema {
  @type("string") name: string;
  @type("string") suit: string;
  @type("string") rank: string;
  @type("number") value: number;
}

export class DeckState extends Schema {
  @type([CardState]) cards = new ArraySchema<CardState>();
}

export class FlopState extends Schema {
  @type([CardState]) flop = new ArraySchema<CardState>();
}

export class TurnState extends Schema {
  @type(CardState) turn = new CardState();
}

export class RiverState extends Schema {
  @type(CardState) river = new CardState();
}

export class CommunityCardsState extends Schema {
  @type([FlopState]) flops = new ArraySchema<FlopState>();
  @type(TurnState) turns = new TurnState();
  @type(RiverState) rivers = new RiverState();
}

export default class GameState extends Schema {
  @type("string") currentPhase: string = "WAITING";
  @type("number") pot: number = 0;
  @type("number") currentBet: number = 0;
  @type("number") activePlayerIndex: number = 0;
  @type("number") dealerIndex: number = 0;
  @type([PlayerState]) players = new ArraySchema<PlayerState>();
  @type(CommunityCardsState) communityCards = new CommunityCardsState();
  @type("boolean") roundInProgress: boolean = false;
  @type("number") minPlayers: number = 2;
  @type("number") smallBlind: number = 5;
  @type("number") bigBlind: number = 10;
  
}


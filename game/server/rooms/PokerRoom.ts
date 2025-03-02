import { Room, Client } from "colyseus";
import { Schema, type, ArraySchema } from "@colyseus/schema";
import { Card, Deck, Hand } from "../lib/poker";
import { type CardName } from "../lib/types";

interface HandComparison {
  hand: Hand;
  id: string;
  bestHand: string;
}

// Player state
class PlayerState extends Schema {
  @type("string") id: string;
  @type("string") name: string;
  @type("number") chips: number;
  @type(["string"]) cards = new ArraySchema<string>();
  @type("boolean") isReady: boolean = false;
  @type("boolean") isActive: boolean = true;
  @type("number") currentBet: number = 0;
}

// Game state
class PokerGameState extends Schema {
  @type([PlayerState]) players = new ArraySchema<PlayerState>();
  @type("string") gamePhase: string = "waiting"; // waiting, dealing, betting, showdown
  @type("string") roundName: string = "deal"; // deal, flop, turn, river, showdown
  @type("number") pot: number = 0;
  @type(["number"]) sidepots = new ArraySchema<number>();
  @type(["string"]) communityCards = new ArraySchema<string>();
  @type(["string"]) burnPile = new ArraySchema<string>();
  @type("number") currentPlayerTurn: number = 0;
  @type("number") currentBet: number = 0;
  @type("string") roomId: string;
  @type("number") smallBlind: number = 5;
  @type("number") bigBlind: number = 10;
  @type("number") dealerIndex: number = 0;
}

export class PokerRoom extends Room<PokerGameState> {
  maxClients: number = 6;
  deck: Deck;
  
  onCreate(options: any) {
    this.setState(new PokerGameState());
    this.state.roomId = this.roomId;

    // Handle player actions
    this.onMessage("ready", (client, message) => {
      const player = this.getPlayerByClient(client);
      if (player) {
        player.isReady = true;
        this.checkGameStart();
      }
    });

    this.onMessage("bet", (client, amount: number) => {
      this.handleBet(client, amount);
    });

    this.onMessage("fold", (client) => {
      this.handleFold(client);
    });
  }

  onJoin(client: Client, options: any) {
    const player = new PlayerState();
    player.id = client.sessionId;
    player.name = options.name || `Player ${this.state.players.length + 1}`;
    player.chips = options.chips || 1000; // Starting chips
    this.state.players.push(player);
  }

  onLeave(client: Client) {
    const player = this.getPlayerByClient(client);
    if (player) {
      player.isActive = false;
      this.checkGameState();
    }
  }

  private getPlayerByClient(client: Client): PlayerState | undefined {
    return this.state.players.find(p => p.id === client.sessionId);
  }

  private checkGameStart() {
    const readyPlayers = this.state.players.filter(p => p.isReady && p.isActive);
    if (readyPlayers.length >= 2 && readyPlayers.length === this.state.players.filter(p => p.isActive).length) {
      this.startNewRound();
    }
  }

  private startNewRound() {
    this.state.gamePhase = "dealing";
    this.state.roundName = "deal";
    this.state.pot = 0;
    this.state.currentBet = 0;
    this.state.communityCards = new ArraySchema<string>();
    
    // Reset player states
    this.state.players.forEach(player => {
      player.cards = new ArraySchema<string>();
      player.currentBet = 0;
    });

    // Deal cards
    this.dealToPlayers();
    
    // Collect blinds
    const smallBlindPos = (this.state.dealerIndex + 1) % this.state.players.length;
    const bigBlindPos = (this.state.dealerIndex + 2) % this.state.players.length;
    
    const smallBlindPlayer = this.state.players[smallBlindPos];
    const bigBlindPlayer = this.state.players[bigBlindPos];
    
    if (smallBlindPlayer && bigBlindPlayer) {
      smallBlindPlayer.chips -= this.state.smallBlind;
      bigBlindPlayer.chips -= this.state.bigBlind;
      smallBlindPlayer.currentBet = this.state.smallBlind;
      bigBlindPlayer.currentBet = this.state.bigBlind;
      this.state.pot += this.state.smallBlind + this.state.bigBlind;
      this.state.currentBet = this.state.smallBlind + this.state.bigBlind;
    }

    // Start betting round
    this.state.gamePhase = "betting";
    this.state.roundName = "dealing";

    this.state.currentPlayerTurn = this.state.dealerIndex + 1;
  }

  private dealToPlayers() {
    this.deck = new Deck(true);
    
    // Deal 2 cards to each player, starting from dealer's left
    for (let round = 0; round < 2; round++) {  // Two rounds of dealing
      let currentPosition = (this.state.dealerIndex + 1) % this.state.players.length;  // Start left of dealer
      let playersDealtTo = 0;  // Track how many players we've dealt to
      
      while (playersDealtTo < this.state.players.length) {  // Continue until all players have been dealt to
        const player = this.state.players[currentPosition];
        if (player && player.isActive) {
          const card = this.deck.draw().name;
          player.cards.push(card);
        }
        
        currentPosition = (currentPosition + 1) % this.state.players.length;  // Move to next player, wrap around if needed
        playersDealtTo++;
      }
    }
  }

  private dealCommunityCards() {
    switch (this.state.roundName) {
      case "Flop":
        this.state.burnPile.push(this.deck.draw().name);
        this.state.communityCards.push(this.deck.draw().name);
        this.state.communityCards.push(this.deck.draw().name);
        this.state.communityCards.push(this.deck.draw().name);
        break;
      case "Turn":
        this.state.burnPile.push(this.deck.draw().name);
        this.state.communityCards.push(this.deck.draw().name);
        break;
      case "River":
        this.state.burnPile.push(this.deck.draw().name);
        this.state.communityCards.push(this.deck.draw().name);
        break;
      case "Showdown":
        break;
    }
  }

  private handleBet(client: Client, amount: number) {
    const player = this.getPlayerByClient(client);
    if (!player || this.state.gamePhase !== "betting") return;

    if (amount <= player.chips && amount >= this.state.currentBet) {
      player.chips -= amount;
      player.currentBet = amount;
      this.state.pot += amount;
      this.state.currentBet = amount;
      
      this.moveToNextPlayer();
    }
  }

  private handleFold(client: Client) {
    const player = this.getPlayerByClient(client);
    if (!player || this.state.gamePhase !== "betting") return;

    player.isActive = false;
    this.moveToNextPlayer();
    this.checkGameState();
  }

  private moveToNextPlayer() {
    let nextPlayer = (this.state.currentPlayerTurn + 1) % this.state.players.length;
    let loopCount = 0;
    
    // Keep looking for next active player, but prevent infinite loop
    while (loopCount < this.state.players.length) {
      const player = this.state.players[nextPlayer];
      if (player?.isActive) {
        this.state.currentPlayerTurn = nextPlayer;
        return;
      }
      nextPlayer = (nextPlayer + 1) % this.state.players.length;
      loopCount++;
    }
    
    // If we get here, no active players were found
    this.checkGameState(); // This will handle the case where everyone folded
  }

  private checkGameState() {
    const activePlayers = this.state.players.filter(p => p.isActive);
    if (activePlayers.length === 1) {
      this.handleWinner(activePlayers[0]);
      return;
    }

    if (this.state.gamePhase === "showdown") {
      const handsToShow = activePlayers.map((player): HandComparison => {
        const playerCards = player.cards.map(card => new Card(card as CardName));
        const communityCards = this.state.communityCards.map(card => new Card(card as CardName));
        const allCards = [...playerCards, ...communityCards];
        const hand = new Hand(allCards);
        hand.evaluate(); // Calculate the hand rank
        return { 
          hand, 
          id: player.id, 
          bestHand: hand.winningHand 
        };
      });

      if (handsToShow.length === 0) return;

      let winningHand = handsToShow[0];
      for (let i = 1; i < handsToShow.length; i++) {
        if (handsToShow[i].hand.rank > winningHand.hand.rank) {
          winningHand = handsToShow[i];
        }
      }

      const winner = this.state.players.find(p => p.id === winningHand.id);
      if (winner) {
        winner.chips += this.state.pot;
        this.state.pot = 0;
        this.state.gamePhase = "waiting";
        
        // Reset player states for next round
        this.state.players.forEach(player => {
          player.isReady = false;
          player.isActive = true;
          player.currentBet = 0;
          player.cards = new ArraySchema<string>();
        });
      }
    }
  }

  private handleWinner(winner: PlayerState) {
    winner.chips += this.state.pot;
    this.state.pot = 0;
    this.state.gamePhase = "waiting";
    
    // Reset player states for next round
    this.state.players.forEach(player => {
      player.isReady = false;
      player.isActive = true;
      player.currentBet = 0;
    });
  }
}
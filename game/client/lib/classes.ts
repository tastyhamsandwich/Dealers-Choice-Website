import { isRankOrSuit, isCardName, generateRandomSuit, generateRandomRank } from './utils';
import { Suit, Rank, CardName, RankValue, HandType, LastActions, Actions } from './types';

export { Card, Deck, Hand, Player, Round, Sidepot, Table, User }


interface Stringable {
    toString: () => string;
}

/** 
 * Represents a playing card.
 * @class
 * @param scene - The scene to play the card in.
 * @param x - The x-coordinate of the card.
 * @param y - The y-coordinate of the card.
 * @param arg1 - Can be a Rank, Suit, RankValue, or CardName.
 * @param arg2 - Can be a Rank, RankValue, or Suit.
 * @example <caption>Creating a new Card instance with a Rank and Suit</caption>
 * const card = new Card('ace', 'hearts'); // Ace of Hearts
 * @example <caption>Creating a new Card instance with a RankValue and Suit</caption>
 * const card = new Card(12, 'diamonds'); // Queen of Diamonds
 * @example <caption>Creating a new Card instance with a CardName</caption>
 * const card = new Card('JS'); // Jack of Spades
 */
class Card implements Stringable {

    suit:   Suit;
    rank:   Rank;
    value:  RankValue;
    name:   CardName;

    /**
     * Creates a new Card instance.
     * @param arg1 - The first argument, can be a Rank, Suit, RankValue, or CardName.
     * @param arg2 - The second argument, can be a Rank, RankValue, or Suit.
     * @throws {Error} If the arguments are invalid.
     */
    constructor(
        arg1: Rank | Suit | RankValue | CardName,
        arg2?: Rank | RankValue | Suit,
    ) {

        // Handle different parameter combinations
        if (this.isCardName(arg1)) {
        [this.rank, this.suit] = this.getRankAndSuitFromName(arg1);
        this.name = arg1;
        this.value = this.rankToValue(this.rank);
        } else if (this.isRankAndSuit(arg1, arg2)) {
            this.assignRankAndSuit(arg1, arg2 as Rank | Suit | RankValue);
        }
    }

    public toString(): string {
        return this.name;
    }

    /**
     * Checks if the value is a valid CardName.
     * @param value - The value to check.
     * @returns True if the value is a CardName, false otherwise.
     */
    private isCardName(value: any): value is CardName {
        return typeof value === 'string' && isCardName(value);
    }

    /**
     * Checks if the arguments are valid Rank and Suit.
     * @param arg1 - The first argument to check.
     * @param arg2 - The second argument to check.
     * @returns True if the arguments are valid Rank and Suit, false otherwise.
     */
    private isRankAndSuit(arg1: any, arg2: any): boolean {
        return arg1 && arg2 && isRankOrSuit(arg1) && isRankOrSuit(arg2);
    }

    /**
     * Assigns the rank and suit based on the provided arguments.
     * @param arg1 - The first argument (Rank, Suit, or RankValue).
     * @param arg2 - The second argument (Rank, Suit, or RankValue).
     */
    private assignRankAndSuit(arg1: Rank | Suit | RankValue, arg2: Rank | Suit | RankValue): void {
        if (typeof arg1 === 'string' && typeof arg2 === 'string') {
            if (this.isSuit(arg1)) {
                this.suit = arg1;
                this.rank = arg2 as Rank;
            } else {
                this.rank = arg1 as Rank;
                this.suit = arg2 as Suit;
            }
                this.name = this.getNameFromRankAndSuit(this.rank, this.suit);
            } else if (typeof arg1 === 'number' && typeof arg2 === 'string' && this.isSuit(arg2)) {
                this.rank = this.rankFromValue(arg1);
                this.suit = arg2;
                this.name = this.getNameFromRankAndSuit(this.rank, this.suit);
            } else if (typeof arg1 === 'string' && this.isSuit(arg1) && typeof arg2 === 'number') {
                this.suit = arg1;
                this.rank = this.rankFromValue(arg2);
                this.name = this.getNameFromRankAndSuit(this.rank, this.suit);
            }
                this.value = this.rankToValue(this.rank)
    }

    /**
     * Checks if the value is a valid Suit.
     * @param value - The value to check.
     * @returns True if the value is a Suit, false otherwise.
     */
    private isSuit(value: any): value is Suit {
        return isRankOrSuit(value) && ['hearts', 'diamonds', 'clubs', 'spades'].includes(value);
    }

    private getRankAndSuitFromName(name: CardName): [Rank, Suit] {
        const rankChar = name.charAt(0);
        const suitChar = name.charAt(1);
        let rank: Rank;
        let suit: Suit;
    
        switch (rankChar) {
            case 'A': rank = 'ace'; break;
            case '2': rank = 'two'; break;
            case '3': rank = 'three'; break;
            case '4': rank = 'four'; break;
            case '5': rank = 'five'; break;
            case '6': rank = 'six'; break;
            case '7': rank = 'seven'; break;
            case '8': rank = 'eight'; break;
            case '9': rank = 'nine'; break;
            case 'T': rank = 'ten'; break;
            case 'J': rank = 'jack'; break;
            case 'Q': rank = 'queen'; break;
            case 'K': rank = 'king'; break;
            default: throw new Error(`Invalid rank name: ${rankChar}`);
        }
    
        switch (suitChar) {
            case 'H': suit = 'hearts'; break;
            case 'D': suit = 'diamonds'; break;
            case 'C': suit = 'clubs'; break;
            case 'S': suit = 'spades'; break;
            default: throw new Error(`Invalid suit name: ${suitChar}`);
        }
    
        return [rank as Rank, suit as Suit];
    }
    /**
     * Gets the CardName from the rank and suit.
     * @param rank - The rank of the card.
     * @param suit - The suit of the card.
     * @returns The CardName.
     */
    private getNameFromRankAndSuit(rank: Rank, suit: Suit): CardName {
        const rankInitial = this.rankToInitial(rank);
        const suitInitial = this.suitToInitial(suit);
        return `${rankInitial}${suitInitial}` as CardName;
    }

    /**
     * Converts a rank to its initial.
     * @param rank - The rank to convert.
     * @returns The initial of the rank.
     */
    private rankToInitial(rank: Rank): string {
        const rankMap: { [key in Rank]: string } = {
            'ace': 'A', 'two': '2', 'three': '3', 'four': '4', 'five': '5',
            'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', 'ten': 'T',
            'jack': 'J', 'queen': 'Q', 'king': 'K', 'wild': 'W'
        };
        if (rank in rankMap) {
            return rankMap[rank];
        }
        throw new Error(`Invalid rank: ${rank}`);
    }

    /**
     * Converts a suit to its initial.
     * @param suit - The suit to convert.
     * @returns The initial of the suit.
     */
    private suitToInitial(suit: Suit): string {
        switch (suit) {
            case 'hearts'   : return 'H';
            case 'diamonds' : return 'D';
            case 'clubs'    : return 'C';
            case 'spades'   : return 'S';
            default         : throw new Error(`Invalid suit: ${suit}`);
        }
    }

    /**
     * Gets the suit from its name.
     * @param name - The name of the suit.
     * @returns The suit.
     */
    suitFromName(name: string): Suit {
        switch (name) {
            case 'H': return 'hearts';
            case 'D': return 'diamonds';
            case 'C': return 'clubs';
            case 'S': return 'spades';
            default : throw new Error(`Invalid suit name: ${name}`);
        }
    }

    /**
     * Gets the rank from its name.
     * @param name - The name of the rank.
     * @returns The rank.
     */
    rankFromName(name: string): Rank {
        switch (name) {
            case 'A': return 'ace';
            case '2': return 'two';
            case '3': return 'three';
            case '4': return 'four';
            case '5': return 'five';
            case '6': return 'six';
            case '7': return 'seven';
            case '8': return 'eight';
            case '9': return 'nine';
            case 'T': return 'ten';
            case 'J': return 'jack';
            case 'Q': return 'queen';
            case 'K': return 'king';
            default : throw new Error(`Invalid rank name: ${name}`);
        }
    }

    /**
     * Gets the value of the card.
     * @returns The value of the card.
     */
    getValue(): number {
        return this.rankToValue(this.rank);
    }

    /**
     * Converts a rank to its value.
     * @param rank - The rank to convert.
     * @returns The value of the rank.
     */
    rankToValue(rank: Rank): RankValue {
        switch (rank) {
            case 'two':   return 2;
            case 'three': return 3;
            case 'four':  return 4;
            case 'five':  return 5;
            case 'six':   return 6;
            case 'seven': return 7;
            case 'eight': return 8;
            case 'nine':  return 9;
            case 'ten':   return 10;
            case 'jack':  return 11;
            case 'queen': return 12;
            case 'king':  return 13;
            case 'ace':   return 14;
            case 'wild':  return 100;
            default: throw new Error(`Invalid rank value: ${rank}`);
        }
    }

    suitValue(): number {
        switch (this.suit) {
            case 'hearts':   return 1;
            case 'diamonds': return 2;
            case 'clubs':    return 3;
            case 'spades':   return 4;
            default: throw new Error(`Invalid suit value: ${this.suit}`);
        }
    }

    /**
     * Converts a value to its rank.
     * @param value - The value to convert.
     * @returns The rank corresponding to the value.
     */
    rankFromValue(value: RankValue): Rank {
        switch (value) {
            case 2:   return 'two';
            case 3:   return 'three';
            case 4:   return 'four';
            case 5:   return 'five';
            case 6:   return 'six';
            case 7:   return 'seven';
            case 8:   return 'eight';
            case 9:   return 'nine';
            case 10:  return 'ten';
            case 11:  return 'jack';
            case 12:  return 'queen';
            case 13:  return 'king';
            case 14:  return 'ace';
            case 100: return 'wild';
            default: throw new Error(`Invalid rank value: ${value}`);
        }
    }

    /**
     * Prints the full name of the card.
     * @returns The full name of the card.
     */
    printFullName(): string {
        const capRank = this.rank.charAt(0).toUpperCase() + this.rank.slice(1);
        const capSuit = this.suit.charAt(0).toUpperCase() + this.suit.slice(1);
        return `${capRank} of ${capSuit}`;
    }
}

/** 
 * Represents a deck of cards.
 * @class
 * @param autoShuffle - Whether to shuffle the deck automatically.
 */
class Deck {

    cards: Card[];

    constructor(autoShuffle: boolean = false) {
        
        // Construct new deck, and shuffle if shuffle flag is set true
        if (autoShuffle === true) {
        this.cards = this.generateDeck();
        this.shuffleDeck();
        // If no shuffle flag is set, just generate new deck in order
        } else {
        this.cards = this.generateDeck();
        }
    }

    // Implement iterator for deck, so that it can be looped through easily
    [Symbol.iterator]() {
        let index = 0;
        const cards = this.cards;

        return {
        next(): IteratorResult<Card> {
            if (index < cards.length) {
            return { value: cards[index++], done: false };
            } else {
            return { value: undefined, done: true };
            }
        }
        };
    }


    private generateDeck(): Card[] {
        const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
        const ranks: Rank[] = ['two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'jack', 'queen', 'king', 'ace'];

        let cardArray: Card[] = [];

        // Generate deck contents in order, so that the deck is always the same
        for (const suit of suits) {
        for (const rank of ranks) {
            const card = new Card(suit, rank);
            cardArray.push(card);
        }
        }
        return cardArray;
    }

    regenerateDeck(): void {

        this.cards = [];

        this.cards = this.generateDeck();
    }

    shuffleDeck(): void {
        // Shuffle deck using Fisher-Yates
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
        return;
    }

    dealHand(): Hand {
        if (this.cards.length < 5) {
        throw new Error('Not enough cards to deal a hand.');
        }
        const handCards = this.cards.splice(0, 5);
        return new Hand(handCards);
    }

    draw(): Card {
        if (this.cards.length < 1)
        throw new Error('Not enough cards to draw.');
        else return this.cards.pop()!;
    }
}

/** 
 * Represents a hand of cards.
 * @class
 * @param cards - The cards in the hand.
 */
class Hand extends Array {
    cards: HandType | Card[];
    rank: number;

    constructor(cards: HandType | Card[]) {
        super();
        this.cards = cards;
        this.rank = this.rankCards();
    }

    rankCards = (): number => {
        const handCards: Card[] = this.cards;
        // Histogram
        // { rank: count }
    
        // Initialize empty histogram object
        const hist: {[key in RankValue]?: number} = {};
    
        // Iterate over cards in hand array and increment counter for each RankValue present
        handCards.reduce((hist: {[key in RankValue]?: number}, card: Card) => {
            hist[card.value as RankValue] = (hist[card.value as RankValue] || 0) + 1;
            return hist;
        }, hist);
    
    // Scored histogram
    // Descending by count
    // [ [ rank, count ] ]
    // scoredHist[x][0] references the rank of the cards (Jacks, Aces, etc.)
    // scoredHist[x][1] references the number of times that rank appears in a hand
    
        const scoredHist: (number | undefined)[][] = Object
            .keys(hist)
            .map(rank => [parseInt(rank), hist[rank as unknown as RankValue]])
            .sort((a, b) => (a[1] ?? 0) === (b[1] ?? 0) ? (b[0] ?? 0) - (a[0] ?? 0) : (b[1] ?? 0) - (a[1] ?? 0));
    
        console.log(scoredHist);
    // Suits
    // [ suit: count ]
    
        const suits = handCards.reduce((suits: number[], card: Card) => {
            suits[card.suitValue()]++;
            return suits;
        }, [0,0,0,0]);
    
    // Ranked Hand
    // (descending by rank)
    // [ index : rank ]
    
        const rankedHand = handCards.map(card => card.value).sort((a, b) => a - b);
    
    // Evaluate for non-histogram based hands and set a flag accordingly, to be used for final evaluation chain
        const isFlush     = suits.indexOf(5) >= 0;
        const isWheel     = rankedHand[4] === 14 && rankedHand[0] === 2;
        const isStraight  = ( rankedHand[4]
            - rankedHand[3] === 1 || isWheel
        ) && (
            rankedHand[3]   - rankedHand[2] === 1 &&
            rankedHand[2]   - rankedHand[1] === 1 &&
            rankedHand[1]   - rankedHand[0] === 1
        );
    
    // Final Evaluation Chain
    // Starting with Royal Flush and working downwards
    // Using ternary operators to chain evaluations together
    
    
    // High Card
        return (isStraight && isFlush && rankedHand[4] === 14 && !isWheel) ? (10) // Royal Flush
            : (isStraight && isFlush) ? (9 + (rankedHand[4] / 100)) // Straight Flush
                : (scoredHist[0][1] === 4) ? (8 + ((scoredHist[0][0] ?? 0) / 100)) // Four of a Kind
                    : (scoredHist[0][1] === 3 && scoredHist[1][1] === 2) ? (7 + ((scoredHist[0][0] ?? 0) / 100) + ((scoredHist[1][0] ?? 0) / 1000)) // Full House
                        : (isFlush) ? (6 + (rankedHand[4] / 100)) // Flush
                            : (isStraight) ? (5 + (rankedHand[4] / 100)) // Straight
                                : (scoredHist[0][1] === 3 && scoredHist[1][1] === 1) ? (4 + ((scoredHist[0][0] ?? 0) / 100)) // Three of a Kind
                                    : (scoredHist[0][1] === 2 && scoredHist[1][1] === 2) ? (3 + ((scoredHist[0][0] ?? 0) / 100) + ((scoredHist[1][0] ?? 0) / 1000)) // Two Pair
                                        : (scoredHist[0][1] === 2 && scoredHist[1][1] === 1) ? (2 + ((scoredHist[0][0] ?? 0) / 100)) // One Pair
                                            : (1 + ((scoredHist[0][0] ?? 0) / 100));
    }

    valueOf() {
        return this.cards;
    }

    toString() {
        return this.cards.toString();
    }

    
    [Symbol.toPrimitive](hint: string) {
        if (hint === 'number') {
            return this.cards.length;
        }
        if (hint === 'string') {
            return this.toString();
        }
        return this.valueOf();
    }

    [Symbol.iterator](): IterableIterator<Card> {
        let index = 0;
        const cards = this.cards;

        return {
            [Symbol.iterator](): IterableIterator<Card> {
            return this;
            },
            next(): IteratorResult<Card> {
            if (index < cards.length) {
                return { value: cards[index++], done: false };
            } else {
                return { value: undefined, done: true };
            }
            }
        };
    }

    sortDescending(): void {
        this.cards.sort((a: Card, b: Card) => b.getValue() - a.getValue());
    }

    addCard(deckOrCard: Card | Deck | CardName | null = null): void {
        if (deckOrCard === null) {
            const card = new Card(generateRandomRank(), generateRandomSuit());
            this.cards.push(card);
            return;
        } else if (deckOrCard instanceof Card) {
            this.cards.push(deckOrCard);
            return;
        } else if (deckOrCard instanceof Deck) {
            const card: Card = deckOrCard.draw();
            this.cards.push(card);
            return;
        } else {
            const card: Card = new Card(deckOrCard as CardName);
            this.cards.push(card);
            return;
        }
        }
}

/** 
 * Represents a player.
 * @class
 * @param playerName - The name of the player.
 * @param chips - The number of chips the player has.
 * @param table - The table the player is at.
 */
class Player {
    sessionId: string;
    username: string;
    id: string;
    userID: number;
    displayName: string;
    chips: number;
    folded: boolean;
    allIn: boolean;
    talked: boolean;
    table: Table;
    cards: Hand;
    bet: number;
    lastAction: LastActions;
    action: Actions;

    constructor(playerName: string, chips = 0, table: Table)
    {
        this.username = playerName;
        this.userID = this.generateNewUserID();
        this.displayName = playerName;
        this.chips = chips;
        this.folded = false;
        this.allIn = false;
        this.talked = false;
        this.table = table; //Circular reference to allow reference back to parent object.
        this.cards = new Hand([]);
    }

    private generateNewUserID(): number {
        return Math.floor(Math.random() * 1000000);
    }

    getChips(cash) {
        this.chips += cash;
    };
}

/** 
 * Represents a round of poker.
 * @class
 * @param context - The context of the game.
 * @param table - The table the round is at.
 * @param smallBlind - The small blind.
 * @param bigBlind - The big blind.
 * @param players - The players in the round.
 */
class Round {
    smallBlind: number;
    bigBlind: number;
    pot: number;
    roundName: string = 'Deal'; //Start the first round
    betName: string = 'bet'; //bet,raise,re-raise,cap
    bets: number[] = [];
    roundBets: number[] = [];
    deck: Deck;
    board: any[] = [];
    players: Player[];
    currentPlayerIndex: number;
    table: Table;
    sidepots: Sidepot[] = [];

    constructor(context: Phaser.Scene, table, smallBlind: number, bigBlind: number, players: Player[]) {
        this.smallBlind = smallBlind;
        this.bigBlind = bigBlind;
        this.pot = 0;
        this.roundName = 'Deal';
        this.betName = 'bet';
        this.bets = [];
        this.roundBets = [];
        this.board = [];
        this.deck = new Deck(true);
        this.players = players;
    }

    getMaxBet(bets: number[]) {
        let maxBet, i;
        maxBet = 0;
        for (i = 0; i < bets.length; i += 1) {
            if (bets[i] > maxBet) {
                maxBet = bets[i];
            }
        }
        return maxBet;
    }

    checkForEndOfRound(table: Table) {
        let maxBet: number, endOfRound: boolean;
        endOfRound = true;
        maxBet = this.getMaxBet(this.bets);
        //For each player, check
        for (let i = 0; i < (this.players as Player[]).length; i += 1) {
            if (!this.players[i].folded) {
                if (!this.players[i].talked || table.currentRound.bets[i] !== maxBet) {
                    if (!this.players[i].allIn) {
                        this.currentPlayerIndex = i;
                        endOfRound = false;
                    }
                }
            }
        }
        return endOfRound;
    }

    checkForAllInPlayer(winners: number[]) {
        let allInPlayer: number[];
        allInPlayer = [];
        for (let i = 0; i < winners.length; i += 1) {
            if (this.players[winners[i]].allIn) {
                allInPlayer.push(winners[i]);
            }
        }
        return allInPlayer;
    }

    checkForWinner(table: Table) {
        let maxRank = 0.000;
        let winners: number[] = [];
        let part: number;
        let prize: number = 0;
        let allInPlayer: number[] = this.checkForAllInPlayer(winners);
        let minBets, roundEnd;

        //Identify winner(s)
        for (let k = 0; k < (this.players as Player[]).length; k += 1) {
            if (this.players[k].cards!.rank === maxRank && !this.players[k].folded) {
                winners.push(k);
            }
            if (this.players[k].cards!.rank > maxRank && !this.players[k].folded) {
                maxRank = this.players[k].cards!.rank;
                winners.splice(0, winners.length);
                winners.push(k);
            }
        }


        if (allInPlayer.length > 0) {
            minBets = table.currentRound.roundBets[winners[0]];
            for (let j = 1; j < allInPlayer.length; j += 1) {
                if (table.currentRound.roundBets[winners[j]] !== 0 && table.currentRound.roundBets[winners[j]] < minBets) {
                    minBets = table.currentRound.roundBets[winners[j]];
                }
            }
            part = parseInt(minBets, 10);
        } else {
            part = parseInt(String(table.currentRound.roundBets[winners[0]]), 10);

        }
        for (let l = 0; l < table.currentRound.roundBets.length; l += 1) {
            if (table.currentRound.roundBets[l] > part) {
                prize += part;
                table.currentRound.roundBets[l] -= part;
            } else {
                prize += table.currentRound.roundBets[l];
                table.currentRound.roundBets[l] = 0;
            }
        }

        for (let i = 0; i < winners.length; i += 1) {
            let winnerPrize: number = prize / winners.length;
            let winningPlayer: Player = this.players[winners[i]];
            winningPlayer.chips += winnerPrize;
            if (this.roundBets[winners[i]] === 0) {
                winningPlayer.folded = true;
                table.currentRoundWinners.push( {
                    playerName: winningPlayer.username,
                    amount: winnerPrize,
                    hand: winningPlayer.cards,
                    chips: winningPlayer.chips
                });
            }
            console.log(`player '${this.players[winners[i]].username}' wins !!`);
        }

        roundEnd = true;
        for (let l = 0; l < this.roundBets.length; l += 1) {
            if (this.roundBets[l] !== 0) {
                roundEnd = false;
            }
        }
        if (roundEnd === false) {
            this.checkForWinner(table);
        }
    }

    checkForBankrupt(table) {
        let i;
        for (i = 0; i < table.players.length; i += 1) {
            if (table.players[i].chips === 0) {
                table.gameLosers.push( table.players[i] );
                console.log('player ' + table.players[i].playerName + ' is going bankrupt');
                table.players.splice(i, 1);
            }
        }
    }
}

/** 
 * Represents a sidepot.
 * @class
 * @param amount - The amount of the sidepot.
 * @param possibleWinners - The players in the sidepot.
 */
class Sidepot {
    private amount: number;
    private possibleWinners: Player[];
    private usableHands: { [key: string]: Hand };

    constructor(amount: number, possibleWinners: Player[]) {
        this.amount = amount;
        this.possibleWinners = possibleWinners;
        this.usableHands = {};
        possibleWinners.forEach((player) => {
            this.usableHands[player.username] = new Hand(player.cards);
        });
    }

    public addHand(player: Player, hand: Hand) {
        if (!this.possibleWinners.includes(player)) {
            throw new Error('Player is not a possible winner');
        }
        this.usableHands[player.username] = hand;
    }

    public getUsableHands(): { [key: string]: Hand } {
        return this.usableHands;
    }
}

/** 
 * Represents a table.
 * @class
 * @param context - The context of the game.
 * @param smallBlind - The small blind.
 * @param bigBlind - The big blind.
 * @param minPlayers - The minimum number of players at the table.
 * @param maxPlayers - The maximum number of players at the table.
 * @param minBuyIn - The minimum buy-in amount.
 * @param maxBuyIn - The maximum buy-in amount.
 */
class Table {
    smallBlind: number;
    bigBlind: number;
    minPlayers: number;
    maxPlayers: number;
    players: Player[];
    dealer: number;
    minBuyIn: number;
    maxBuyIn: number;
    playersToRemove: Player[];
    playersToAdd: Player[];
    eventEmitter: Phaser.Events.EventEmitter;
    turnBet: any;
    currentRound: Round;
    currentRoundWinners: any[];
    currentRoundLosers: any[];
    deck: Deck;
    context: Phaser.Scene;
    gameState: any;
    pot: number = 0;

    constructor(
        context: Phaser.Scene,
        smallBlind: number = 5,
        bigBlind: number = 10,
        minPlayers: number = 2,
        maxPlayers: number = 6,
        minBuyIn: number = 100,
        maxBuyIn: number = 2000
    ) {
        this.smallBlind = smallBlind;
        this.bigBlind = bigBlind;
        this.minPlayers = minPlayers;
        this.maxPlayers = maxPlayers;
        this.players = [];
        this.dealer = 0; //Track the dealer position between games
        this.minBuyIn = minBuyIn;
        this.maxBuyIn = maxBuyIn;
        this.playersToRemove = [];
        this.playersToAdd = [];
        this.eventEmitter = new Phaser.Events.EventEmitter;
        this.turnBet = {};
        this.currentRoundWinners = [];
        this.currentRoundLosers = [];
        this.context = context;


        //Validate acceptable value ranges.
        let err: Error | undefined;
        if (minPlayers < 2) { //require at least two players to start a currentRound.
            err = new Error('Parameter [minPlayers] must be a positive integer of a minimum value of 2.');
        } else if (maxPlayers > 10) { //hard limit of 10 players at a table.
            err = new Error('Parameter [maxPlayers] must be a positive integer less than or equal to 10.');
        } else if (minPlayers > maxPlayers) { //Without this we can never start a game!
            err = new Error('Parameter [minPlayers] must be less than or equal to [maxPlayers].');
        }

        if (err) {
            throw err;
        }
    }

    addPlayer(player) {
        if (!this.players.includes(player))
            this.players.push(player);
        else
            throw new Error(`Player ${player.username} is already at the table.`);
    }
}

/** 
 * Represents a user.
 * @class
 * @param username - The username of the user.
 * @param email - The email of the user.
 */
class User {
    userId: number;
    username: string;
    displayName: string;
    email: string;
    password: string;
    personalDetails: {
        firstName: string;
        lastName: string;
        dateOfBirth: Date;
        address: {
            street: string;
            city: string;
            state: string;
            zip: string;
        };
        country: string;
        phoneNumber: string;
        gender: string;
    }
    wallet: number;
    accountChips: number;

    constructor(
        username: string,
        email: string,
        password: string,
        fName: string,
        lName: string,
        dob: Date,
        addStreet: string,
        addCity: string,
        addState: string,
        addZip: string,
        country: string,
        phone: string,
        gender: string,
        displayName = username
    ) {
        this.username = username;
        this.displayName = displayName;
        this.email = email;
        this.password = password;
        this.personalDetails.firstName = fName;
        this.personalDetails.lastName = lName;
        this.personalDetails.dateOfBirth = dob;
        this.personalDetails.address.street = addStreet;
        this.personalDetails.address.city = addCity;
        this.personalDetails.address.state = addState;
        this.personalDetails.address.zip = addZip;
        this.personalDetails.country = country;
        this.personalDetails.phoneNumber = phone;
        this.personalDetails.gender = gender;
    }

    getDisplayName(): string {
        return this.displayName;
    }

    setDisplayName(displayName: string): void {
        this.displayName = displayName;
    }

    getEmail(): string {
        return this.email;
    }

    setEmail(email: string): void {
        this.email = email;
    }
}
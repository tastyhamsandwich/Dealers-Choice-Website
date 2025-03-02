import { Suit, Rank, CardName, RankValue } from './types';

export class Card {
    suit: Suit;
    rank: Rank;
    value: RankValue;
    name: CardName;

    constructor(name: CardName) {
        this.name = name;
        [this.rank, this.suit] = this.getRankAndSuitFromName(name);
        this.value = this.rankToValue(this.rank);
    }

    private getRankAndSuitFromName(name: CardName): [Rank, Suit] {
        const rankChar = name.charAt(0);
        const suitChar = name.charAt(1);
        
        const rank = this.rankFromInitial(rankChar);
        const suit = this.suitFromInitial(suitChar);
        
        return [rank, suit];
    }

    private rankFromInitial(initial: string): Rank {
        switch (initial.toUpperCase()) {
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
            default: throw new Error(`Invalid rank initial: ${initial}`);
        }
    }

    private suitFromInitial(initial: string): Suit {
        switch (initial.toUpperCase()) {
            case 'H': return 'hearts';
            case 'D': return 'diamonds';
            case 'C': return 'clubs';
            case 'S': return 'spades';
            default: throw new Error(`Invalid suit initial: ${initial}`);
        }
    }

    private rankToValue(rank: Rank): RankValue {
        switch (rank) {
            case 'two': return 2;
            case 'three': return 3;
            case 'four': return 4;
            case 'five': return 5;
            case 'six': return 6;
            case 'seven': return 7;
            case 'eight': return 8;
            case 'nine': return 9;
            case 'ten': return 10;
            case 'jack': return 11;
            case 'queen': return 12;
            case 'king': return 13;
            case 'ace': return 14;
            case 'wild': return 100;
            default: throw new Error(`Invalid rank: ${rank}`);
        }
    }
}

export class Deck {
    private cards: CardName[];
    
    constructor(autoShuffle: boolean = false) {
        this.cards = this.generateDeck();
        if (autoShuffle) {
            this.shuffle();
        }
    }

    private generateDeck(): CardName[] {
        const cards: CardName[] = [];
        const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K'];
        const suits = ['H', 'D', 'C', 'S'];
        
        for (const suit of suits) {
            for (const rank of ranks) {
                cards.push(`${rank}${suit}` as CardName);
            }
        }
        
        return cards;
    }

    public shuffle(): void {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    public draw(): Card {
        if (this.cards.length === 0) {
            throw new Error('No cards left in deck');
        }
        const cardName = this.cards.pop()!;
        return new Card(cardName);
    }
}

export class Hand {
    cards: Card[];
    rank: number = 0;
    winningHand: string = '';

    constructor(cards: Card[]) {
        this.cards = cards;
    }

    evaluate(): number {
        // Sort cards by value
        const values = this.cards.map(card => card.value).sort((a, b) => a - b);
        
        // Check for straight and flush
        const isFlush = this.cards.every(card => card.suit === this.cards[0].suit);
        const isWheel = values[4] === 14 && values[0] === 2;
        const isStraight = (
            (values[4] - values[3] === 1 || isWheel) &&
            values[3] - values[2] === 1 &&
            values[2] - values[1] === 1 &&
            values[1] - values[0] === 1
        );

        // Create rank histogram
        const histogram: Map<number, number> = new Map();
        for (const value of values) {
            histogram.set(value, (histogram.get(value) || 0) + 1);
        }

        // Convert histogram to sorted array
        const sortedGroups = Array.from(histogram.entries())
            .sort(([v1, c1], [v2, c2]) => 
                c2 - c1 || v2 - v1
            );

        // Calculate hand rank
        let handRank = 0;
        if (isStraight && isFlush && values[4] === 14 && !isWheel) {
            handRank = 10; // Royal Flush
        } else if (isStraight && isFlush) {
            handRank = 9 + (values[4] / 100); // Straight Flush
        } else if (sortedGroups[0][1] === 4) {
            handRank = 8 + (sortedGroups[0][0] / 100); // Four of a Kind
        } else if (sortedGroups[0][1] === 3 && sortedGroups[1][1] === 2) {
            handRank = 7 + (sortedGroups[0][0] / 100) + (sortedGroups[1][0] / 1000); // Full House
        } else if (isFlush) {
            handRank = 6 + (values[4] / 100); // Flush
        } else if (isStraight) {
            handRank = 5 + (values[4] / 100); // Straight
        } else if (sortedGroups[0][1] === 3) {
            handRank = 4 + (sortedGroups[0][0] / 100); // Three of a Kind
        } else if (sortedGroups[0][1] === 2 && sortedGroups[1][1] === 2) {
            handRank = 3 + (sortedGroups[0][0] / 100) + (sortedGroups[1][0] / 1000); // Two Pair
        } else if (sortedGroups[0][1] === 2) {
            handRank = 2 + (sortedGroups[0][0] / 100); // One Pair
        } else {
            handRank = 1 + (values[4] / 100); // High Card
        }

        this.rank = handRank;
        return handRank;
    }
} 
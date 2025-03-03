import { Suit, Rank, RankCapitalized, CardName, RankValue, HandType, Board, Result } from './types';
import * as CONSTS from './constants';
import { Card, Hand } from './classes';

/**
 * Gets the card name
 * @param {Suit} suit The suit of the card
 * @param {Rank} rank The rank of the card
 * @returns {string} The card name
 */
export function getCardName(suit: Suit, rank: Rank): string {
    let r, s = '';

    switch (suit) {
        case 'hearts'   : s = 'H'; break;
        case 'diamonds' : s = 'D'; break;
        case 'clubs'    : s = 'C'; break;
        case 'spades'   : s = 'S'; break;
    }

    switch (rank) {
        case 'ace'    : r   = 'A'; break;
        case 'two'    : r   = '2'; break;
        case 'three'  : r   = '3'; break;
        case 'four'   : r   = '4'; break;
        case 'five'   : r   = '5'; break;
        case 'six'    : r   = '6'; break;
        case 'seven'  : r   = '7'; break;
        case 'eight'  : r   = '8'; break;
        case 'nine'   : r   = '9'; break;
        case 'ten'    : r   = 'T'; break;
        case 'jack'   : r   = 'J'; break;
        case 'queen'  : r   = 'Q'; break;
        case 'king'   : r   = 'K'; break;
    }

    return r + s;
}

/**
 * Type-Guard function, checks if the value is a card name
 * @param {any} value The value to check
 * @returns {boolean} True if the value is a card name, false otherwise
 */
export function isCardName(value: any): value is CardName {
    const cardNames: CardName[] = [
    'AH', '2H', '3H', '4H', '5H', '6H', '7H', '8H', '9H', 'TH', 'JH', 'QH', 'KH',
    'AD', '2D', '3D', '4D', '5D', '6D', '7D', '8D', '9D', 'TD', 'JD', 'QD', 'KD',
    'AC', '2C', '3C', '4C', '5C', '6C', '7C', '8C', '9C', 'TC', 'JC', 'QC', 'KC',
    'AS', '2S', '3S', '4S', '5S', '6S', '7S', '8S', '9S', 'TS', 'JS', 'QS', 'KS'
    ];
    return cardNames.includes(value);
}

/**
 * Type-Guard function, checks if the value is a rank or suit
 * @param {any} value The value to check
 * @returns {boolean} True if the value is a rank or suit, false otherwise
 */
export function isRankOrSuit(value: any): value is Rank | Suit {
    const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks: Array<Rank | RankValue> = ['ace', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'jack', 'queen', 'king', 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
    
    return suits.includes(value) || ranks.includes(value);
}

/**
 * Generates a random suit
 * @returns {Suit} A random suit
 */
export function generateRandomSuit(): Suit {
    const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
    return suits[Math.floor(Math.random() * suits.length)];
}

/**
 * Generates a random rank
 * @returns {Rank} A random rank
 */
export function generateRandomRank(): Rank {
    const ranks: Rank[] = ['two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'jack', 'queen', 'king', 'ace'];
    return ranks[Math.floor(Math.random() * ranks.length)];
}

/**
 * Generates a random hand of 5 cards
 * @returns {HandType} A random hand of 5 cards
 */
export function generateRandomHand(): HandType {
    const hand: HandType = [];
    for (let i = 0; i < 5; i++) {
        const card = new Card(generateRandomRank(), generateRandomSuit())
        hand.push(card);
    }
    return hand;
}

/**
 * Converts a numerical card rank to its corresponding string representation.
 * @param value Number between 2-14 or 100, indicating rank (or wild card)
 * @param capitalize Boolean value to indicate if return value should be capitalized
 * @returns A string with the written rank of the card rank input.
 */
export function valueToRank(value: RankValue, capitalize = false): Rank | RankCapitalized {
    switch (value) {
        case 2:   return (capitalize) ? 'Two'   : 'two';
        case 3:   return (capitalize) ? 'Three' : 'three';
        case 4:   return (capitalize) ? 'Four'  : 'four';
        case 5:   return (capitalize) ? 'Five'  : 'five';
        case 6:   return (capitalize) ? 'Six'   : 'six';
        case 7:   return (capitalize) ? 'Seven' : 'seven';
        case 8:   return (capitalize) ? 'Eight' : 'eight';
        case 9:   return (capitalize) ? 'Nine'  : 'nine';
        case 10:  return (capitalize) ? 'Ten'   : 'ten';
        case 11:  return (capitalize) ? 'Jack'  : 'jack';
        case 12:  return (capitalize) ? 'Queen' : 'queen';
        case 13:  return (capitalize) ? 'King'  : 'king';
        case 14:  return (capitalize) ? 'Ace'   : 'ace';
        case 100: return (capitalize) ? 'Wild'  : 'wild';
        default: throw new Error(`Invalid rank value: ${value}`);
    }
}

/** 
 * Takes in an array of Card objects and evaluates the best possible poker hand that can be made.
 * @param {Hand} hand An array of Card objects.
 * @returns {Object} { rank: number, message: string }
 * Rank is the numerical value used to compare against other hands,
 * Message is a string naming the poker hand that was evaluated.
 */
export function evaluateHand(hand: Hand): Result {
  
  const handCards = hand.cards;
  // Histogram
  // { rank: count }

  // Initialize empty histogram object
  const histogram: {[key in RankValue]?: number} = {};

  // Iterate over cards in hand array and increment counter for each RankValue present
  handCards.reduce((histogram: {[key in RankValue]?: number}, card: Card) => {
    histogram[card.value as RankValue] = (histogram[card.value as RankValue] || 0) + 1;
    return histogram;
  }, histogram);

  // Scored histogram
  // Descending by count
  // [ [ rank, count ] ]
  // scoredHistogram[x][0] references the rank of the cards (Jacks, Aces, etc.)
  // scoredHistogram[x][1] references the number of times that rank appears in a hand

  const scoredHistogram = Object
    .keys(histogram)
    .map(rank => [parseInt(rank), histogram[rank as unknown as RankValue]])
    .sort((a, b) => (a[1] ?? 0) === (b[1] ?? 0) ? (b[0] ?? 0) - (a[0] ?? 0) : (b[1] ?? 0) - (a[1] ?? 0));

    console.log(scoredHistogram);
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

  const bestHandObject: Result = {
    rank: 0,
    message: ''
  }


  bestHandObject.rank =

    (isStraight && isFlush && rankedHand[4] === 14 && !isWheel)   ? (10)
  : (isStraight && isFlush)                                       ? (9   + (rankedHand[0] / 100)) 
  : (scoredHistogram[0][1] === 4)                                 ? (8   + ((scoredHistogram[0][0] ?? 0) / 100))
  : (scoredHistogram[0][1] === 3 && scoredHistogram[1][1] === 2)  ? (7   + ((scoredHistogram[0][0] ?? 0) / 100) + ((scoredHistogram[1][0] ?? 0) / 1000))   
  : (isFlush)                                                     ? (6   + (rankedHand[0] / 100))
  : (isStraight)                                                  ? (5   + (rankedHand[0] / 100))
  : (scoredHistogram[0][1] === 3 && scoredHistogram[1][1] === 1)  ? (4   + ((scoredHistogram[0][0] ?? 0) / 100))
  : (scoredHistogram[0][1] === 2 && scoredHistogram[1][1] === 2)  ? (3   + ((scoredHistogram[0][0] ?? 0) / 100) + ((scoredHistogram[1][0] ?? 0)/ 1000))
  : (scoredHistogram[0][1] === 2 && scoredHistogram[1][1] === 1)  ? (2   + ((scoredHistogram[0][0] ?? 0) / 100))
  :                                                                 (1   + ((scoredHistogram[0][0] ?? 0) / 100));


  bestHandObject.message = bestHandValueToString(bestHandObject.rank, scoredHistogram as Array<Array<RankValue | number>>, rankedHand, handCards, isWheel);
  return bestHandObject;
}

/** 
 * Capitalizes the first letter of the provided string, intended for single word strings
 * @param {string} str The string to capitalize
 * @returns {string} The capitalized string
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/** 
 * Iterates over the board array and yields each card in the order of the board
 * @param {Board} board The board array to iterate over
 * @returns {IterableIterator<Card[]>} An iterator of the board cards
 */
export function* iterateBoard(board: Board): IterableIterator<Card[]> {
  yield*  board.flops;
  yield   board.turns;
  yield   board.rivers;
}


/** 
 * Converts the numerical value of the best hand to a string representation
 * @param {number} value The numerical value of the best hand
 * @param {Array<Array<RankValue | number>>} scoredHistogram The scored histogram of the hand
 * @param {RankValue[]} rankedHand The ranked hand of the hand  
 * @param {Array<Card>} handCards The hand cards of the hand
 * @param {boolean} isWheel The flag indicating if the hand is a wheel
 * @returns {string} The string representation of the best hand
 */
function bestHandValueToString(value: number, scoredHistogram: Array<Array<RankValue | number>>, rankedHand: RankValue[], handCards: Array<Card>, isWheel: boolean): string {
  if      (value >= 10) return `Royal Flush`;
  else if (value >= 9)  return `Straight Flush${isWheel ? ` (Wheel, ${capitalize(handCards[0].suit)})` : ` (${rankedHand[0]} - ${rankedHand[4]}, ${capitalize(handCards[0].suit)})`}`
  else if (value >= 8)  return `Four of a Kind (${capitalize(valueToRank(scoredHistogram[0][0] as RankValue))}'s)`;
  else if (value >= 7)  return `Full House (${capitalize(valueToRank(scoredHistogram[0][0] as RankValue))}'s over ${capitalize(valueToRank(scoredHistogram[1][0] as RankValue))}'s)`;
  else if (value >= 6)  return `Flush (${capitalize(handCards[0].suit)})`;
  else if (value >= 5)  return `Straight${isWheel ? ` (Wheel)` : ` (${rankedHand[0]} - ${rankedHand[4]})`}`;
  else if (value >= 4)  return `Three of a Kind (${capitalize(valueToRank(scoredHistogram[0][0] as RankValue))}'s)`;
  else if (value >= 3)  return `Two Pair (${capitalize(valueToRank(scoredHistogram[0][0] as RankValue))}'s and ${capitalize(valueToRank(scoredHistogram[1][0] as RankValue))}'s)`;
  else if (value >= 2)  return `Pair of ${capitalize(valueToRank(scoredHistogram[0][0] as RankValue))}'s`;
  else                  return `High Card (${capitalize(valueToRank(scoredHistogram[0][0] as RankValue))})`;
}

/** 
 * Sorts the provided numbers in descending order
 * @param {number} a The first number to compare
 * @param {number} b The second number to compare
 * @returns {number} The sorted number
 */
export function sortNumber(a, b) {
  return b - a;
}

/** 
 * Ranks the kickers of the provided hand
 * @param {string} ranks The ranks of the hand
 * @param {number} noOfCards The number of cards in the hand
 * @returns {number} The ranked kicker
 */
export function rankKickers(ranks, noOfCards) {
  let kickerRank: number = 0.0000;
  let myRanks: any[] = [];
  let rank: string = '';
  let i;

  for (i = 0; i <= ranks.length; i += 1) {
    rank = ranks.substr(i, 1);

    if (rank === 'A') {myRanks.push(0.2048); }
    if (rank === 'K') {myRanks.push(0.1024); }
    if (rank === 'Q') {myRanks.push(0.0512); }
    if (rank === 'J') {myRanks.push(0.0256); }
    if (rank === 'T') {myRanks.push(0.0128); }
    if (rank === '9') {myRanks.push(0.0064); }
    if (rank === '8') {myRanks.push(0.0032); }
    if (rank === '7') {myRanks.push(0.0016); }
    if (rank === '6') {myRanks.push(0.0008); }
    if (rank === '5') {myRanks.push(0.0004); }
    if (rank === '4') {myRanks.push(0.0002); }
    if (rank === '3') {myRanks.push(0.0001); }
    if (rank === '2') {myRanks.push(0.0000); }
  }

  myRanks.sort(sortNumber);

  for (i = 0; i < noOfCards; i += 1) {
    kickerRank += myRanks[i];
  }

  return kickerRank;
}

/**
 * Ranks the provided hand
 * @param {Hand} hand The hand to rank
 * @returns {Hand} The ranked hand
 * @property {number} rank The rank of the hand
 * @property {string} message The message of the hand
 */
export function rankHand(hand) {
  let myResult = evaluateHand(hand);
  hand.rank = myResult.rank;
  hand.message = myResult.message;

  return hand;
}

/**
 * Progresses the game state
 * @param {Table} table The table to progress
 * @returns {void}
 */
export function progress(table) {
  let i;
  table.eventEmitter.emit( "turn" );
  let cards, hand;
  if (table.game) {
    if (table.game.checkForEndOfRound(table)) {
      table.currentPlayer = (table.currentPlayer >= table.players.length-1) ? (table.currentPlayer-table.players.length+1) : (table.currentPlayer + 1 );
      //Move all bets to the pot
      for (i = 0; i < table.game.bets.length; i += 1) {
        table.game.pot += parseInt(table.game.bets[i], 10);
        table.game.roundBets[i] += parseInt(table.game.bets[i], 10);
      }
      if (table.game.roundName === 'River') {
        table.game.roundName = 'Showdown';
        table.game.bets.splice(0, table.game.bets.length);
        //Evaluate each hand
        for (let j = 0; j < table.players.length; j += 1) {
          cards = table.players[j].cards.concat(table.game.board);
          hand = new Hand(cards);
          table.players[j].hand = rankHand(hand);
        }
        table.game.checkForWinner(table);
        table.game.checkForBankrupt(table);
        table.eventEmitter.emit( "gameOver" );
      } else if (table.game.roundName === 'Turn') {
        console.log('effective turn');
        table.game.roundName = 'River';
        table.game.deck.pop(); //Burn a card
        table.game.board.push(table.game.deck.pop()); //Turn a card
        //table.game.bets.splice(0,table.game.bets.length-1);
        for (i = 0; i < table.game.bets.length; i += 1) {
          table.game.bets[i] = 0;
        }
        for (i = 0; i < table.players.length; i += 1) {
          table.players[i].talked = false;
        }
        table.eventEmitter.emit( "deal" );
      } else if (table.game.roundName === 'Flop') {
        console.log('effective flop');
        table.game.roundName = 'Turn';
        table.game.deck.pop(); //Burn a card
        table.game.board.push(table.game.deck.pop()); //Turn a card
        for (i = 0; i < table.game.bets.length; i += 1) {
          table.game.bets[i] = 0;
        }
        for (i = 0; i < table.players.length; i += 1) {
          table.players[i].talked = false;
        }
        table.eventEmitter.emit( "deal" );
      } else if (table.game.roundName === 'Deal') {
        console.log('effective deal');
        table.game.roundName = 'Flop';
        table.game.deck.pop(); //Burn a card
        for (i = 0; i < 3; i += 1) { //Turn three cards
          table.game.board.push(table.game.deck.pop());
        }
        //table.game.bets.splice(0,table.game.bets.length-1);
        for (i = 0; i < table.game.bets.length; i += 1) {
          table.game.bets[i] = 0;
        }
        for (i = 0; i < table.players.length; i += 1) {
          table.players[i].talked = false;
        }
        table.eventEmitter.emit( "deal" );
      }
    }
  }
}

/**
 * Gets the remaining elements from the collection
 * @param {Array} collection The collection to get the remaining elements from
 * @param {Array} extractedElements The elements to extract from the collection
 * @returns {Array} The remaining elements from the collection
 */
export function getRemainingElements(collection, extractedElements) {
  if (!Array.isArray(collection) || !Array.isArray(extractedElements)) {
    throw new Error("Both arguments must be arrays.");
  }

  const extractedSet = new Set(extractedElements);
  return collection.filter(element => !extractedSet.has(element));
}
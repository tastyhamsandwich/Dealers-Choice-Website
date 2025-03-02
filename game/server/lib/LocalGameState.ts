

import { GamePhase } from './types';
import { Player, Card } from './classes';

export default interface LocalGameState {
    currentPhase: GamePhase | string;
    pot: number;
    currentBet: number;
    activePlayerIndex: number;
    dealerIndex: number;
    players: Player[];
    communityCards: Card[] | string[];
    roundInProgress: boolean;
    minPlayers: number;
    smallBlind: number;
    bigBlind: number;
}
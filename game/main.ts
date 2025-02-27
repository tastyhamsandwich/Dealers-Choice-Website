import * as CONSTS from './client/lib/constants';
import { Debug } from './client/scenes/Debug';
import { Boot } from './client/scenes/Boot';
import { PokerGame } from './client/scenes/PokerGame';
import { GameOver } from './client/scenes/GameOver';
import { MainMenu } from './client/scenes/MainMenu';
import { Preloader } from './client/scenes/Preloader';
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin';

import { Game, Types } from "phaser";

// Define the user data interface
export interface IUserData {
    id: string;
    username: string;
    display_name?: string;
    avatar?: string;
    balance: number;
    level: number;
    exp: number;
}

// Extend the GameConfig type to include userData
interface GameConfigWithUser extends Types.Core.GameConfig {
    userData?: IUserData;
}

// Base configuration without user data
const config: GameConfigWithUser = {
    type: Phaser.AUTO,
    width: CONSTS.GAME_WIDTH,
    height: CONSTS.GAME_HEIGHT,
    dom: {
        createContainer: true,
    },
    parent: 'game-container',
    backgroundColor: '#028af8',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    plugins: {
        scene: [
            {
                key: 'rexUI',
                plugin: RexUIPlugin,
                mapping: 'rexUI'
            }
        ]
    },
    scene: [
        Boot,
        Preloader,
        MainMenu,
        Debug,
        PokerGame,
        GameOver
    ]
};

const StartGame = (parent: string, userData: IUserData) => {
    // Merge the base config with parent and userData
    const gameConfig: GameConfigWithUser = {
        ...config,
        parent,
        userData
    };
    
    return new Game(gameConfig);
}

export default StartGame;

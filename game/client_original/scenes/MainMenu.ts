import { Scene, GameObjects } from 'phaser';
import * as CONSTS from '../lib/constants';
import type Server from '../services/Server';

const c = CONSTS;

export class MainMenu extends Scene
{
    background!: GameObjects.Image;
    logo!: GameObjects.Image;
    title!: GameObjects.Text;

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        this.background = this.add.image(c.GAME_X_MID, c.GAME_Y_MID, 'background').setOrigin(0.5);

        this.logo = this.add.image(c.GAME_X_MID, 300, 'logo_wide');

        this.title = this.add.text(c.GAME_X_MID, 460, 'Main Menu', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        const Game = this.add.text(c.GAME_X_MID, 660, 'Game', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setInteractive();

        Game.on('pointerdown', () => {
            this.scene.start('PokerGame');
        });

        const debugButton = this.add.text(c.GAME_WIDTH - 175,50, 'DEBUG', {
            fontFamily: 'Arial Black', fontSize: 72, color: '#ffffff',
            stroke: '#FF0000', strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5).setInteractive();

        debugButton.on('pointerdown', () => {
          this.scene.start('Debug');
        });
    }
}

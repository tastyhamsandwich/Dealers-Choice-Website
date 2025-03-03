import { Scene, GameObjects } from "phaser";
import * as CONSTS from "../lib/constants";
import Server from "../services/Server";

const c = CONSTS;

export class MainMenu extends Scene
{
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        this.background = this.add.image(c.GAME_X_MID, c.GAME_Y_MID, 'background').setOrigin(0.5);

        this.logo = this.add.image(c.GAME_X_MID, 200, 'logo_wide');

        this.title = this.add.text(c.GAME_X_MID, this.logo.y + 100, 'Main Menu', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        const Game = this.add.text(c.GAME_X_MID, this.logo.y + 200, 'Game', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setInteractive();

        Game.on('pointerdown', () => {
            this.scene.start('SingleGame');
        });

        const Multi = this.add.text(c.GAME_X_MID, this.logo.y + 300, 'Multiplayer', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setInteractive();

        Multi.on('pointerdown', () => {
            const server = new Server();
            this.scene.start('PokerGame', { server });
        });

        const debugButton = this.add.text(c.GAME_X_MID, this.logo.y + 400, 'DEBUG', {
            fontFamily: 'Arial Black', fontSize: 72, color: '#ffffff',
            stroke: '#FF0000', strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5).setInteractive();

        debugButton.on('pointerdown', () => {
          this.scene.start('Debug');
        });
    }
}

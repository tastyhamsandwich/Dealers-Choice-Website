import { forwardRef, useEffect, useLayoutEffect, useRef } from 'react';
import StartGame from './main';
import { EventBus } from './EventBus';

export interface IRefPhaserGame
{
    game: Phaser.Game | null;
    scene: Phaser.Scene | null;
}

interface IUserData {
    id: string;
    username: string;
    display_name?: string;
    avatar?: string;
    balance: number;
    level: number;
    exp: number;
}

interface IProps
{
    currentActiveScene?: (scene_instance: Phaser.Scene) => void;
    userData: IUserData;
}

export const PhaserGame = forwardRef<IRefPhaserGame, IProps>(function PhaserGame({ currentActiveScene, userData }, ref)
{
    const game = useRef<Phaser.Game | null>(null!);

    useLayoutEffect(() =>
    {
        if (game.current === null)
        {
            game.current = StartGame("game-container", userData);

            if (typeof ref === 'function')
            {
                ref({ game: game.current, scene: null });
            } else if (ref)
            {
                ref.current = { game: game.current, scene: null };
            }

        }

        return () =>
        {
            if (game.current)
            {
                game.current.destroy(true);
                if (game.current !== null)
                {
                    game.current = null;
                }
            }
        }
    }, [ref, userData]);

    useEffect(() =>
    {
        EventBus.on('current-scene-ready', (scene_instance: Phaser.Scene) =>
        {
            if (currentActiveScene && typeof currentActiveScene === 'function')
            {
                currentActiveScene(scene_instance);
            }

            if (typeof ref === 'function')
            {
                ref({ game: game.current, scene: scene_instance });     
            } else if (ref)
            {
                ref.current = { game: game.current, scene: scene_instance };
            }
            
        });
        return () =>
        {
            EventBus.removeListener('current-scene-ready');
        }
    }, [currentActiveScene, ref]);

    return (
        <div id="game-container"></div>
    );

});
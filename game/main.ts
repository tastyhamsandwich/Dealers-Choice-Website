// Check if we're running on the server
const isServer = typeof window === 'undefined';

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

// Create a global variable to store user data
let globalUserData: IUserData | null = null;

// Function to get user data
export const getUserData = (): IUserData | null => globalUserData;

// Fallback/default constants to use when Phaser isn't available (server-side)
const DEFAULT_WIDTH = 1024;
const DEFAULT_HEIGHT = 768;

// Keep track of active game instance to prevent duplicates
let activeGame: any = null;
// Track if audio has been initialized
let audioInitialized = false;
// Track audio context state
let audioContextState: 'pending' | 'running' | 'closed' | null = null;
// Flag to track if we're currently in the process of closing the audio context
let isClosingAudioContext = false;
// Track event listeners to remove them properly
let audioEventListeners: { event: string, handler: EventListener }[] = [];
// Track visibility change listeners
let visibilityChangeListener: EventListener | null = null;
// Track any timers we create
let gameTimers: number[] = [];

// Function to clean up audio event listeners - only called on client
function cleanupAudioEventListeners() {
    // Skip this function entirely if we're on the server
    if (isServer) return;
    
    // Clean up audio listeners
    audioEventListeners.forEach(({ event, handler }) => {
        window.removeEventListener(event, handler);
    });
    audioEventListeners = [];
    
    // Clean up visibility change listener
    if (visibilityChangeListener) {
        document.removeEventListener('visibilitychange', visibilityChangeListener);
        visibilityChangeListener = null;
    }
    
    // Clean up any game timers
    cleanupGameTimers();
}

// Function to clean up timers
function cleanupGameTimers() {
    // Skip this function entirely if we're on the server
    if (isServer) return;
    
    // Clear all timers
    gameTimers.forEach(timerId => {
        window.clearInterval(timerId);
    });
    gameTimers = [];
}

// Main game starter function
const StartGame = (parent: string, userData: IUserData) => {
    // Return null if we're on the server
    if (isServer) {
        console.log("Attempted to start game on server, returning null");
        return null;
    }
    
    // Import Phaser and game scenes only on the client
    const startClientGame = () => {
        // Dynamic imports for Phaser and game scenes
        const { Game, Types, Scale, AUTO } = require('phaser');
        const CONSTS = require('./client/lib/constants');
        const { Debug } = require('./client/scenes/Debug');
        const { Boot } = require('./client/scenes/Boot');
        const { PokerGame } = require('./client/scenes/PokerGame');
        const { GameOver } = require('./client/scenes/GameOver');
        const { MainMenu } = require('./client/scenes/MainMenu');
        const { Preloader } = require('./client/scenes/Preloader');
        const RexUIPlugin = require('phaser3-rex-plugins/templates/ui/ui-plugin').default;
    
        // Clean up any existing audio event listeners
        cleanupAudioEventListeners();
    
        // If we already have an active game, destroy it first
        if (activeGame) {
            console.log("Destroying existing game instance before creating a new one");
            try {
                // Make sure to properly cleanup audio before destroying
                const soundManager = activeGame.sound;
                if (soundManager) {
                    try {
                        // Mute and stop all audio
                        soundManager.setMute(true);
                        soundManager.stopAll();
                        
                        // If it's a WebAudio sound manager with context, try to close it
                        const webAudioManager = soundManager;
                        if (webAudioManager.context && 
                            webAudioManager.context.state !== 'closed' && 
                            !isClosingAudioContext) {
                            
                            console.log("Closing audio context, current state:", webAudioManager.context.state);
                            
                            // Set the flag to prevent duplicate close attempts
                            isClosingAudioContext = true;
                            audioContextState = 'closed';
                            
                            // Note: we intentionally don't await this to avoid blocking
                            webAudioManager.context.close()
                                .then(() => {
                                    console.log("Audio context closed successfully");
                                    isClosingAudioContext = false;
                                })
                                .catch(e => {
                                    console.warn("Error closing audio context:", e);
                                    isClosingAudioContext = false;
                                });
                        }
                    } catch (soundError) {
                        console.warn("Error cleaning up sound manager:", soundError);
                        isClosingAudioContext = false;
                    }
                }
                
                // Now destroy the game
                activeGame.destroy(true);
                activeGame = null;
            } catch (e) {
                console.error("Error destroying existing game:", e);
                isClosingAudioContext = false;
            }
        }
    
        // Reset audio initialization flag
        audioInitialized = false;
        
        // Store user data globally
        globalUserData = userData;
        
        // Define the base config using dynamically imported modules
        const config = {
            type: AUTO,
            width: CONSTS.GAME_WIDTH || DEFAULT_WIDTH,
            height: CONSTS.GAME_HEIGHT || DEFAULT_HEIGHT,
            dom: {
                createContainer: true,
            },
            parent,
            backgroundColor: '#028af8',
            scale: {
                mode: Scale.FIT,
                autoCenter: Scale.CENTER_BOTH,
                padding: { top: 0, bottom: 0, left: 0, right: 0 }
            },
            // Add these audio settings to prevent AudioContext issues
            audio: {
                disableWebAudio: false,
                noAudio: false
            },
            // IMPORTANT: Keep the game running even when browser tab is not in focus
            disableVisibilityChange: true,
            // Add more robust renderer settings
            render: {
                powerPreference: 'high-performance',
                antialias: true,
                pixelArt: false,
                clearBeforeRender: true,
                failIfMajorPerformanceCaveat: false,
                roundPixels: false,
                premultipliedAlpha: true,
                batchSize: 2048,
                maxLights: 10
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
            physics: {
                default: 'arcade',
                arcade: {
                    debug: false,
                    gravity: { x: 0, y: 0 }
                }
            },
            scene: [
                Boot,
                Preloader,
                MainMenu,
                Debug,
                PokerGame,
                GameOver
            ],
            userData, // Include user data in the config
            // Add this to prevent visibility events issues in Next.js
            callbacks: {
                preBoot: (game) => {
                    // Set a reference to the active game
                    activeGame = game;
                    
                    // Adjust the canvas position to account for the NavBar
                    const parentElement = document.getElementById(parent);
                    if (parentElement) {
                        parentElement.style.paddingTop = '0px';
                    }
                },
                postBoot: (game) => {
                    // Disable visibility change handling which causes problems in React
                    game.sound.pauseOnBlur = false;
                    
                    // Set up a custom visibility change handler to better manage game state
                    setupVisibilityChangeHandler(game);
                    
                    // Track the audio context state
                    const webAudioManager = game.sound;
                    if (webAudioManager && webAudioManager.context) {
                        audioContextState = webAudioManager.context.state as 'pending' | 'running' | 'closed';
                        console.log("Audio context initial state:", audioContextState);
                    }
                    
                    // Set up audio event listeners only if not already done
                    if (!audioInitialized) {
                        setupAudioEventListeners(game);
                    }
                    
                    // Set up a heartbeat timer to check canvas regularly
                    const canvasHeartbeat = window.setInterval(() => {
                        if (!game || !game.canvas) return;
                        
                        // Check if canvas is still visible (not white)
                        try {
                            // If we're not hidden, make sure canvas is displayed properly
                            if (!document.hidden && game.canvas) {
                                // Ensure canvas is visible
                                game.canvas.style.display = 'block';
                                game.canvas.style.visibility = 'visible';
                                
                                // Every 10 seconds, do a more thorough check
                                // This helps recover from the white screen without
                                // constantly refreshing
                                const now = Date.now();
                                if (now % 10000 < 1000) { // roughly every 10 seconds
                                    if (game.renderer) {
                                        // Force a re-render
                                        game.renderer.resize(game.canvas.width, game.canvas.height);
                                        game.scale.refresh();
                                        console.log("Heartbeat canvas refresh");
                                    }
                                }
                            }
                        } catch (e) {
                            console.warn("Error in canvas heartbeat:", e);
                        }
                    }, 1000); // Check every second
                    
                    // Store the timer ID for cleanup
                    gameTimers.push(canvasHeartbeat);
                }
            }
        };
        
        // Create and return the new game instance
        return new Game(config);
    };
    
    // Try to start the game, handling any errors
    try {
        return startClientGame();
    } catch (error) {
        console.error("Failed to start Phaser game:", error);
        return null;
    }
};

// Function to set up a custom visibility change handler
function setupVisibilityChangeHandler(game: any) {
    // Remove any existing listener
    if (visibilityChangeListener) {
        document.removeEventListener('visibilitychange', visibilityChangeListener);
    }
    
    // Create a new listener that handles visibility changes
    visibilityChangeListener = () => {
        if (document.hidden) {
            // Page is hidden (user tabbed away)
            console.log("Game paused - tab inactive");
            
            // Instead of pausing the whole game, just pause certain elements
            // This approach preserves the game's visual state
            if (game && game.scene) {
                // Mute the sound but keep the game running
                if (game.sound) {
                    game.sound.mute = true;
                }
                
                // Instead of stopping the game loop completely, just pause it
                // This preserves the callback function
                if (game.loop) {
                    game.loop.pause();
                    console.log("Game loop paused");
                }
                
                // Disable input to prevent input-related errors
                if (game.input) {
                    game.input.enabled = false;
                    console.log("Game input disabled");
                }
                
                // Notify active scenes about visibility change
                game.scene.scenes.forEach(scene => {
                    if (scene.sys.settings.active && scene.handleVisibilityChange) {
                        scene.handleVisibilityChange(false);
                    }
                });
            }
        } else {
            // Page is visible again (user tabbed back)
            console.log("Game resumed - tab active");
            
            if (game && game.scene) {
                // Unmute the sound
                if (game.sound) {
                    game.sound.mute = false;
                }
                
                // Resume the game loop
                if (game.loop && game.loop.paused) {
                    try {
                        game.loop.resume();
                        console.log("Game loop resumed");
                    } catch (e) {
                        console.error("Error resuming game loop:", e);
                    }
                }
                
                // Re-enable input after a short delay to ensure the scene is ready
                setTimeout(() => {
                    if (game.input) {
                        game.input.enabled = true;
                        console.log("Game input re-enabled");
                    }
                }, 100);
                
                // Notify active scenes about visibility change
                game.scene.scenes.forEach(scene => {
                    if (scene.sys.settings.active && scene.handleVisibilityChange) {
                        scene.handleVisibilityChange(true);
                    }
                });
                
                // Force a renderer refresh to prevent WebGL context issues
                if (game.renderer) {
                    try {
                        // For WebGL renderer, reset the context
                        if (game.renderer.type === Phaser.WEBGL) {
                            game.renderer.reset();
                        }
                    } catch (e) {
                        console.error("Error refreshing renderer:", e);
                    }
                }
            }
        }
    };
    
    // Add the listener to the document
    document.addEventListener('visibilitychange', visibilityChangeListener);
}

// Separate function to set up audio event listeners - only called on client
function setupAudioEventListeners(game: any) {
    // Skip this function entirely if we're on the server
    if (isServer) return;
    
    // Set a flag to track if we've resumed audio yet
    game._hasResumedAudio = false;
    game._audioContextClosed = false;
    
    // Define the audio enabler function
    const enableAudio = function(event: Event) {
        if (!game || !game.sound) {
            console.log("No game or sound available to enable audio");
            return;
        }
        
        try {
            if (!game._hasResumedAudio && !game._audioContextClosed) {
                // Check if context exists and is not closed before trying to resume it
                const soundManager = game.sound;
                if (soundManager && 
                    soundManager.context && 
                    soundManager.context.state !== 'running' && 
                    soundManager.context.state !== 'closed') {
                    
                    console.log("Attempting to resume audio context from state:", soundManager.context.state);
                    soundManager.context.resume().then(() => {
                        game._hasResumedAudio = true;
                        audioContextState = 'running';
                        console.log("Audio context resumed successfully");
                    }).catch(e => {
                        console.warn("Audio context resume failed:", e);
                        // If we get a "context is closed" error, mark it as closed
                        if (e instanceof Error && e.toString().includes("closed")) {
                            game._audioContextClosed = true;
                        }
                    });
                } else if (soundManager?.context?.state === 'closed') {
                    game._audioContextClosed = true;
                    console.log("Audio context is already closed");
                } else {
                    console.log("Audio context already running or unavailable:", 
                        soundManager?.context ? soundManager.context.state : "No context");
                }
            }
        } catch (e: unknown) {
            console.warn("Error enabling audio:", e);
            // If we get a "context is closed" error, mark it as closed
            if (e instanceof Error && e.toString().includes("closed")) {
                game._audioContextClosed = true;
            }
        }
    };
    
    // Store references to event listeners for later cleanup
    const eventTypes = ['click', 'touchstart', 'keydown'];
    eventTypes.forEach(eventType => {
        // Only add this listener once to prevent duplicates
        window.removeEventListener(eventType, enableAudio);
        window.addEventListener(eventType, enableAudio, { once: true });
        audioEventListeners.push({ event: eventType, handler: enableAudio });
    });
    
    audioInitialized = true;
}

// Function to update user data
export const UpdateUserData = (userData: IUserData, gameKey?: string) => {
    // Skip if on server
    if (isServer) return;
    
    // Update global user data
    globalUserData = userData;
    
    // If we have an active game, update its userData
    if (activeGame) {
        activeGame.userData = userData;
        
        // Emit an event that scenes can listen for
        try {
            const { EventBus } = require('./EventBus');
            EventBus.emit('user-data-updated', userData);
            console.log("Emitted user data update event:", userData);
        } catch (e) {
            console.warn("Error emitting user data update:", e);
        }
    }
};

// Function to shut down the game
export const ShutdownGame = (gameKey?: string) => {
    // Skip if on server
    if (isServer) return;
    
    // Nothing to shutdown if no active game
    if (!activeGame) return;
    
    console.log("Manually shutting down game");
    
    try {
        // Clean up audio
        if (activeGame.sound && activeGame.sound.context) {
            // Check if the context is already closed
            const contextState = activeGame.sound.context.state;
            console.log("Audio context state before shutdown:", contextState);
            
            if (contextState !== 'closed') {
                activeGame.sound.mute = true;
                activeGame.sound.stopAll();
                
                // Mark the context as closed to prevent double-closing
                activeGame._audioContextClosed = true;
                
                // Don't manually close the AudioContext, let Phaser handle it
                // This prevents "Can't close an AudioContext twice" errors
            }
        }
        
        // Clean up event listeners and timers
        cleanupAudioEventListeners();
        cleanupGameTimers();
        
        // Destroy the game with proper options
        // true = remove canvas, false = don't noReturn
        activeGame.destroy(true, false);
        activeGame = null;
    } catch (e) {
        console.error("Error shutting down game:", e);
    }
};

export default StartGame;
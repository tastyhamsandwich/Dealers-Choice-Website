"use client";

import React, { useEffect, useRef, useState } from 'react';
import StartGame, { ShutdownGame, UpdateUserData, type IUserData } from './main';
import { useAuth } from '@/contexts/AuthContext';

interface PhaserGameProps {
  width?: number;
  height?: number;
  gameKey?: string;
}

export default function PhaserGame({ width, height, gameKey = 'default' }: PhaserGameProps) {
  const gameRef = useRef<HTMLDivElement>(null);
  const [gameInitialized, setGameInitialized] = useState<boolean>(false);
  const { profile, user } = useAuth();
  
  // Initialize the game when the component mounts
  useEffect(() => {
    // Skip if running on server
    if (typeof window === 'undefined') return;
    
    // Skip if we don't have a valid gameRef.current
    if (!gameRef.current) {
      console.warn('Game container ref is not available');
      return;
    }
    
    console.log(`Initializing game ${gameKey} with container:`, gameRef.current);
    
    // Start the game if not already initialized
    if (!gameInitialized) {
      try {
        // Convert profile to the format expected by the game
        const userData: IUserData | null = profile ? {
          id: profile.id,
          username: profile.username,
          balance: profile.balance,
          level: profile.level || 1,
          exp: profile.exp || 0,
          avatar: profile.avatar_url
        } : null;
        
        // Start the game - the function expects a string ID and userData
        const containerId = gameKey + '-container';
        
        // Set the ID attribute on the div element
        if (gameRef.current) {
          gameRef.current.id = containerId;
        }
        
        // StartGame expects a string container ID and userData
        const game = userData ? StartGame(containerId, userData) : null;
        
        setGameInitialized(true);
        console.log(`Game ${gameKey} initialized successfully`);
      } catch (error) {
        console.error(`Failed to initialize game ${gameKey}:`, error);
      }
    }
    
    // Cleanup function when component unmounts
    return () => {
      console.log(`Cleaning up game ${gameKey}`);
      if (gameInitialized) {
        // Proper cleanup using the exported ShutdownGame function
        try {
          ShutdownGame(gameKey);
          console.log(`Game ${gameKey} shut down successfully`);
        } catch (error) {
          console.error(`Error shutting down game ${gameKey}:`, error);
        }
      }
    };
  }, [width, height, gameKey, profile]);
  
  // Update the game's user data when profile changes
  useEffect(() => {
    // Skip if running on server
    if (typeof window === 'undefined') return;
    
    // Skip update if the game isn't initialized yet
    if (!gameInitialized) return;
    
    // Skip update if we don't have user profile data
    if (!user || !profile) {
      console.log('No user profile data available yet');
      return;
    }
    
    console.log('Updating game user data with profile:', profile);
    
    // Convert profile to the format expected by the game
    const userData: IUserData = {
      id: profile.id,
      username: profile.username,
      balance: profile.balance,
      level: profile.level || 1,
      exp: profile.exp || 0,
      avatar: profile.avatar_url
    };
    
    // Use the UpdateUserData function to update the game
    try {
      UpdateUserData(userData, gameKey);
      console.log(`User data updated for game ${gameKey}`);
    } catch (error) {
      console.error(`Failed to update user data for game ${gameKey}:`, error);
    }
  }, [profile, user, gameInitialized, gameKey]);
  
  // Add a visibility change effect to handle tab focus changes
  useEffect(() => {
    // Skip if running on server or if game isn't initialized
    if (typeof window === 'undefined' || !gameInitialized) return;
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('Tab hidden, React component aware');
        
        // Store the current visibility state
        if (gameRef.current) {
          gameRef.current.dataset.previousVisibility = 
            gameRef.current.style.visibility || 'visible';
        }
      } else {
        console.log('Tab visible again, React component aware');
        
        // Force the game container to be visible
        if (gameRef.current) {
          // Ensure container is visible
          gameRef.current.style.visibility = 'visible';
          gameRef.current.style.display = 'block';
          
          // Find and force Phaser canvas to be visible too
          const canvas = gameRef.current.querySelector('canvas');
          if (canvas) {
            canvas.style.visibility = 'visible';
            canvas.style.display = 'block';
            
            // Give the browser a moment to properly restore the canvas
            // before any WebGL operations are attempted
            setTimeout(() => {
              try {
                // This will help ensure the canvas is properly restored
                // before any WebGL operations are attempted
                const event = new Event('resize');
                window.dispatchEvent(event);
                
                // Force a redraw by temporarily changing the size
                const originalWidth = canvas.width;
                const originalHeight = canvas.height;
                
                // Only do this if we have valid dimensions
                if (originalWidth > 0 && originalHeight > 0) {
                  // Slightly modify size to force a redraw
                  canvas.width = originalWidth - 1;
                  canvas.height = originalHeight - 1;
                  
                  // Force a reflow
                  void canvas.offsetHeight;
                  
                  // Restore original size
                  setTimeout(() => {
                    canvas.width = originalWidth;
                    canvas.height = originalHeight;
                  }, 50);
                }
                
                console.log('React: Triggered resize event to refresh canvas');
              } catch (e) {
                console.error('Error during canvas refresh:', e);
              }
            }, 200);
            
            console.log('React: Forced canvas visibility');
          }
        }
      }
    };
    
    // Add the visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Clean up
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [gameInitialized]);
  
  return (
    <div 
      ref={gameRef} 
      className="game-container" 
      style={{ 
        width: width || '100%', 
        height: height || '100%',
        position: 'relative'
      }}
    >
      {!gameInitialized && <div className="loading">Loading game...</div>}
    </div>
  );
}
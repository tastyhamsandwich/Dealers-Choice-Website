"use client"

import { useEffect, useState } from 'react';
import PhaserGame from '@/game/PhaserGame';
import styles from './poker.module.css';
import { useAuth } from '@/contexts/AuthContext';

export default function PokerPage() {
    const { profile, loading } = useAuth();
    const [gameHeight, setGameHeight] = useState(600); // Default height
    
    // Set the game height based on window size, accounting for NavBar
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const updateHeight = () => {
                const navBarHeight = 64; // Adjust based on your NavBar height
                setGameHeight(window.innerHeight - navBarHeight);
            };
            
            // Set initial height
            updateHeight();
            
            // Update height on resize
            window.addEventListener('resize', updateHeight);
            
            // Clean up
            return () => window.removeEventListener('resize', updateHeight);
        }
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!profile) {
        return <div>Please log in to play poker</div>;
    }

    const userData = {
        id: profile.id,
        username: profile.username,
        balance: profile.balance,
        level: profile.level || 1,
        exp: profile.exp || 0,
        avatar: profile.avatar_url
    };

    return (
        <div className={styles['poker-page']}>
            <PhaserGame 
                gameKey="poker" 
                height={gameHeight}
            />
        </div>
    );
}
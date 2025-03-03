"use client"

import PhaserGame from '@/game/PhaserGame';
import './poker.module.css';
import { useAuth } from '@/contexts/AuthContext';

export default function PokerPage() {
    const { profile, loading } = useAuth();

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
        <div className="poker-page">
            <PhaserGame gameKey="poker" />
        </div>
    );
}
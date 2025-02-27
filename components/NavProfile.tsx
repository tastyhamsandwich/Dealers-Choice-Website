"use client"

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function NavProfile() {
    const { profile, signOut } = useAuth();
    
    return (
        <div className="profile-container">
            <div className="username">{profile?.username}</div>
            <div className="wallet-container">
                <div className="balance">{profile?.balance}</div>
            </div>
            <button 
                onClick={signOut}
                className="logout-button w-full"
            >
                Logout
            </button>
        </div>
    );
}
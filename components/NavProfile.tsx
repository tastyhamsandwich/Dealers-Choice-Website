"use client"

import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import './styles.module.css';

export default function NavProfile() {
    const { profile, signOut } = useAuth();
    
    useEffect(() => {
        console.log('NavProfile received profile:', profile);
    }, [profile]);
        
    if (!profile) {
        // Fallback UI if profile is not available
        return (
            <div className="profile-container">
                <div className="username">User</div>
                <div className="wallet-container">
                    <div className="balance">$0.00</div>
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
    
    return (
        <div className="profile-container">
            <div className="username">{profile.username || 'User'}</div>
            <div className="wallet-container">
                <div className="balance">${profile.balance}</div>
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
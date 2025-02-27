"use client"

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import NavProfile from './NavProfile';

export default function NavRight() {
    const { user, profile, loading } = useAuth();
    
    return (
        <div className="nav-right">
            {loading ? (
                <div>Loading...</div>
            ) : (
                user ? (
                    <NavProfile />
                ) : (
                    <div className="auth-buttons">
                        {/* Login/Register buttons */}
                    </div>
                )
            )}
        </div>
    );
}
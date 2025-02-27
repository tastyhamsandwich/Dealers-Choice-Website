"use client"

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import NavProfile from './NavProfile';
import NavLogin from './NavLogin';  // Import the NavLogin component

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
                    <NavLogin />  // Use the NavLogin component here
                )
            )}
        </div>
    );
}
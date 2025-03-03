"use client"

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import NavProfile from './NavProfile';
import NavLogin from './NavLogin';

export default function NavRight() {
    const { user, profile, loading } = useAuth();
    const [loadingTimeout, setLoadingTimeout] = useState(false);
    
    // Add a timeout to show a different message if loading takes too long
    useEffect(() => {
        let timer: NodeJS.Timeout | null = null;
        
        if (loading) {
            timer = setTimeout(() => {
                setLoadingTimeout(true);
            }, 5000); // Show extended message after 5 seconds
        } else {
            setLoadingTimeout(false);
        }
        
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [loading]);
    
    // Add an effect to log authentication state changes for debugging
    useEffect(() => {
        console.log('NavRight auth state:', { 
            user: user?.id || null, 
            profile: profile?.username || null, 
            loading,
            timestamp: new Date().toISOString()
        });
    }, [user, profile, loading]);

    return (
        <div className="nav-right">
            {loading ? (
                <div className="loading-indicator" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {loadingTimeout ? (
                        <>
                            <div>Still trying to connect...</div>
                            <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                                Authentication is taking longer than expected
                            </div>
                        </>
                    ) : (
                        <div>Loading authentication...</div>
                    )}
                </div>
            ) : (
                user && profile ? (
                    <NavProfile />
                ) : (
                    <NavLogin />
                )
            )}
        </div>
    );
}
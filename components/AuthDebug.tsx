"use client"

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Debug component for authentication issues
 * Add this component temporarily to any page to debug authentication state
 * 
 * Usage:
 * import AuthDebug from '@/components/AuthDebug';
 * 
 * // Then in your component:
 * <AuthDebug />
 */
export default function AuthDebug() {
    const { user, profile, loading } = useAuth();
    const [authEvents, setAuthEvents] = useState<{time: string, event: string}[]>([]);
    const [expanded, setExpanded] = useState(false);
    
    // Track auth state changes
    useEffect(() => {
        const newEvent = {
            time: new Date().toISOString().split('T')[1].split('.')[0],
            event: `Auth state: ${loading ? 'loading' : 'ready'}, User: ${user?.id ? 'logged in' : 'not logged in'}`
        };
        setAuthEvents(prev => [...prev, newEvent].slice(-10)); // Keep the last 10 events
    }, [user, loading]);
    
    // Also track profile changes
    useEffect(() => {
        if (profile) {
            const newEvent = {
                time: new Date().toISOString().split('T')[1].split('.')[0],
                event: `Profile updated: ${profile.username}, balance: ${profile.balance}`
            };
            setAuthEvents(prev => [...prev, newEvent].slice(-10)); // Keep the last 10 events
        }
    }, [profile]);
    
    const toggleExpanded = () => setExpanded(!expanded);
    
    if (!expanded) {
        return (
            <div 
                style={{
                    position: 'fixed',
                    bottom: '10px',
                    right: '10px',
                    background: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    padding: '5px 10px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    zIndex: 9999
                }}
                onClick={toggleExpanded}
            >
                Auth Debug 🔍
            </div>
        );
    }
    
    return (
        <div 
            style={{
                position: 'fixed',
                bottom: '10px',
                right: '10px',
                background: 'rgba(0,0,0,0.8)',
                color: 'white',
                padding: '10px',
                borderRadius: '5px',
                maxWidth: '350px',
                maxHeight: '80vh',
                overflowY: 'auto',
                zIndex: 9999
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <h3 style={{ margin: 0 }}>Auth Debug</h3>
                <button 
                    onClick={toggleExpanded}
                    style={{ 
                        background: 'transparent', 
                        border: 'none', 
                        color: 'white', 
                        cursor: 'pointer',
                        fontSize: '16px' 
                    }}
                >
                    ✖
                </button>
            </div>
            
            <div style={{ marginBottom: '10px' }}>
                <div><strong>Status:</strong> {loading ? '🔄 Loading...' : '✅ Ready'}</div>
                <div><strong>User:</strong> {user ? '👤 ' + (user.email || user.id) : '❓ Not logged in'}</div>
                <div><strong>Profile:</strong> {profile ? '👤 ' + profile.username : '❓ No profile'}</div>
            </div>
            
            <div>
                <strong>Event Log:</strong>
                <div style={{ 
                    border: '1px solid rgba(255,255,255,0.2)', 
                    borderRadius: '3px',
                    padding: '5px',
                    marginTop: '5px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    maxHeight: '200px',
                    overflowY: 'auto'
                }}>
                    {authEvents.map((evt, idx) => (
                        <div key={idx} style={{ marginBottom: '3px' }}>
                            <span style={{ color: '#aaa' }}>[{evt.time}]</span> {evt.event}
                        </div>
                    ))}
                </div>
            </div>
            
            <div style={{ marginTop: '10px', fontSize: '12px', color: '#aaa' }}>
                This is a debug tool. Remove from production.
            </div>
        </div>
    );
} 
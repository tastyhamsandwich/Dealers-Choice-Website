"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@supaC'; // Ensure this import is correct
import type { User } from '@supabase/supabase-js';
// Wait to import EventBus until we're in client-side code to avoid window is not defined errors
// import { EventBus } from '@/game/EventBus';

// Define the profile type
interface ProfileProps {
    username: string,
    balance: number,
    id: string,
    level?: number,
    exp?: number,
    avatar_url?: string
}

// Define the shape of our context
interface AuthContextType {
    user: User | null;
    profile: ProfileProps | null;
    loading: boolean;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider props
interface AuthProviderProps {
    children: ReactNode;
}

// Create the provider component
export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<ProfileProps | null>(null);
    const [loading, setLoading] = useState(true);
    const [initialAuthCheckComplete, setInitialAuthCheckComplete] = useState(false);
    const supabase = createClient();
    
    // Function to fetch profile data
    const fetchProfile = async (userId: string) => {
        try {
            console.log('Fetching profile for user:', userId);
            const { data, error } = await supabase
                .from('profiles')
                .select('id, username, balance, level, exp, avatar_url')
                .eq('id', userId)
                .single();
                
            if (error) {
                console.error('Profile fetch error:', error);
                if (error.code === 'PGRST116') {
                    // Profile not found, create a default one
                    const defaultProfile = {
                        id: userId,
                        username: 'New User',
                        balance: 0,
                        level: 1,
                        exp: 0
                    };
                    
                    console.log('Creating default profile for new user');
                    setProfile(defaultProfile);
                    
                    // Consider creating this profile in the database here
                    // await supabase.from('profiles').insert([defaultProfile]);
                } else {
                    setProfile(null);
                }
            } else if (data) {
                console.log('Profile fetched successfully:', data);
                setProfile(data);
                
                // Emit an event that the Phaser game can listen for - but only on client side
                if (typeof window !== 'undefined') {
                    try {
                        // Dynamically import EventBus to prevent SSR issues
                        const { EventBus } = require('@/game/EventBus');
                        EventBus.emit('user-data-updated', {
                            id: data.id,
                            username: data.username,
                            balance: data.balance,
                            level: data.level || 1,
                            exp: data.exp || 0,
                            avatar: data.avatar_url
                        });
                    } catch (e) {
                        console.warn('Error emitting user data event:', e);
                    }
                }
            } else {
                // No data and no error, this is unexpected
                console.warn('No profile data returned for user:', userId);
                setProfile(null);
            }
        } catch (error) {
            console.error('Unexpected error fetching profile:', error);
            setProfile(null);
        } finally {
            // Always finish loading regardless of errors
            setLoading(false);
        }
    };
    
    // Function to refresh profile data
    const refreshProfile = async () => {
        if (user) {
            setLoading(true);
            await fetchProfile(user.id);
        }
    };
    
    // Sign out function
    const signOut = async () => {
        try {
            setLoading(true);
            await supabase.auth.signOut();
            setUser(null);
            setProfile(null);
        } catch (error) {
            console.error('Error signing out:', error);
        } finally {
            setLoading(false);
        }
    };
    
    // Initialize auth state on mount (separate from the auth state listener)
    useEffect(() => {
        const initAuth = async () => {
            console.log('Initializing auth state...');
            setLoading(true);
            
            try {
                // Get current session
                const { data: { session }, error } = await supabase.auth.getSession();
                
                if (error) {
                    console.error('Error getting session:', error);
                    // Even with error, we should end loading state
                    setLoading(false);
                    return;
                }
                
                // Handle session state
                if (session?.user) {
                    console.log('Found session with user:', session.user.id);
                    setUser(session.user);
                    await fetchProfile(session.user.id);
                } else {
                    console.log('No session found');
                    setUser(null);
                    setProfile(null);
                    setLoading(false); // Make sure to set loading to false for no user case
                }
                
                console.log('Auth initialization complete');
            } catch (e) {
                console.error('Unexpected error during auth initialization:', e);
                // Ensure loading state is ended even on error
                setLoading(false);
            }
        };
        
        // Call the initialization function
        initAuth();
    }, []);
    
    // Set up auth state change listener (separate effect for cleaner code)
    useEffect(() => {
        console.log('Setting up auth state change listener');
        
        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('Auth state changed:', event, session?.user?.id);
                
                // Set loading to true for any auth event except SIGNED_OUT
                if (event !== 'SIGNED_OUT') {
                    setLoading(true);
                }
                
                // Handle different auth events
                if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
                    if (session?.user) {
                        setUser(session.user);
                        await fetchProfile(session.user.id);
                    }
                } else if (event === 'SIGNED_OUT') {
                    setUser(null);
                    setProfile(null);
                    setLoading(false);
                } else if (session?.user) {
                    // For other events with a user, update user and fetch profile
                    setUser(session.user);
                    await fetchProfile(session.user.id);
                } else {
                    // For other events without a user, clear data and end loading
                    setUser(null);
                    setProfile(null);
                    setLoading(false);
                }
            }
        );
        
        return () => {
            subscription.unsubscribe();
        };
    }, []);
    
    // Create the value object with all the context data
    const value = {
        user,
        profile,
        loading,
        signOut,
        refreshProfile
    };
    
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook to use the auth context
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
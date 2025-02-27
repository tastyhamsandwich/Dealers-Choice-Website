"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@supaC'; // Ensure this import is correct
import type { User } from '@supabase/supabase-js';

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
    const supabase = createClient();
    
    // Function to fetch profile data
    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, username, balance')
                .eq('id', userId)
                .single();
                
            if (error) {
                console.error('Profile fetch error:', error);
                if (error.code === 'PGRST116') {
                    // Profile not found, create a default one
                    const defaultProfile = {
                        id: userId,
                        username: 'New User',
                        balance: 0
                    };
                    setProfile(defaultProfile);
                    
                    // Consider creating this profile in the database here
                    // await supabase.from('profiles').insert([defaultProfile]);
                } else {
                    setProfile(null);
                }
            } else if (data) {
                setProfile(data);
            } else {
                // No data and no error, this is unexpected
                console.warn('No profile data returned for user:', userId);
                setProfile(null);
            }
        } catch (error) {
            console.error('Unexpected error fetching profile:', error);
            setProfile(null);
        } finally {
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
    
    useEffect(() => {
        const setupAuth = async () => {
            setLoading(true);
            
            try {
                // Get initial session
                const { data: { session }, error } = await supabase.auth.getSession();
                
                if (error) {
                    console.error('Session error:', error);
                    setLoading(false);
                    return;
                }
                
                if (session?.user) {
                    setUser(session.user);
                    await fetchProfile(session.user.id);
                } else {
                    setUser(null);
                    setProfile(null);
                    setLoading(false);
                }
                
                // Set up auth state change listener
                const { data: { subscription } } = supabase.auth.onAuthStateChange(
                    async (event, session) => {
                        console.log('Auth state changed:', event, session?.user?.id);
                        
                        // Handle different auth events
                        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
                            if (session?.user) {
                                setLoading(true);
                                setUser(session.user);
                                await fetchProfile(session.user.id);
                            }
                        } else if (event === 'SIGNED_OUT') {
                            setUser(null);
                            setProfile(null);
                            setLoading(false);
                        } else {
                            // For other events, just update state based on session
                            const currentUser = session?.user ?? null;
                            setUser(currentUser);
                            
                            if (currentUser) {
                                await fetchProfile(currentUser.id);
                            } else {
                                setProfile(null);
                                setLoading(false);
                            }
                        }
                    }
                );
                
                return () => {
                    subscription.unsubscribe();
                };
            } catch (error) {
                console.error('Auth setup error:', error);
                setLoading(false);
            }
        };
        
        setupAuth();
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
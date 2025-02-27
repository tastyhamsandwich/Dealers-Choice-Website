"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@supaC';
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
                if (error.code === 'PGRST116') {
                    // Profile not found, create a default one
                    const defaultProfile = {
                        id: userId,
                        username: 'New User',
                        balance: 0
                    };
                    setProfile(defaultProfile);
                } else {
                    console.error('Profile fetch error:', error);
                }
            } else {
                setProfile(data);
            }
        } catch (error) {
            console.error('Unexpected error fetching profile:', error);
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
            await supabase.auth.signOut();
            setProfile(null);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };
    
    useEffect(() => {
        const setupAuth = async () => {
            try {
                // Get initial session
                const { data: { session }, error } = await supabase.auth.getSession();
                
                if (error) {
                    console.error('Session error:', error);
                    setLoading(false);
                    return;
                }
                
                if (session) {
                    const { data: { user }, error: userError } = await supabase.auth.getUser();
                    
                    if (userError) {
                        console.error('User error:', userError);
                        setLoading(false);
                        return;
                    }
                    
                    setUser(user);
                    await fetchProfile(user!.id);
                } else {
                    setLoading(false);
                }
                
                // Set up auth state change listener
                const { data: { subscription } } = supabase.auth.onAuthStateChange(
                    async (_event, session) => {
                        const currentUser = session?.user ?? null;
                        setUser(currentUser);
                        
                        if (currentUser) {
                            await fetchProfile(currentUser.id);
                        } else {
                            setProfile(null);
                            setLoading(false);
                        }
                    }
                );
                
                return () => subscription.unsubscribe();
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
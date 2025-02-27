"use client"

import { createClient } from '@/lib/supabase/client'
import NavLogin from '@/components/NavLogin'
import NavProfile from '@/components/NavProfile'
import { useEffect, useState, useRef } from 'react'
import type { User } from '@supabase/supabase-js'

interface ProfileProps {
    username: string,
    balance: number,
    id: string,
    level?: number,
    exp?: number,
    avatar_url?: string
}

const NavRight = () => {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<ProfileProps | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()
    
    // Use a ref to track if we've already set up auth
    const authInitialized = useRef(false)

    useEffect(() => {
        // Prevent multiple initializations
        if (authInitialized.current) return
        authInitialized.current = true
        
        console.log("NavRight component mounted")
        
        // Non-async function for the initial setup
        const setupAuth = () => {
            // Get session
            supabase.auth.getSession().then(({ data: { session }, error: sessionError }) => {
                if (sessionError) {
                    console.error('Session error:', sessionError)
                    setLoading(false)
                    return
                }
                
                if (session) {
                    // Get user
                    supabase.auth.getUser().then(({ data: { user }, error: userError }) => {
                        if (userError) {
                            console.error('User error:', userError)
                            setLoading(false)
                            return
                        }
                        
                        setUser(user)
                        
                        // Fetch profile
                        fetchProfile(user!.id)
                    })
                } else {
                    console.log('No session found')
                    setLoading(false)
                }
            })
            
            // Set up auth state change listener
            const { data: { subscription } } = supabase.auth.onAuthStateChange(
                (_event, session) => {
                    const currentUser = session?.user ?? null
                    setUser(currentUser)
                    
                    if (currentUser) {
                        fetchProfile(currentUser.id)
                    } else {
                        setProfile(null)
                        setLoading(false)
                    }
                }
            )
            
            return () => subscription.unsubscribe()
        }
        
        // Helper function to fetch profile
        const fetchProfile = (userId: string) => {
            Promise.resolve(
                supabase
                    .from('profiles')
                    .select('id, username, balance')
                    .eq('id', userId)
                    .single()
            )
            .then(({ data, error }) => {
                if (error) {
                    if (error.code === 'PGRST116') {
                        // Profile not found, create a default one
                        const defaultProfile = {
                            id: userId,
                            username: 'New User',
                            balance: 0
                        };
                        setProfile(defaultProfile)
                    }
                } else {
                    setProfile(data)
                }
            })
            .catch((err) => {
                console.error('Unexpected error in fetchProfile:', err)
            })
            .finally(() => {
                setLoading(false)
            });
        }
        
        const cleanup = setupAuth()
        return cleanup
    }, []) // Empty dependency array

    if (loading) {
        return <div style={{color: "#fff"}}>Loading...</div>
    }

    if (!user || !profile) {
        return <NavLogin />
    }
    
    return <NavProfile profile={profile} />
}

export default NavRight
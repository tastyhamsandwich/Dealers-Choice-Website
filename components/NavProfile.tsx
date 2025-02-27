"use client"

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import "./styles.module.css"; 
import { createClient } from '@supaC';
import type { User } from '@supabase/supabase-js';

interface ProfileProps {
    username: string,
    balance: number,
    id: string,
    level?: number,
    exp?: number,
    avatar_url?: string
}

export default function NavProfile(props: {profile: ProfileProps}) {
    const router = useRouter();
    const profile = props.profile;
    const [user, setUser] = useState<User | null>(null);
    
    useEffect(() => {
        // Fetch user data in useEffect instead of using async component
        const supabase = createClient();
        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user);
        }).catch(error => {
            console.error('Error fetching user:', error);
        });
    }, []);

    return (
        <div className="profile-container">
            <div className="dropdown dropdown-end mr-4">
                <label tabIndex={0} className="avatar btn btn-circle btn-ghost" htmlFor="avatar">
                    <div className="w-10 rounded-full">
                        
                    </div>
                </label>
                <ul tabIndex={0} className="menu-compact menu dropdown-content mt-3 w-52 rounded-box bg-base-100 p-2 shadow">
                    <li>
                        <a href="/profile" className="justify-between">Profile</a>
                    </li>
                    <li>
                        <a href="/settings">Settings</a>
                    </li>
                    <li>
                        <form action="/logout" method="POST">
                            <button type="submit" className="w-full text-start">Logout</button>
                        </form>
                    </li>
                </ul>
            </div>
            <div className="username-container">
                <h2>{profile.username}</h2>
            </div>
            <div className="wallet-container">
                Balance: <span className="balance">{profile.balance}</span>
            </div>
        </div>
    ) 
}
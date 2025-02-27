"use client"

import React from 'react';
import { useRouter } from 'next/navigation';
import { signInAction } from '@/app/actions';
import "./styles.module.css";

export default function NavLogin() {
    const router = useRouter();
    
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        
        signInAction(formData)
            .then(() => {
                router.refresh();
            })
            .catch(error => {
                console.error('Login error:', error);
            });
    };
    
    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <label htmlFor="email">
                    <input 
                        className="login-input" 
                        type="text" 
                        name="email" 
                        placeholder="Email" 
                        aria-describedby="user-email"
                        aria-invalid="false"
                        required 
                    />
                </label>
                <label htmlFor="password">
                    <input
                        className="login-input"
                        type="password"
                        name="password"
                        placeholder="Password"
                        aria-describedby="user-password"
                        aria-invalid="false"
                        required
                    />
                </label>
                <div className="button-signup-container">
                    <button type="submit" className="login-button">Login</button>
                    <div className="signup-container">
                        <a href="/signup" className="signup-link">New user? Sign up!</a>
                    </div>
                </div>
            </form>
        </div>
    );
}
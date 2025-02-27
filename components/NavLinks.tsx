"use client"

import React from 'react';
import Link from 'next/link';
import "@styles/navstyles.css";
import { useAuth } from '@/contexts/AuthContext';

export default function NavLinks() {
    const { user } = useAuth();
    const isLoggedIn = !!user;
    
    const links = [
        {name: 'Home', path: '/', protected: false},
        {name: 'About', path: '/about', protected: false},
        {name: 'Login', path: '/login', protected: false, hideWhenLoggedIn: true},
        {name: 'Register', path: '/signup', protected: false, hideWhenLoggedIn: true},
        {name: 'Poker', path: '/poker', protected: true},
        {name: 'Logout', path: '/logout', protected: true},
        {name: 'Payment', path: '/payment', protected: false}
    ].map((item) => {
        // Skip items that should be hidden when logged in
        if (item.hideWhenLoggedIn && isLoggedIn) {
            return null;
        }
        
        // Show the item if it's not protected or if the user is logged in and it is protected
        if (!item.protected || (isLoggedIn && item.protected)) {
            return (
                <li className="nav-item" key={item.name}>
                    <Link href={item.path} className="rounded-lg px-3 py-2 text-slate-700 font-medium hover:bg-slate-100 hover:text-slate-900">{item.name}</Link>
                </li>
            );
        }
        return null;
    });   
    
    return (
        <div className='navbar-container'>
            <nav className="navbar">
                <ul>
                    {links}
                </ul>
            </nav>
        </div>
    );
}
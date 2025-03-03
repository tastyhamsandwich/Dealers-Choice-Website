"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import AvatarUpload from '@comps/AvatarUpload';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { profile } = useAuth();
    const [showUpload, setShowUpload] = useState(false);
    const [imageError, setImageError] = useState(false);

    // Debug log the avatar URL
    useEffect(() => {
        if (profile?.avatar_url) {
            console.log('Avatar URL:', profile.avatar_url);
        }
    }, [profile?.avatar_url]);

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-[#333] text-white shadow-xl">
                {/* Profile Section */}
                <div className="p-6 border-b border-gray-700">
                    <div className="flex flex-col items-center">
                        <div 
                            className="relative w-32 h-32 mb-4 rounded-full cursor-pointer group"
                            onMouseEnter={() => setShowUpload(true)}
                            onMouseLeave={() => setShowUpload(false)}
                        >
                            {profile?.avatar_url && !imageError ? (
                                <>
                                    <Image
                                        src={profile.avatar_url}
                                        alt={profile.username || 'Profile'}
                                        width={128}
                                        height={128}
                                        className="rounded-full object-cover border-4 border-[#4caf50] shadow-lg"
                                        priority
                                        onError={() => {
                                            console.error('Failed to load avatar:', profile.avatar_url);
                                            setImageError(true);
                                        }}
                                        unoptimized // Try without Next.js image optimization
                                    />
                                    {/* Hover Overlay */}
                                    <div className={`absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-50 transition-opacity duration-200 ${showUpload ? 'opacity-100' : 'opacity-0'}`}>
                                        <span className="text-white text-sm">Change Avatar</span>
                                    </div>
                                    {/* Hidden AvatarUpload */}
                                    <div className={`absolute inset-0 ${showUpload ? 'block' : 'hidden'}`}>
                                        <AvatarUpload />
                                    </div>
                                </>
                            ) : (
                                <div className="relative w-full h-full">
                                    <div className="absolute inset-0 rounded-full bg-gray-600 flex items-center justify-center border-4 border-[#4caf50] shadow-lg">
                                        <span className="text-4xl">
                                            {profile?.username?.charAt(0).toUpperCase() || '?'}
                                        </span>
                                    </div>
                                    {/* Hover Overlay */}
                                    <div className={`absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-50 transition-opacity duration-200 ${showUpload ? 'opacity-100' : 'opacity-0'}`}>
                                        <span className="text-white text-sm">Add Avatar</span>
                                    </div>
                                    {/* Hidden AvatarUpload */}
                                    <div className={`absolute inset-0 ${showUpload ? 'block' : 'hidden'}`}>
                                        <AvatarUpload />
                                    </div>
                                </div>
                            )}
                        </div>
                        <h2 className="text-xl font-bold mb-2">{profile?.username || 'Loading...'}</h2>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="p-4">
                    <ul className="space-y-2">
                        <li>
                            <Link 
                                href="/dashboard"
                                className="flex items-center px-4 py-2 text-gray-300 hover:bg-[#575757] hover:text-white rounded transition-colors duration-200"
                            >
                                Overview
                            </Link>
                        </li>
                        <li>
                            <Link 
                                href="/dashboard/stats"
                                className="flex items-center px-4 py-2 text-gray-300 hover:bg-[#575757] hover:text-white rounded transition-colors duration-200"
                            >
                                Statistics
                            </Link>
                        </li>
                        <li>
                            <Link 
                                href="/dashboard/history"
                                className="flex items-center px-4 py-2 text-gray-300 hover:bg-[#575757] hover:text-white rounded transition-colors duration-200"
                            >
                                Game History
                            </Link>
                        </li>
                        <li>
                            <Link 
                                href="/dashboard/settings"
                                className="flex items-center px-4 py-2 text-gray-300 hover:bg-[#575757] hover:text-white rounded transition-colors duration-200"
                            >
                                Settings
                            </Link>
                        </li>
                    </ul>
                </nav>

                {/* Balance Display */}
                <div className="absolute bottom-0 w-64 p-6 border-t border-gray-700">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-400">Balance</span>
                        <span className="text-[#eedd00] font-bold">
                            ${profile?.balance?.toFixed(2) || '0.00'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <div className="p-8">
                    {children}
                </div>
            </div>
        </div>
    );
}

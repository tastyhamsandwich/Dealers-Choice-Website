"use client";

import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

function Dashboard() {
    const { profile, signOut } = useAuth();
    const router = useRouter();
    useEffect(() => {
        if (!profile) {
            router.push('/login');
        }
    }, [profile, router]);


return `<h2>Success!</h2>`

}

export default Dashboard;
"use server"

import type { NextApiRequest, NextApiResponse } from 'next';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const supabase = await createClient();
    const { login, password } = req.body;

    try {
        
        const data = {
            email: login as string,
            password: password as string
        }

        const { error } = await supabase.auth.signInWithPassword(data);

        if (error) {
            redirect('/error');
        }

        revalidatePath('/', 'layout');
        redirect('/dashboard');
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
}
"use server"

import { createClient } from '@/utils/supabase/server';

async function handler(req, res) {

    if (req.method !== 'POST')
        return res.status(405).json({ error: 'Method not allowed' });
    

    const { email, username, password, confirmPassword, dob } = req.body;

    if (!password || password.trim().length < 8) {
        res.status(422)
            .json({
                message: 'Invalid input. Password should be at least 8 characters long.'
        });
        return;
    }

    if (!email?.includes('@')) {
        res.status(422)
            .json({
                message: 'Invalid input. E-mail address is not valid.'
            });
        return;
    }
    
    if (username.trim().lengh < 4) {
        res.status(422)
            .json({
                message: 'Invalid input. Username must be at least 4 characters long.'
            });
        return;
    }

    if (password !== confirmPassword) {
        res.status(422)
            .json({
                message: 'Passwords do not match, please re-enter.'
            });
        return;
    }

    const supabase = await createClient();
    
    const { error } = await supabase.auth.signUp({
        email: email, 
        password: password,
        options: {
            data: {
                username: username,
                dob: dob,
                display_name: username,
                role: 'user',
            }
        }
    })

    if (error)
        console.error(error);

    res.status(201).json({ message: 'Created user!' });
}

export default handler;
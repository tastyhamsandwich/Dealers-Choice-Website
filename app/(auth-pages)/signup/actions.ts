'use server'

import { createClient } from '@supaS'
import { redirect } from 'next/navigation'
//import { validatePassword } from '@lib/auth/validate';
import { testIsEmail } from '@lib/utils';
export async function signUpAction(formData: FormData) {


    const email = formData.get('email') as string;
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    const dob = formData.get('dob') as string;

    if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
    }

    if (!testIsEmail(email)) {
        throw new Error('Invalid email');
    }

    if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
    }

    if (username.length < 3) {
        throw new Error('Username must be at least 3 characters long');
    }

    const supabase = await createClient()
    
    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                username: username,
                dob: dob
            },
        },
    })

    if (error) {
        console.error('Authentication error:', error)
        throw error
    }

    // Log the session to verify it's being created
    console.log('Session created:', data.session)

    redirect('/')
}
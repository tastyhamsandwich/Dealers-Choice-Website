'use server'

import { createClient } from '@supaS'
import { redirect } from 'next/navigation'

export async function signInAction(formData: FormData) {
    const supabase = await createClient()
    
    const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    })

    if (error) {
        console.error('Authentication error:', error)
        throw error
    }

    // Log the session to verify it's being created
    console.log('Session created:', data.session)

    redirect('/')
}
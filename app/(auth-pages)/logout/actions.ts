import { createClient } from '@supaC';
import { redirect } from 'next/navigation';

async function signOut() {
    const supabase = createClient();
    
    try {
        const { error } = await supabase.auth.signOut();
        
        if (error) throw error;
        
        // No need to manually clear cookies as Supabase handles this
        // The auth.signOut() method already clears the auth cookies
        
        redirect("/");
    } catch (err) {
        console.error('Failed to sign out:', err);
        return { success: false, error: 'Failed to sign out' };
    }
}

export { signOut };
import React, { useEffect } from 'react';
import Link from 'next/link';
import { useState } from 'react';
import "@styles/navstyles.css";
import NavRight from '@comps/NavRight';
import NavLinks from '@comps/NavLinks';
import { createClient } from '@supaC';

async function NavBar() {

    const supabase = createClient();
    
    supabase.auth.onAuthStateChange((event, session) => {
        if (event == 'SIGNED_IN') console.log('SIGNED_IN', session)
      })

    return (
        <div className="container-container">
            <NavLinks />
            <NavRight />
        </div>
    );
};

export default NavBar;
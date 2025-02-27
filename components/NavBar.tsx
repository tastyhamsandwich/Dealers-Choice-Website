"use client"

import React from 'react';
import NavRight from '@comps/NavRight';
import NavLinks from '@comps/NavLinks';

export default function NavBar() {
    return (
        <div className="container-container">
            <NavLinks />
            <NavRight />
        </div>
    );
}
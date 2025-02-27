import React from 'react';
import Link from 'next/link';
import "@/styles/navstyles.css";

function NavLinks({loggedIn=false}){

    const links = [
        {name: 'Home', path: '/', protected: false},
        {name: 'About', path: '/about', protected: false},
        {name: 'Login', path: '/login', protected: false},
        {name: 'Register', path: '/signup', protected: false},
        {name: 'Poker', path: '/poker', protected: true},
        {name: 'Logout', path: '/logout', protected: true},
        {name: 'Payment', path: '/payment', protected: false}
        ].map((item) => {
            if (item.path === '/' || loggedIn === item.protected) {
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
    )
}

export default NavLinks;
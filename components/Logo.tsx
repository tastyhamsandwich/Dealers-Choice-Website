import React from 'react';

export default function Logo(height?: number, width?: number) {
    if (typeof height === 'undefined')
        return <img src="/public/assets/logo_wide.png"/>
    else if (typeof width === 'undefined')
        return <img src="/public/assets/logo_wide.png" alt="Dealer's Choice Poker Logo" height={height}/>
    else
        return <img src="/public/assets/logo_wide.png" alt="Dealer's Choice Poker Logo" height={height} width={width}/>
}
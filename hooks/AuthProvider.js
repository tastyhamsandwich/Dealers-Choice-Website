'use client'

import { useContext, createContext, useState } from 'react';
import { useRouter } from 'next/router';

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const localData = localStorage.getItem('userData');
        return localData ? JSON.parse(localData) : [];
    });
    const [token, setToken] = useState(localStorage.getItem("site") ?? "");

    const router = useRouter();
    const loginAction = async (data) => {
        try {
            const response = await fetch("your-api-endpoint/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (result.data) {
                setUser(result.data.user);
                setToken(result.token);
                localStorage.setItem("site", result.token);
                await router.push('/dashboard');
                return;
            }
            throw new Error(result.message);
        } catch (err) {
            console.error(err);
        }   
    }

    const logOut = async () => {
        setUser(null);
        setToken("");
        localStorage.removeItem("site");
        await router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ token, user, loginAction, logOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;

export const useAuth = () => {
    return useContext(AuthContext);
};
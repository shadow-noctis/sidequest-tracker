import React, { createContext, useContext, useState, useEffect } from 'react'
import {jwtDecode } from 'jwt-decode'

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token =localStorage.getItem('token')
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUser(decoded);
            } catch {
                setUser(null);
            }
        }
    }, []);

    const login = (token) => {
        localStorage.setItem('token', token);
        try {
            const decoded =jwtDecode(token)
            setUser(decoded);
        } catch {
            setUser(null)
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
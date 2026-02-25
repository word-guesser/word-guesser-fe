import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../lib/api';
import { disconnectSocket } from '../lib/socket';
import type { User } from '../types';

interface AuthContextValue {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (token: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('wg_token'));
    const [loading, setLoading] = useState(true);

    const fetchMe = useCallback(async () => {
        try {
            const data = await api.auth.me();
            setUser(data);
        } catch {
            setUser(null);
            setToken(null);
            localStorage.removeItem('wg_token');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (token) {
            fetchMe();
        } else {
            setLoading(false);
        }
    }, [token, fetchMe]);

    const login = useCallback(async (newToken: string) => {
        localStorage.setItem('wg_token', newToken);
        setToken(newToken);
        setLoading(true);
        try {
            const data = await api.auth.me();
            setUser(data);
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('wg_token');
        setToken(null);
        setUser(null);
        disconnectSocket();
    }, []);

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}

'use client';

import {
    createContext,
    Dispatch,
    SetStateAction,
    useState,
    useEffect,
    ReactNode
} from 'react';
import { getAccessToken } from '@/lib/axios';

export interface User {
    id: string;
    email: string;
    password?: string;
    role: string;
    emailVerified: boolean;
    kycStatus?: string;
    lastLoginAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

interface AuthContextType {
    user: User | null;
    setUser: Dispatch<SetStateAction<User | null>>;
    loading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Here we would typically fetch the user profile if we have a token
        // For now, we'll just check if a token exists in memory (or cookies if we had logic for that)
        // Since axios interceptor handles refresh, we might want a /me endpoint call here.

        // Simulating a check or just initializing
        // In a real app, you'd call api.get('/auth/me') here

        const token = getAccessToken();
        if (!token) {
            // If no token in memory, we might still have a refresh token cookie.
            // The axios interceptor handles that on failed requests, 
            // but for initial load, we might want to try a silent refresh or a /me call.
            // For this MVP step, we will assume loading finishes quickly.
        }

        setLoading(false);
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

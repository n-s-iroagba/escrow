'use client';
import {
    createContext,
    Dispatch,
    SetStateAction,
} from 'react';


export interface User {
    id: string;
    email: string;
    password: string;
    role: string;
    emailVerified: boolean;
    kycStatus?: string;
    lastLoginAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export const AuthContext = createContext<{
    user: User | null;
    setUser: Dispatch<SetStateAction<User | null>>;
    loading: boolean
} | null>(null);



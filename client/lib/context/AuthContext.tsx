'use client';

import {
    createContext,
    Dispatch,
    SetStateAction,
    useState,
    useEffect,

} from 'react';
import { usePathname } from 'next/navigation';

import API_ROUTES from '@/constants/api-routes';
import { useGet } from '@/hooks/useApiQuery';

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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const pathname = usePathname();

    // Skip auth check on public pages (home and auth routes)
    const isPublicPage = pathname === '/' || pathname?.startsWith('/auth');
    const shouldCheckAuth = !isPublicPage;

    const { data: fetchedUser, loading } = useGet<User>(
        API_ROUTES.AUTH.ME, {
        enabled: shouldCheckAuth,
    }
    );

    useEffect(() => {
        if (fetchedUser) {
            setUser(fetchedUser);
        }
    }, [fetchedUser]);

    return (
        <AuthContext.Provider value={{ user, setUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
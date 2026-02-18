
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { apiClient } from '../services/apiClient';

interface AuthContextType {
    user: User | null;
    login: (credentials: any) => Promise<User>;
    logout: () => Promise<void>;
    updateUser: (data: Partial<User>) => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                console.error("Failed to parse user from local storage", e);
                localStorage.removeItem('user');
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (credentials: any) => {
        const response = await apiClient.auth.login(credentials);
        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
        return response.user;
    };

    const logout = async () => {
        await apiClient.auth.logout();
        setUser(null);
        localStorage.removeItem('user');
    };

    const updateUser = async (data: Partial<User>) => {
        if (!user) return;
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        await apiClient.users.update(user.id, data);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

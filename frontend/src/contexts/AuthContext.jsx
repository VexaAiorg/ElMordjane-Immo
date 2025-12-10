import React, { createContext, useContext, useState, useEffect } from 'react';
import { verifyToken } from '../api/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch user data on mount
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('authToken');
                if (token) {
                    const response = await verifyToken();
                    if (response.status === 'success' && response.data?.user) {
                        setUser(response.data.user);
                    }
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                // Token might be invalid, clear it
                localStorage.removeItem('authToken');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, []);

    // Helper functions
    const isAdmin = () => user?.role === 'ADMIN';
    const isCollaborateur = () => user?.role === 'COLLABORATEUR';

    const updateUser = (userData) => {
        setUser(userData);
    };

    const clearUser = () => {
        setUser(null);
        localStorage.removeItem('authToken');
    };

    const value = {
        user,
        isLoading,
        isAdmin,
        isCollaborateur,
        updateUser,
        clearUser
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

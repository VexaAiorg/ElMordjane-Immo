import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { User } from 'lucide-react';
import Sidebar from './Sidebar';
import { getUserProfile, apiConfig } from '../api/api';
import '../styles/Dashboard.css';

const DashboardLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await getUserProfile();
                if (response.data) {
                    setUser(response.data);
                }
            } catch (error) {
                console.error('Error fetching user profile:', error);
            }
        };
        fetchUser();
    }, [location.pathname]);

    const getPhotoUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        // Ensure path starts with / if it doesn't already
        const normalizedPath = path.startsWith('/') ? path : `/${path}`;
        return `${apiConfig.baseUrl}${normalizedPath}`;
    };

    return (
        <div className="dashboard-layout">
            <Sidebar
                isCollapsed={isCollapsed}
                toggleSidebar={toggleSidebar}
                isMobileMenuOpen={isMobileMenuOpen}
                toggleMobileMenu={toggleMobileMenu}
            />

            {/* Mobile Menu Backdrop */}
            {isMobileMenuOpen && (
                <div
                    className="mobile-backdrop"
                    onClick={toggleMobileMenu}
                    aria-label="Close menu"
                />
            )}

            {/* Hamburger Menu Button (Mobile Only) */}
            <button
                className="hamburger-btn"
                onClick={toggleMobileMenu}
                aria-label="Toggle menu"
            >
                <span></span>
                <span></span>
                <span></span>
            </button>

            <main className={`main-content ${isCollapsed ? 'collapsed' : ''}`}>
                {/* User Profile Widget */}
                <div
                    onClick={() => navigate('/dashboard/profile')}
                    className="user-widget"
                >
                    <div className="user-widget-text">
                        <div className="user-widget-name">
                            {user ? `${user.prenom} ${user.nom}` : 'Chargement...'}
                        </div>
                    </div>
                    <div className="user-widget-avatar">
                        {user && user.photoProfil ? (
                            <img
                                src={getPhotoUrl(user.photoProfil)}
                                alt="Profile"
                                className="user-widget-avatar-img"
                            />
                        ) : (
                            <User size={20} color="#94a3b8" />
                        )}
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <Outlet key={location.pathname} />
                </AnimatePresence>
            </main>
        </div>
    );
};

export default DashboardLayout;

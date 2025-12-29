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

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
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
        return path.startsWith('http') ? path : `${apiConfig.baseUrl}${path}`;
    };

    return (
        <div className="dashboard-layout">
            <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
            <main className={`main-content ${isCollapsed ? 'collapsed' : ''}`} style={{ position: 'relative' }}>
                {/* User Profile Widget */}
                <div
                    onClick={() => navigate('/dashboard/profile')}
                    className="user-widget"
                    style={{
                        position: 'absolute',
                        top: '1.5rem',
                        right: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        cursor: 'pointer',
                        zIndex: 50,
                        padding: '0.5rem 1rem',
                        borderRadius: '30px',
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--glass-border)',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.2s'
                    }}
                >
                    <div style={{ textAlign: 'right', marginRight: '0.25rem' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                            {user ? `${user.prenom} ${user.nom}` : 'Chargement...'}
                        </div>
                    </div>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        background: '#334155',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid rgba(255,255,255,0.1)'
                    }}>
                        {user && user.photoProfil ? (
                            <img
                                src={getPhotoUrl(user.photoProfil)}
                                alt="Profile"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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

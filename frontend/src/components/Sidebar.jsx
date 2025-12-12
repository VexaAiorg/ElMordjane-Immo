import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Building2,
    Key,
    Archive,
    PlusCircle,
    LogOut,
    Settings,
    Loader2,
    Users,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { logout } from '../api/api';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Dashboard.css';

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
    const navigate = useNavigate();
    const { isAdmin, clearUser } = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true);
            await logout();
            clearUser(); // Clear user from AuthContext
            
            // Add a small delay for animation effect
            setTimeout(() => {
                navigate('/auth', { replace: true });
            }, 200);
        } catch (error) {
            console.error('Logout error:', error);
            clearUser(); // Clear user even on error
            setTimeout(() => {
                navigate('/auth', { replace: true });
            }, 200);
        }
    };

    // Define all navigation items
    const allNavItems = [
        { path: '/dashboard/menu', icon: <LayoutDashboard size={20} />, label: 'Menu' },
        { path: '/dashboard/vente', icon: <Building2 size={20} />, label: 'Vente' },
        { path: '/dashboard/location', icon: <Key size={20} />, label: 'Location' },
        { path: '/dashboard/archives', icon: <Archive size={20} />, label: 'Archives', adminOnly: true },
        { path: '/dashboard/collaborateurs', icon: <Users size={20} />, label: 'Collaborateurs', adminOnly: true },
        { path: '/dashboard/wizard', icon: <PlusCircle size={20} />, label: 'Nouveau Bien' },
        { path: '/dashboard/profile', icon: <Settings size={20} />, label: 'Paramètres' },
    ];

    // Filter nav items based on role
    const navItems = allNavItems.filter(item => !item.adminOnly || isAdmin());

    return (
        <>
            {/* Loading Overlay */}
            {isLoggingOut && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.8)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10000,
                    animation: 'fadeIn 0.3s ease'
                }}>
                    <Loader2 
                        size={48} 
                        style={{ 
                            color: '#3b82f6',
                            animation: 'spin 1s linear infinite'
                        }} 
                    />
                    <p style={{ 
                        color: 'white', 
                        marginTop: '1rem',
                        fontSize: '1.1rem',
                        fontWeight: '500'
                    }}>
                        Déconnexion en cours...
                    </p>
                </div>
            )}

            <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
                <div className="sidebar-header">
                    <img
                        src="/assets/ElMordjanMainLogo.png"
                        alt="El Mordjane"
                        className="sidebar-logo"
                    />
                    {!isCollapsed && <span className="sidebar-brand">El Mordjane</span>}
                </div>

                <nav className="sidebar-nav">
                    {navItems.filter(item => {
                        // Hide Archives for collaborateurs
                        if (item.path === '/dashboard/archives' && !isAdmin()) {
                            return false;
                        }
                        return true;
                    }).map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `nav-item ${isActive ? 'active' : ''} ${isCollapsed ? 'collapsed' : ''}`
                            }
                            title={isCollapsed ? item.label : ''}
                        >
                            {item.icon}
                            {!isCollapsed && <span>{item.label}</span>}
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button
                        onClick={toggleSidebar}
                        className={`nav-item toggle-btn ${isCollapsed ? 'collapsed' : ''}`}
                        style={{ marginBottom: '0.5rem', justifyContent: isCollapsed ? 'center' : 'flex-start' }}
                    >
                        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                        {!isCollapsed && <span>Réduire</span>}
                    </button>
                    <button  
                        onClick={handleLogout} 
                        className={`nav-item logout-btn ${isCollapsed ? 'collapsed' : ''}`}
                        disabled={isLoggingOut}
                        style={{
                            opacity: isLoggingOut ? 0.6 : 1,
                            cursor: isLoggingOut ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s ease',
                            justifyContent: isCollapsed ? 'center' : 'flex-start'
                        }}
                        title={isCollapsed ? 'Déconnexion' : ''}
                    >
                        {isLoggingOut ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <LogOut size={20} />
                        )}
                        {!isCollapsed && <span>{isLoggingOut ? 'Déconnexion...' : 'Déconnexion'}</span>}
                    </button>
                </div>
            </aside>

            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes spin {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }

                .animate-spin {
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </>
    );
};

export default Sidebar;

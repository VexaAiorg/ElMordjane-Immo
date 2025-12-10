import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Building2,
    Key,
    Archive,
    PlusCircle,
    LogOut,
    Settings
} from 'lucide-react';
import { logout } from '../api/api';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Dashboard.css';

const Sidebar = () => {
    const navigate = useNavigate();
    const { isAdmin, clearUser } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
            clearUser(); // Clear user from AuthContext
            navigate('/auth', { replace: true });
        } catch (error) {
            console.error('Logout error:', error);
            clearUser(); // Clear user even on error
            navigate('/auth', { replace: true });
        }
    };

    // Define all navigation items
    const allNavItems = [
        { path: '/dashboard/menu', icon: <LayoutDashboard size={20} />, label: 'Menu' },
        { path: '/dashboard/vente', icon: <Building2 size={20} />, label: 'Vente' },
        { path: '/dashboard/location', icon: <Key size={20} />, label: 'Location' },
        { path: '/dashboard/archives', icon: <Archive size={20} />, label: 'Archives', adminOnly: true },
        { path: '/dashboard/wizard', icon: <PlusCircle size={20} />, label: 'Nouveau Bien' },
        { path: '/dashboard/profile', icon: <Settings size={20} />, label: 'Paramètres' },
    ];

    // Filter nav items based on role
    const navItems = allNavItems.filter(item => !item.adminOnly || isAdmin());

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <img
                    src="/assets/ElMordjanMainLogo.png"
                    alt="El Mordjane"
                    className="sidebar-logo"
                />
                <span className="sidebar-brand">El Mordjane</span>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `nav-item ${isActive ? 'active' : ''}`
                        }
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <button onClick={handleLogout} className="nav-item logout-btn">
                    <LogOut size={20} />
                    <span>Déconnexion</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;

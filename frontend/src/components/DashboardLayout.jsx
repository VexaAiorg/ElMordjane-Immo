import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import '../styles/Dashboard.css';

const DashboardLayout = () => {
    const location = useLocation();

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="main-content">
                <AnimatePresence mode="wait">
                    <Outlet key={location.pathname} />
                </AnimatePresence>
            </main>
        </div>
    );
};

export default DashboardLayout;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../utils/api';
import '../styles/Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/auth', { replace: true });
        } catch (error) {
            console.error('Logout error:', error);
            // Still navigate to auth even if API call fails
            navigate('/auth', { replace: true });
        }
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-content">
                    <img
                        src="/assets/ElMordjanMainLogo.png"
                        alt="El Mordjane Logo"
                        className="dashboard-logo"
                    />
                    <h1>El Mordjane Dashboard</h1>
                </div>
                <button onClick={handleLogout} className="logout-btn">
                    Déconnexion
                </button>
            </header>

            <main className="dashboard-main">
                <div className="welcome-section">
                    <h2>Bienvenue sur votre tableau de bord</h2>
                    <p>Gérez vos propriétés immobilières en toute simplicité</p>
                </div>

                <div className="dashboard-grid">
                    <div className="dashboard-card">
                        <div className="card-icon">🏠</div>
                        <h3>Propriétés</h3>
                        <p className="card-value">0</p>
                        <p className="card-label">Total des biens</p>
                    </div>

                    <div className="dashboard-card">
                        <div className="card-icon">👥</div>
                        <h3>Propriétaires</h3>
                        <p className="card-value">0</p>
                        <p className="card-label">Clients enregistrés</p>
                    </div>

                    <div className="dashboard-card">
                        <div className="card-icon">📄</div>
                        <h3>Documents</h3>
                        <p className="card-value">0</p>
                        <p className="card-label">Fichiers stockés</p>
                    </div>

                    <div className="dashboard-card">
                        <div className="card-icon">📅</div>
                        <h3>Visites</h3>
                        <p className="card-value">0</p>
                        <p className="card-label">Rendez-vous planifiés</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;

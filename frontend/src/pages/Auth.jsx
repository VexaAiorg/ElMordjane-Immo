import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, signup } from '../utils/api';
import '../styles/Auth.css';

const Auth = () => {
    const [activeTab, setActiveTab] = useState('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = activeTab === 'signin'
                ? await login({ email, password })
                : await signup({ email, password });

            if (response.status === 'success') {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.message || `${activeTab === 'signin' ? 'Login' : 'Signup'} failed. Please try again.`);
        } finally {
            setLoading(false);
        }
    };

    const switchTab = (tab) => {
        setActiveTab(tab);
        setError('');
        setEmail('');
        setPassword('');
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <img
                    src="/assets/ElMordjanMainLogo.png"
                    alt="El Mordjane Logo"
                    className="auth-logo"
                />

                <div className="auth-tabs">
                    <button
                        className={`auth-tab ${activeTab === 'signin' ? 'active' : ''}`}
                        onClick={() => switchTab('signin')}
                        type="button"
                    >
                        Se connecter
                    </button>
                    <button
                        className={`auth-tab ${activeTab === 'signup' ? 'active' : ''}`}
                        onClick={() => switchTab('signup')}
                        type="button"
                    >
                        S'inscrire
                    </button>
                    <div className={`tab-indicator ${activeTab}`}></div>
                </div>

                <h1 className="auth-heading">
                    {activeTab === 'signin' ? 'Bon retour' : 'Créer un compte'}
                </h1>
                <p className="auth-description">
                    {activeTab === 'signin'
                        ? 'Connectez-vous à votre compte El Mordjane'
                        : 'Inscrivez-vous pour votre compte El Mordjane'}
                </p>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="exemple@gmail.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Mot de passe</label>
                        <input
                            type="password"
                            id="password"
                            placeholder={activeTab === 'signin' ? 'Entrez votre mot de passe' : 'Utilisez un mot de passe fort'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && (
                        <div className="error-alert">
                            {error}
                        </div>
                    )}

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading
                            ? (activeTab === 'signin' ? 'Connexion...' : 'Inscription...')
                            : (activeTab === 'signin' ? 'Se connecter' : "S'inscrire")}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Auth;

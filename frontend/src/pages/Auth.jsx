import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { login, signup } from '../api/api';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Auth.css';

const Auth = () => {
    const [activeTab, setActiveTab] = useState('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [role, setRole] = useState('COLLABORATEUR');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { updateUser } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = activeTab === 'signin'
                ? await login({ email, password })
                : await signup({ email, password, nom, prenom, role });

            if (response.status === 'success') {
                // Update user in AuthContext
                if (response.data?.user) {
                    updateUser(response.data.user);
                }
                navigate('/dashboard', { replace: true });
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
        setNom('');
        setPrenom('');
        setRole('COLLABORATEUR');
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

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        <h1 className="auth-heading">
                            {activeTab === 'signin' ? 'Bon retour' : 'Créer un compte'}
                        </h1>
                        <p className="auth-description">
                            {activeTab === 'signin'
                                ? 'Connectez-vous à votre compte El Mordjane'
                                : 'Inscrivez-vous pour votre compte El Mordjane'}
                        </p>

                        <form onSubmit={handleSubmit} className="auth-form">
                            {activeTab === 'signup' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div className="form-group">
                                            <label htmlFor="nom">Nom</label>
                                            <input
                                                type="text"
                                                id="nom"
                                                placeholder="Votre nom"
                                                value={nom}
                                                onChange={(e) => setNom(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="prenom">Prénom</label>
                                            <input
                                                type="text"
                                                id="prenom"
                                                placeholder="Votre prénom"
                                                value={prenom}
                                                onChange={(e) => setPrenom(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="form-group">
                                        <label htmlFor="role">Rôle</label>
                                        <select
                                            id="role"
                                            value={role}
                                            onChange={(e) => setRole(e.target.value)}
                                        >
                                            <option value="COLLABORATEUR">Collaborateur</option>
                                            <option value="ADMIN">Administrateur</option>
                                        </select>
                                    </div>
                                </motion.div>
                            )}

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
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        placeholder={activeTab === 'signin' ? 'Entrez votre mot de passe' : 'Utilisez un mot de passe fort'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        style={{ paddingRight: '3rem' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: '0.75rem',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: '#94a3b8',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: '0.25rem',
                                            transition: 'color 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.color = '#3b82f6'}
                                        onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                                    >
                                        {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="error-alert"
                                >
                                    {error}
                                </motion.div>
                            )}

                            <button type="submit" className="submit-btn" disabled={loading}>
                                {loading
                                    ? (activeTab === 'signin' ? 'Connexion...' : 'Inscription...')
                                    : (activeTab === 'signin' ? 'Se connecter' : "S'inscrire")}
                            </button>
                        </form>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Auth;

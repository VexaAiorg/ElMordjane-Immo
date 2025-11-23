import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../utils/api';

const Signup = () => {
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
            const response = await signup({ email, password });

            if (response.status === 'success') {
                // Redirect to dashboard on successful signup
                navigate('/dashboard', { replace: true });
            }
        } catch (err) {
            setError(err.message || 'Signup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div className="auth-box">
                <img
                    src="/assets/ElMordjanMainLogo.png"
                    alt="El Mordjane Logo"
                    className="logo"
                />
                <h1 className="auth-title">Create Account</h1>
                <p className="auth-subtitle">Sign up for your El Mordjane account</p>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="Create a password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && (
                        <div className="error-message" style={{ color: '#ff4444', marginBottom: '1rem', fontSize: '0.9rem' }}>
                            {error}
                        </div>
                    )}
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Signing up...' : 'Sign Up'}
                    </button>
                </form>
                <div className="auth-link">
                    Did you have account?
                    <Link to="/login">Login</Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;

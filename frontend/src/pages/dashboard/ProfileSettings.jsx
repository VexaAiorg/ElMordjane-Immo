import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Camera, Save, X, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import PageTransition from '../../components/PageTransition';
import { getUserProfile, updateUserProfile, updateUserPassword, apiConfig } from '../../api/api';

const ProfileSettings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    
    // Profile Data
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        email: '',
    });
    const [photoPreview, setPhotoPreview] = useState(null);
    const [photoFile, setPhotoFile] = useState(null);

    // Password Data
    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Password Visibility State
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await getUserProfile();
            if (response.data) {
                const { nom, prenom, email, photoProfil } = response.data;
                setFormData({
                    nom: nom || '',
                    prenom: prenom || '',
                    email: email || '',
                });
                if (photoProfil) {
                    // Check if it's a full URL or relative path
                    const url = photoProfil.startsWith('http') 
                        ? photoProfil 
                        : `${apiConfig.baseUrl}${photoProfil}`;
                    setPhotoPreview(url);
                }
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
            setError('Impossible de charger le profil');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhotoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            // 1. Update Profile Info & Photo
            await updateUserProfile(formData, photoFile);

            // 2. Update Password if requested
            if (showPasswordChange) {
                if (passwordData.newPassword !== passwordData.confirmPassword) {
                    throw new Error("Les nouveaux mots de passe ne correspondent pas");
                }
                if (passwordData.newPassword.length < 6) {
                    throw new Error("Le mot de passe doit contenir au moins 6 caractères");
                }
                await updateUserPassword(passwordData.oldPassword, passwordData.newPassword);
                
                // Reset password fields
                setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                setShowPasswordChange(false);
            }

            setSuccess('Profil mis à jour avec succès !');
            
            // Refresh profile to ensure sync
            fetchProfile();

        } catch (err) {
            console.error('Error updating profile:', err);
            setError(err.message || 'Erreur lors de la mise à jour');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        fetchProfile(); // Reset to server state
        setPhotoFile(null);
        setShowPasswordChange(false);
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setError(null);
        setSuccess(null);
    };

    if (loading) {
        return (
            <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Loader2 className="animate-spin" size={48} color="#3b82f6" />
            </div>
        );
    }

    return (
        <PageTransition>
            <div className="page-container">
                <header className="page-header">
                    <div>
                        <h1 className="page-title">Paramètres du Profil</h1>
                        <p className="page-subtitle">Gérez vos informations personnelles et votre sécurité</p>
                    </div>
                </header>

                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    {error && (
                        <div style={{ 
                            padding: '1rem', 
                            background: 'rgba(239, 68, 68, 0.1)', 
                            border: '1px solid rgba(239, 68, 68, 0.3)', 
                            borderRadius: '8px', 
                            color: '#ef4444',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <AlertCircle size={20} />
                            {error}
                        </div>
                    )}

                    {success && (
                        <div style={{ 
                            padding: '1rem', 
                            background: 'rgba(34, 197, 94, 0.1)', 
                            border: '1px solid rgba(34, 197, 94, 0.3)', 
                            borderRadius: '8px', 
                            color: '#22c55e',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <CheckCircle2 size={20} />
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2rem' }}>
                        
                        {/* Profile Picture Section */}
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                            <div style={{ position: 'relative' }}>
                                <div style={{ 
                                    width: '120px', 
                                    height: '120px', 
                                    borderRadius: '50%', 
                                    overflow: 'hidden', 
                                    border: '4px solid rgba(255,255,255,0.1)',
                                    background: '#1e293b',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {photoPreview ? (
                                        <img src={photoPreview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <User size={48} color="#64748b" />
                                    )}
                                </div>
                                <label 
                                    htmlFor="pfp-upload"
                                    style={{
                                        position: 'absolute',
                                        bottom: '0',
                                        right: '0',
                                        background: '#3b82f6',
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }}
                                >
                                    <Camera size={18} color="white" />
                                </label>
                                <input 
                                    type="file" 
                                    id="pfp-upload" 
                                    accept="image/*" 
                                    onChange={handleFileChange} 
                                    style={{ display: 'none' }} 
                                />
                            </div>
                        </div>

                        {/* Personal Info */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div className="form-group">
                                <label className="form-label">Nom</label>
                                <div className="input-wrapper">
                                    <User size={18} className="input-icon" />
                                    <input 
                                        type="text" 
                                        name="nom"
                                        value={formData.nom}
                                        onChange={handleInputChange}
                                        className="form-input" 
                                        placeholder="Votre nom"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Prénom</label>
                                <div className="input-wrapper">
                                    <User size={18} className="input-icon" />
                                    <input 
                                        type="text" 
                                        name="prenom"
                                        value={formData.prenom}
                                        onChange={handleInputChange}
                                        className="form-input" 
                                        placeholder="Votre prénom"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: '2rem' }}>
                            <label className="form-label">Email</label>
                            <div className="input-wrapper">
                                <Mail size={18} className="input-icon" />
                                <input 
                                    type="email" 
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="form-input" 
                                    placeholder="votre@email.com"
                                />
                            </div>
                        </div>

                        {/* Password Section */}
                        <div style={{ 
                            borderTop: '1px solid rgba(255,255,255,0.1)', 
                            paddingTop: '2rem', 
                            marginBottom: '2rem' 
                        }}>
                            <button 
                                type="button"
                                onClick={() => setShowPasswordChange(!showPasswordChange)}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: '#e2e8f0',
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontSize: '0.9rem',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <Lock size={16} />
                                {showPasswordChange ? 'Annuler le changement de mot de passe' : 'Changer le mot de passe'}
                            </button>

                            {showPasswordChange && (
                                <div className="animate-fade-in" style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label className="form-label">Ancien mot de passe</label>
                                        <div className="input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                            <Lock size={18} className="input-icon" style={{ position: 'absolute', left: '1rem', color: '#94a3b8', pointerEvents: 'none' }} />
                                            <input 
                                                type={showOldPassword ? "text" : "password"}
                                                name="oldPassword"
                                                value={passwordData.oldPassword}
                                                onChange={handlePasswordChange}
                                                className="form-input" 
                                                placeholder="••••••••"
                                                style={{ 
                                                    width: '100%',
                                                    paddingLeft: '3rem', 
                                                    paddingRight: '3rem',
                                                    height: '48px'
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowOldPassword(!showOldPassword)}
                                                style={{
                                                    position: 'absolute',
                                                    right: '0',
                                                    top: '0',
                                                    height: '100%',
                                                    width: '48px',
                                                    background: 'none',
                                                    border: 'none',
                                                    color: '#94a3b8',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    padding: 0,
                                                    zIndex: 10
                                                }}
                                            >
                                                {showOldPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                        <div className="form-group">
                                            <label className="form-label">Nouveau mot de passe</label>
                                            <div className="input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                                <Lock size={18} className="input-icon" style={{ position: 'absolute', left: '1rem', color: '#94a3b8', pointerEvents: 'none' }} />
                                                <input 
                                                    type={showNewPassword ? "text" : "password"}
                                                    name="newPassword"
                                                    value={passwordData.newPassword}
                                                    onChange={handlePasswordChange}
                                                    className="form-input" 
                                                    placeholder="••••••••"
                                                    style={{ 
                                                        width: '100%',
                                                        paddingLeft: '3rem', 
                                                        paddingRight: '3rem',
                                                        height: '48px'
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    style={{
                                                        position: 'absolute',
                                                        right: '0',
                                                        top: '0',
                                                        height: '100%',
                                                        width: '48px',
                                                        background: 'none',
                                                        border: 'none',
                                                        color: '#94a3b8',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        padding: 0,
                                                        zIndex: 10
                                                    }}
                                                >
                                                    {showNewPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Confirmer le mot de passe</label>
                                            <div className="input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                                <Lock size={18} className="input-icon" style={{ position: 'absolute', left: '1rem', color: '#94a3b8', pointerEvents: 'none' }} />
                                                <input 
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    name="confirmPassword"
                                                    value={passwordData.confirmPassword}
                                                    onChange={handlePasswordChange}
                                                    className="form-input" 
                                                    placeholder="••••••••"
                                                    style={{ 
                                                        width: '100%',
                                                        paddingLeft: '3rem', 
                                                        paddingRight: '3rem',
                                                        height: '48px'
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    style={{
                                                        position: 'absolute',
                                                        right: '0',
                                                        top: '0',
                                                        height: '100%',
                                                        width: '48px',
                                                        background: 'none',
                                                        border: 'none',
                                                        color: '#94a3b8',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        padding: 0,
                                                        zIndex: 10
                                                    }}
                                                >
                                                    {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                            <button 
                                type="button" 
                                onClick={handleCancel}
                                className="btn-secondary"
                                disabled={saving}
                            >
                                <X size={18} /> Annuler
                            </button>
                            <button 
                                type="submit" 
                                className="btn-primary"
                                disabled={saving}
                            >
                                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                {saving ? 'Enregistrement...' : 'Confirmer'}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </PageTransition>
    );
};

export default ProfileSettings;
import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Eye, Building2, Calendar, Mail, X, Loader2, AlertCircle, CheckCircle2, Search } from 'lucide-react';
import PageTransition from '../../components/PageTransition';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { 
    getAllCollaborateurs, 
    createCollaborateur, 
    deleteCollaborateur,
    getCollaborateurProperties
} from '../../api/api';
import '../../styles/Dashboard.css';

const GestionCollaborateurs = () => {
    const [collaborateurs, setCollaborateurs] = useState([]);
    const [filteredCollaborateurs, setFilteredCollaborateurs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedCollab, setSelectedCollab] = useState(null);
    const [selectedCollabProperties, setSelectedCollabProperties] = useState([]);
    const [propertiesLoading, setPropertiesLoading] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    // Create collaborateur form state
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        nom: '',
        prenom: ''
    });
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState(null);
    const [createSuccess, setCreateSuccess] = useState(false);

    useEffect(() => {
        fetchCollaborateurs();
    }, []);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredCollaborateurs(collaborateurs);
        } else {
            const lowerTerm = searchTerm.toLowerCase();
            const filtered = collaborateurs.filter(collab => 
                collab.nom.toLowerCase().includes(lowerTerm) || 
                collab.prenom.toLowerCase().includes(lowerTerm) ||
                collab.email.toLowerCase().includes(lowerTerm)
            );
            setFilteredCollaborateurs(filtered);
        }
    }, [searchTerm, collaborateurs]);

    const fetchCollaborateurs = async () => {
        try {
            setLoading(true);
            const response = await getAllCollaborateurs();
            setCollaborateurs(response.data);
            setFilteredCollaborateurs(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching collaborateurs:', err);
            setError('Impossible de charger les collaborateurs');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCollab = async (e) => {
        e.preventDefault();
        setCreateLoading(true);
        setCreateError(null);

        try {
            await createCollaborateur(formData);
            setCreateSuccess(true);
            setTimeout(() => {
                setShowCreateModal(false);
                setCreateSuccess(false);
                setFormData({ email: '', password: '', nom: '', prenom: '' });
                fetchCollaborateurs();
            }, 1500);
        } catch (err) {
            setCreateError(err.message || 'Erreur lors de la création');
        } finally {
            setCreateLoading(false);
        }
    };

    const handleDeleteCollab = async (collabId) => {
        if (!window.confirm('⚠️ Êtes-vous sûr de vouloir supprimer ce collaborateur ?\n\nCette action est IRRÉVERSIBLE !')) {
            return;
        }

        try {
            await deleteCollaborateur(collabId);
            fetchCollaborateurs();
        } catch (err) {
            console.error('Error deleting collaborateur:', err);
            alert('Erreur lors de la suppression');
        }
    };

    const handleViewDetails = async (collab) => {
        setSelectedCollab(collab);
        setShowDetailsModal(true);
        setPropertiesLoading(true);
        setSelectedCollabProperties([]);
        
        try {
            const response = await getCollaborateurProperties(collab.id);
            setSelectedCollabProperties(response.data);
        } catch (err) {
            console.error('Error fetching properties:', err);
        } finally {
            setPropertiesLoading(false);
        }
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
                        <h1 className="page-title">Gestion des Collaborateurs</h1>
                        <p className="page-subtitle">Gérez les comptes collaborateurs et suivez leurs performances</p>
                    </div>
                    <button 
                        onClick={() => setShowCreateModal(true)}
                        className="btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <Plus size={20} />
                        Nouveau Collaborateur
                    </button>
                </header>

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

                {/* Statistics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Collaborateurs</p>
                                <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>{collaborateurs.length}</h2>
                            </div>
                            <Users size={40} style={{ color: '#3b82f6', opacity: 0.5 }} />
                        </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Biens Créés (Total)</p>
                                <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>
                                    {collaborateurs.reduce((sum, c) => sum + (c._count?.biensCreated || 0), 0)}
                                </h2>
                            </div>
                            <Building2 size={40} style={{ color: '#22c55e', opacity: 0.5 }} />
                        </div>
                    </div>
                </div>

                {/* Search Filter */}
                <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                    <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                        type="text"
                        placeholder="Rechercher par nom, prénom ou email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '1rem 1rem 1rem 3rem',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            color: 'white',
                            fontSize: '1rem',
                            outline: 'none'
                        }}
                    />
                </div>

                {/* Collaborateurs List */}
                <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <th style={{ padding: '1rem', textAlign: 'left', color: '#94a3b8', fontWeight: '600', fontSize: '0.9rem' }}>
                                    Collaborateur
                                </th>
                                <th style={{ padding: '1rem', textAlign: 'left', color: '#94a3b8', fontWeight: '600', fontSize: '0.9rem' }}>
                                    Email
                                </th>
                                <th style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8', fontWeight: '600', fontSize: '0.9rem' }}>
                                    Biens Créés
                                </th>
                                <th style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8', fontWeight: '600', fontSize: '0.9rem' }}>
                                    Date d'ajout
                                </th>
                                <th style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8', fontWeight: '600', fontSize: '0.9rem' }}>
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCollaborateurs.map((collab) => (
                                <tr 
                                    key={collab.id}
                                    style={{ 
                                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '50%',
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '1.1rem',
                                                fontWeight: 'bold',
                                                color: 'white'
                                            }}>
                                                {collab.prenom?.[0]}{collab.nom?.[0]}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '500', color: 'white' }}>
                                                    {collab.prenom} {collab.nom}
                                                </div>
                                                <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                                                    ID: {collab.id}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', color: '#cbd5e1' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Mail size={16} style={{ color: '#94a3b8' }} />
                                            {collab.email}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <span style={{
                                            background: 'rgba(59, 130, 246, 0.1)',
                                            color: '#3b82f6',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '12px',
                                            fontSize: '0.9rem',
                                            fontWeight: '600'
                                        }}>
                                            {collab._count?.biensCreated || 0}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                            <Calendar size={16} />
                                            {new Date(collab.dateCreation).toLocaleDateString('fr-FR')}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => handleViewDetails(collab)}
                                                style={{
                                                    background: 'rgba(59, 130, 246, 0.1)',
                                                    border: '1px solid rgba(59, 130, 246, 0.3)',
                                                    borderRadius: '6px',
                                                    padding: '0.4rem',
                                                    cursor: 'pointer',
                                                    color: '#3b82f6'
                                                }}
                                                title="Voir détails"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCollab(collab.id)}
                                                style={{
                                                    background: 'rgba(239, 68, 68, 0.1)',
                                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                                    borderRadius: '6px',
                                                    padding: '0.4rem',
                                                    cursor: 'pointer',
                                                    color: '#ef4444'
                                                }}
                                                title="Supprimer"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredCollaborateurs.length === 0 && (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                            <Users size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                            <p>{searchTerm ? 'Aucun collaborateur trouvé pour cette recherche' : 'Aucun collaborateur trouvé'}</p>
                        </div>
                    )}
                </div>

                {/* Create Collaborateur Modal */}
                <AnimatePresence>
                    {showCreateModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(0, 0, 0, 0.7)',
                                backdropFilter: 'blur(4px)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 1000,
                                padding: '1rem'
                            }}
                            onClick={() => !createLoading && setShowCreateModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                className="glass-panel"
                                style={{ 
                                    maxWidth: '500px', 
                                    width: '100%',
                                    padding: '2rem',
                                    position: 'relative'
                                }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    onClick={() => !createLoading && setShowCreateModal(false)}
                                    style={{
                                        position: 'absolute',
                                        top: '1rem',
                                        right: '1rem',
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#94a3b8',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <X size={24} />
                                </button>

                                <h2 style={{ marginBottom: '1.5rem', color: 'white' }}>Nouveau Collaborateur</h2>

                                {createSuccess ? (
                                    <div style={{
                                        padding: '3rem',
                                        textAlign: 'center'
                                    }}>
                                        <CheckCircle2 size={64} style={{ color: '#22c55e', marginBottom: '1rem' }} />
                                        <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>Collaborateur créé !</h3>
                                        <p style={{ color: '#94a3b8' }}>Le compte a été créé avec succès</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleCreateCollab}>
                                        {createError && (
                                            <div style={{
                                                padding: '1rem',
                                                background: 'rgba(239, 68, 68, 0.1)',
                                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                                borderRadius: '8px',
                                                color: '#ef4444',
                                                marginBottom: '1rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}>
                                                <AlertCircle size={20} />
                                                {createError}
                                            </div>
                                        )}

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                            <div className="form-group">
                                                <label>Nom *</label>
                                                <input
                                                    type="text"
                                                    value={formData.nom}
                                                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                                                    required
                                                    disabled={createLoading}
                                                    placeholder="Benali"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Prénom *</label>
                                                <input
                                                    type="text"
                                                    value={formData.prenom}
                                                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                                                    required
                                                    disabled={createLoading}
                                                    placeholder="Ahmed"
                                                />
                                            </div>
                                        </div>

                                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                                            <label>Email *</label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                required
                                                disabled={createLoading}
                                                placeholder="ahmed@elmordjane.com"
                                            />
                                        </div>

                                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                            <label>Mot de passe *</label>
                                            <input
                                                type="password"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                required
                                                disabled={createLoading}
                                                placeholder="Minimum 6 caractères"
                                                minLength={6}
                                            />
                                        </div>

                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <button
                                                type="button"
                                                onClick={() => setShowCreateModal(false)}
                                                className="btn-danger"
                                                disabled={createLoading}
                                                style={{ flex: 1 }}
                                            >
                                                Annuler
                                            </button>
                                            <button
                                                type="submit"
                                                className="btn-primary"
                                                disabled={createLoading}
                                                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                            >
                                                {createLoading ? (
                                                    <>
                                                        <Loader2 size={18} className="animate-spin" />
                                                        Création...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Plus size={18} />
                                                        Créer
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Details Modal */}
                <AnimatePresence>
                    {showDetailsModal && selectedCollab && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(0, 0, 0, 0.7)',
                                backdropFilter: 'blur(4px)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 1000,
                                padding: '1rem'
                            }}
                            onClick={() => setShowDetailsModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                className="glass-panel"
                                style={{ 
                                    maxWidth: '800px', 
                                    width: '100%',
                                    maxHeight: '80vh',
                                    overflow: 'auto',
                                    padding: '2rem',
                                    position: 'relative'
                                }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    onClick={() => setShowDetailsModal(false)}
                                    style={{
                                        position: 'absolute',
                                        top: '1rem',
                                        right: '1rem',
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#94a3b8',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <X size={24} />
                                </button>

                                <h2 style={{ marginBottom: '1.5rem', color: 'white' }}>
                                    Détails - {selectedCollab.prenom} {selectedCollab.nom}
                                </h2>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                                    <div>
                                        <p style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>Email</p>
                                        <p style={{ color: 'white' }}>{selectedCollab.email}</p>
                                    </div>
                                    <div>
                                        <p style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>Date de création</p>
                                        <p style={{ color: 'white' }}>
                                            {new Date(selectedCollab.dateCreation).toLocaleDateString('fr-FR', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    <div>
                                        <p style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>Biens créés</p>
                                        <p style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>
                                            {selectedCollab._count?.biensCreated || 0}
                                        </p>
                                    </div>
                                </div>

                                <h3 style={{ color: 'white', marginBottom: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                                    Biens créés par ce collaborateur
                                </h3>

                                {propertiesLoading ? (
                                    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                                        <Loader2 className="animate-spin" size={32} color="#3b82f6" />
                                    </div>
                                ) : selectedCollabProperties.length > 0 ? (
                                    <div style={{ display: 'grid', gap: '1rem' }}>
                                        {selectedCollabProperties.map(property => (
                                            <div key={property.id} style={{
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                borderRadius: '8px',
                                                padding: '1rem',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}>
                                                <div>
                                                    <h4 style={{ color: 'white', marginBottom: '0.25rem' }}>{property.titre}</h4>
                                                    <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                                                        {property.type} • {property.transaction} • {property.statut}
                                                    </p>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                                                        {new Date(property.dateCreation).toLocaleDateString('fr-FR')}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px' }}>
                                        <Building2 size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                                        <p>Aucun bien créé par ce collaborateur</p>
                                    </div>
                                )}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <style>{`
                    .animate-spin {
                        animation: spin 1s linear infinite;
                    }

                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        </PageTransition>
    );
};

export default GestionCollaborateurs;

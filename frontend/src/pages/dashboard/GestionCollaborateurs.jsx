import React, { useState, useEffect } from 'react';
import { 
    Users, Plus, Trash2, Eye, Building2, Calendar, Mail, X, Loader2, 
    AlertCircle, CheckCircle2, Search, ChevronDown, 
    MapPin, Package, Edit, LayoutGrid, List, EyeOff
} from 'lucide-react';
import PageTransition from '../../components/PageTransition';
import { AnimatePresence, motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { 
    getAllCollaborateurs, 
    createCollaborateur, 
    deleteCollaborateur,
    getAllProperties,
    getPropertyById,
    deleteProperty,
    getCollaborateur,
    updateCollaborateur,
    apiConfig
} from '../../api/api';
import PropertyDetailsModal from '../../components/property/PropertyDetailsModal';
import PropertyEditModal from '../../components/property/PropertyEditModal';
import '../../styles/Dashboard.css';

import { searchProperty } from '../../utils/searchUtils';

const GestionCollaborateurs = () => {
    // Global State
    const [activeTab, setActiveTab] = useState('biens'); // 'biens' | 'comptes'
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Data State
    const [collaborateurs, setCollaborateurs] = useState([]);
    const [properties, setProperties] = useState([]);

    // Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCollabFilter, setSelectedCollabFilter] = useState('ALL');
    const [showCollabDropdown, setShowCollabDropdown] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); // 'list' | 'grid'

    // Modal State
    const [showCreateModal, setShowCreateModal] = useState(false);
    
    // Property Modal State
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [editingProperty, setEditingProperty] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    // Create Form State
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        nom: '',
        prenom: ''
    });
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState(null);
    const [createSuccess, setCreateSuccess] = useState(false);

    // Collab View/Edit State
    const [viewCollab, setViewCollab] = useState(null);
    const [editCollab, setEditCollab] = useState(null);
    const [editFormData, setEditFormData] = useState({ nom: '', prenom: '', email: '' });
    const [updateLoading, setUpdateLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [collabRes, propRes] = await Promise.all([
                getAllCollaborateurs(),
                getAllProperties()
            ]);
            setCollaborateurs(collabRes.data || []);
            setProperties(propRes.data || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Impossible de charger les données');
        } finally {
            setLoading(false);
        }
    };

    // --- Filtering Logic ---

    const filteredProperties = properties.filter(property => {
        if (activeTab !== 'biens') return false;

        const matchesSearch = searchProperty(property, searchTerm);

        // Create a Set of collaborator IDs for efficient lookup
        const collabIds = new Set(collaborateurs.map(c => c.id));

        let matchesCollab = false;
        if (selectedCollabFilter === 'ALL') {
             // Only show properties created by one of the collaborators (exclude admins)
             matchesCollab = collabIds.has(property.createdById);
        } else {
             matchesCollab = property.createdById === selectedCollabFilter;
        }

        return matchesSearch && matchesCollab;
    });

    const filteredCollaborateurs = collaborateurs.filter(collab => {
        if (activeTab !== 'comptes') return false;
        
        const lowerTerm = searchTerm.toLowerCase();
        return collab.nom.toLowerCase().includes(lowerTerm) || 
               collab.prenom.toLowerCase().includes(lowerTerm) ||
               collab.email.toLowerCase().includes(lowerTerm);
    });

    // --- Handlers ---

    const handleCreateCollab = async (e) => {
        e.preventDefault();
        setCreateLoading(true);
        setCreateError(null);

        // Basic Validation
        if (!formData.nom || !formData.prenom || !formData.email || !formData.password) {
            setCreateError('Veuillez remplir tous les champs obligatoires');
            setCreateLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setCreateError('Le mot de passe doit contenir au moins 6 caractères');
            setCreateLoading(false);
            return;
        }

        try {
            await createCollaborateur(formData);
            setCreateSuccess(true);
            setTimeout(() => {
                setShowCreateModal(false);
                setCreateSuccess(false);
                setFormData({ email: '', password: '', nom: '', prenom: '' });
                fetchData(); // Refresh list
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
            fetchData();
        } catch (err) {
            console.error('Error deleting collaborateur:', err);
            alert('Erreur lors de la suppression');
        }
    };



    const handleViewCollab = async (collab) => {
        try {
            const res = await getCollaborateur(collab.id);
            setViewCollab(res.data);
        } catch (err) {
            console.error(err);
            alert('Erreur lors du chargement des détails');
        }
    };

    const handleEditCollabClick = async (collab) => {
        try {
            const res = await getCollaborateur(collab.id);
            setEditCollab(res.data);
            setEditFormData({
                nom: res.data.nom,
                prenom: res.data.prenom,
                email: res.data.email
            });
        } catch (err) {
            console.error(err);
            alert('Erreur lors du chargement des données');
        }
    };

    const handleUpdateCollab = async (e) => {
        e.preventDefault();
        setUpdateLoading(true);
        try {
            await updateCollaborateur(editCollab.id, editFormData);
            setEditCollab(null);
            fetchData();
            alert('Collaborateur mis à jour avec succès');
        } catch (err) {
            console.error(err);
            alert('Erreur lors de la mise à jour');
        } finally {
            setUpdateLoading(false);
        }
    };

    const handleDeleteProperty = async (propertyId) => {
        if (!window.confirm('🗑️ Êtes-vous sûr de vouloir supprimer ce bien ?')) {
            return;
        }
        try {
            await deleteProperty(propertyId);
            fetchData();
        } catch (err) {
            console.error('Error deleting property:', err);
            alert('Erreur lors de la suppression');
        }
    };

    // --- Property Helpers (copied from AllProperties) ---

    const formatPrice = (price) => {
        if (!price) return '-';
        return new Intl.NumberFormat('fr-DZ', {
            style: 'decimal',
            minimumFractionDigits: 0,
        }).format(price) + ' DA';
    };

    const getStatusBadgeClass = (statut) => {
        switch (statut) {
            case 'DISPONIBLE': return 'available';
            case 'EN_COURS': return 'pending';
            case 'VENDU': case 'LOUE': return 'sold';
            default: return '';
        }
    };

    const getStatusLabel = (statut) => {
        const labels = { 'DISPONIBLE': 'Disponible', 'EN_COURS': 'En cours', 'VENDU': 'Vendu', 'LOUE': 'Loué' };
        return labels[statut] || statut;
    };

    const getFileUrl = (url) => {
        if (!url) return '#';
        if (url.startsWith('http')) return url;
        const cleanUrl = url.startsWith('/') ? url : `/${url}`;
        return `${apiConfig.baseUrl}${cleanUrl}`;
    };

    const getFirstPhoto = (property) => {
        if (!property.piecesJointes) return null;
        const photo = property.piecesJointes.find(pj => pj.type === 'PHOTO' && pj.visibilite === 'PUBLIABLE');
        return photo ? getFileUrl(photo.url) : null;
    };

    const handleViewProperty = async (property) => {
        setSelectedProperty(property);
        setLoadingDetails(true);
        try {
            const response = await getPropertyById(property.id);
            if (response.data) setSelectedProperty(response.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleEditProperty = async (property) => {
        setEditingProperty(property);
        setLoadingDetails(true);
        try {
            const response = await getPropertyById(property.id);
            if (response.data) setEditingProperty(response.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingDetails(false);
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
                {selectedProperty && (
                    <PropertyDetailsModal 
                        property={selectedProperty} 
                        onClose={() => setSelectedProperty(null)}
                        isLoading={loadingDetails}
                    />
                )}
                {editingProperty && (
                    <PropertyEditModal 
                        property={editingProperty} 
                        onClose={() => setEditingProperty(null)}
                        onUpdate={fetchData}
                        isLoading={loadingDetails}
                    />
                )}

                <header className="page-header">
                    <div>
                        <h1 className="page-title">Gestion des Collaborateurs</h1>
                        <p className="page-subtitle">Suivi des biens et gestion des comptes</p>
                    </div>
                </header>

                {error && (
                    <div style={{ 
                        marginBottom: '1.5rem', 
                        padding: '1rem', 
                        background: 'rgba(239, 68, 68, 0.1)', 
                        border: '1px solid rgba(239, 68, 68, 0.3)', 
                        borderRadius: '12px', 
                        color: '#ef4444', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.75rem' 
                    }}>
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                    <button
                        onClick={() => { setActiveTab('biens'); setSearchTerm(''); }}
                        style={{
                            flex: 1,
                            padding: '1rem',
                            borderRadius: '12px',
                            border: 'none',
                            background: activeTab === 'biens' ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'rgba(255,255,255,0.05)',
                            color: activeTab === 'biens' ? 'white' : '#94a3b8',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.2s',
                            boxShadow: activeTab === 'biens' ? '0 4px 12px rgba(37, 99, 235, 0.3)' : 'none'
                        }}
                    >
                        <Building2 size={20} />
                        Suivi des Biens
                    </button>
                    <button
                        onClick={() => { setActiveTab('comptes'); setSearchTerm(''); }}
                        style={{
                            flex: 1,
                            padding: '1rem',
                            borderRadius: '12px',
                            border: 'none',
                            background: activeTab === 'comptes' ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'rgba(255,255,255,0.05)',
                            color: activeTab === 'comptes' ? 'white' : '#94a3b8',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.2s',
                            boxShadow: activeTab === 'comptes' ? '0 4px 12px rgba(37, 99, 235, 0.3)' : 'none'
                        }}
                    >
                        <Users size={20} />
                        Gestion des Comptes
                    </button>
                </div>

                {/* Controls Bar */}
                <div className="filters-bar" style={{ marginBottom: '1.5rem' }}>
                    <div className="search-wrapper" style={{ flex: 1 }}>
                        <Search size={18} className="search-icon" />
                        <input 
                            type="text" 
                            placeholder={activeTab === 'biens' ? "Rechercher un bien..." : "Rechercher un collaborateur..."}
                            className="search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {activeTab === 'biens' && (
                        <div className={`filter-dropdown ${showCollabDropdown ? 'open' : ''}`} onClick={() => setShowCollabDropdown(!showCollabDropdown)}>
                            <Users size={18} />
                            <span>
                                {selectedCollabFilter === 'ALL' 
                                    ? 'Tous les collaborateurs' 
                                    : collaborateurs.find(c => c.id === selectedCollabFilter)?.nom || 'Collaborateur'}
                            </span>
                            <ChevronDown size={16} className="dropdown-arrow" />
                            {showCollabDropdown && (
                                <div className="dropdown-menu">
                                    <div 
                                        className={`dropdown-item ${selectedCollabFilter === 'ALL' ? 'active' : ''}`}
                                        onClick={(e) => { e.stopPropagation(); setSelectedCollabFilter('ALL'); setShowCollabDropdown(false); }}
                                    >
                                        Tous les collaborateurs
                                    </div>
                                    {collaborateurs.map(collab => (
                                        <div 
                                            key={collab.id}
                                            className={`dropdown-item ${selectedCollabFilter === collab.id ? 'active' : ''}`}
                                            onClick={(e) => { e.stopPropagation(); setSelectedCollabFilter(collab.id); setShowCollabDropdown(false); }}
                                        >
                                            {collab.prenom} {collab.nom}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'comptes' && (
                        <button 
                            onClick={() => setShowCreateModal(true)}
                            className="btn-primary"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap', width: 'auto', padding: '0.75rem 1.5rem' }}
                        >
                            <Plus size={20} />
                            Nouveau Collaborateur
                        </button>
                    )}

                    {activeTab === 'biens' && (
                        <div className="view-toggles" style={{ 
                            marginLeft: 'auto', 
                            display: 'flex', 
                            gap: '0.5rem', 
                            background: 'rgba(0,0,0,0.2)', 
                            padding: '0.25rem', 
                            borderRadius: '8px',
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                            <button 
                                onClick={() => setViewMode('list')}
                                title="Vue liste"
                                className={viewMode === 'list' ? 'active' : ''}
                                style={{
                                    background: viewMode === 'list' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                                    color: viewMode === 'list' ? '#3b82f6' : '#94a3b8',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '0.4rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <List size={20} />
                            </button>
                            <button 
                                onClick={() => setViewMode('grid')}
                                title="Vue grille"
                                className={viewMode === 'grid' ? 'active' : ''}
                                style={{
                                    background: viewMode === 'grid' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                                    color: viewMode === 'grid' ? '#3b82f6' : '#94a3b8',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '0.4rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <LayoutGrid size={20} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Content */}
                <AnimatePresence mode="wait">
                    {activeTab === 'biens' ? (
                        <motion.div
                            key="biens"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {filteredProperties.length === 0 ? (
                                <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                                    <Building2 size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                                    <p>Aucun bien trouvé</p>
                                </div>
                            ) : (
                                <AnimatePresence mode="wait">
                                    {viewMode === 'list' ? (
                                        <motion.div
                                            key="list"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ duration: 0.2 }}
                                            className="content-table-container"
                                            style={{ padding: 0, overflow: 'hidden' }}
                                        >
                                            <table className="glass-table">
                                                <thead>
                                                    <tr>
                                                        <th>Bien</th>
                                                        <th>Type</th>
                                                        <th>Prix</th>
                                                        <th>Statut</th>
                                                        <th>Créé par</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredProperties.map((property) => (
                                                        <tr key={property.id}>
                                                            <td>
                                                                <div className="table-item-info">
                                                                    <span className="item-name">{property.titre}</span>
                                                                    <span className="item-sub">{property.adresse}</span>
                                                                </div>
                                                            </td>
                                                            <td>{property.type}</td>
                                                            <td>
                                                                {property.transaction === 'VENTE' 
                                                                    ? formatPrice(property.prixVente)
                                                                    : formatPrice(property.prixLocation)}
                                                            </td>
                                                            <td>
                                                                <span className={`status-badge ${getStatusBadgeClass(property.statut)}`}>
                                                                    {getStatusLabel(property.statut)}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#94a3b8' }}>
                                                                    <Users size={14} />
                                                                    {collaborateurs.find(c => c.id === property.createdById)?.nom 
                                                                        ? `${collaborateurs.find(c => c.id === property.createdById).prenom} ${collaborateurs.find(c => c.id === property.createdById).nom}`
                                                                        : (property.createdById ? 'Admin / Autre' : 'Inconnu')}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                                    <button 
                                                                        className="btn-icon" 
                                                                        title="Voir"
                                                                        onClick={() => handleViewProperty(property)}
                                                                        style={{
                                                                            background: 'rgba(59, 130, 246, 0.1)',
                                                                            border: '1px solid rgba(59, 130, 246, 0.3)',
                                                                            borderRadius: '6px',
                                                                            padding: '0.4rem',
                                                                            cursor: 'pointer',
                                                                            color: '#3b82f6'
                                                                        }}
                                                                    >
                                                                        <Eye size={16} />
                                                                    </button>
                                                                    <button 
                                                                        className="btn-icon" 
                                                                        title="Modifier"
                                                                        onClick={() => handleEditProperty(property)}
                                                                        style={{
                                                                            background: 'rgba(245, 158, 11, 0.1)',
                                                                            border: '1px solid rgba(245, 158, 11, 0.3)',
                                                                            borderRadius: '6px',
                                                                            padding: '0.4rem',
                                                                            cursor: 'pointer',
                                                                            color: '#f59e0b'
                                                                        }}
                                                                    >
                                                                        <Edit size={16} />
                                                                    </button>
                                                                    <button 
                                                                        className="btn-icon" 
                                                                        title="Supprimer"
                                                                        onClick={() => handleDeleteProperty(property.id)}
                                                                        style={{
                                                                            background: 'rgba(239, 68, 68, 0.1)',
                                                                            border: '1px solid rgba(239, 68, 68, 0.3)',
                                                                            borderRadius: '6px',
                                                                            padding: '0.4rem',
                                                                            cursor: 'pointer',
                                                                            color: '#ef4444'
                                                                        }}
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="grid"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ duration: 0.2 }}
                                            className="properties-grid-view" 
                                            style={{ 
                                                display: 'grid', 
                                                gridTemplateColumns: 'repeat(2, 1fr)', 
                                                gap: '1.5rem' 
                                            }}
                                        >
                                            {filteredProperties.map((property) => {
                                                const photoUrl = getFirstPhoto(property);
                                                return (
                                                    <div key={property.id} style={{
                                                        background: 'rgba(255, 255, 255, 0.05)',
                                                        borderRadius: '16px',
                                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                                        padding: '1rem',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '1rem',
                                                        overflow: 'hidden'
                                                    }}>
                                                        <div style={{ 
                                                            height: '200px', 
                                                            width: '100%',
                                                            background: '#1e293b', 
                                                            borderRadius: '12px', 
                                                            overflow: 'hidden',
                                                            position: 'relative'
                                                        }}>
                                                            {photoUrl ? (
                                                                <img src={photoUrl} alt={property.titre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            ) : (
                                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', flexDirection: 'column', gap: '0.5rem' }}>
                                                                    <Package size={48} />
                                                                    <span style={{ fontSize: '0.9rem' }}>Pas de photo</span>
                                                                </div>
                                                            )}
                                                            <span className={`status-badge ${getStatusBadgeClass(property.statut)}`} style={{ position: 'absolute', top: '1rem', right: '1rem', backdropFilter: 'blur(4px)' }}>
                                                                {getStatusLabel(property.statut)}
                                                            </span>
                                                            <div style={{ 
                                                                position: 'absolute', bottom: '1rem', left: '1rem', 
                                                                background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                                                                padding: '0.25rem 0.75rem', borderRadius: '20px', 
                                                                color: 'white', fontSize: '0.8rem', fontWeight: '500',
                                                                display: 'flex', alignItems: 'center', gap: '0.25rem'
                                                            }}>
                                                                {property.type}
                                                            </div>
                                                        </div>

                                                        <div style={{ padding: '0 0.5rem' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                                                <div>
                                                                    <h3 style={{ color: 'white', fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.25rem' }}>{property.titre}</h3>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                                                                        <MapPin size={14} /> {property.adresse}
                                                                    </div>
                                                                </div>
                                                                <div style={{ textAlign: 'right' }}>
                                                                    <div style={{ color: '#3b82f6', fontWeight: '700', fontSize: '1.1rem' }}>
                                                                        {property.transaction === 'VENTE' ? formatPrice(property.prixVente) : formatPrice(property.prixLocation)}
                                                                    </div>
                                                                    <div style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase' }}>{property.transaction}</div>
                                                                </div>
                                                            </div>

                                                            {/* Creator Info */}
                                                            <div style={{ 
                                                                padding: '0.5rem', 
                                                                background: 'rgba(59, 130, 246, 0.1)', 
                                                                borderRadius: '8px',
                                                                marginBottom: '1rem',
                                                                display: 'flex', 
                                                                alignItems: 'center', 
                                                                gap: '0.5rem',
                                                                fontSize: '0.85rem',
                                                                color: '#93c5fd'
                                                            }}>
                                                                <Users size={14} />
                                                                <span>
                                                                    Créé par: {
                                                                        collaborateurs.find(c => c.id === property.createdById)?.nom 
                                                                            ? `${collaborateurs.find(c => c.id === property.createdById).prenom} ${collaborateurs.find(c => c.id === property.createdById).nom}`
                                                                            : (property.createdById ? 'Admin / Autre' : 'Inconnu')
                                                                    }
                                                                </span>
                                                            </div>

                                                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                                                <button 
                                                                    onClick={() => handleViewProperty(property)}
                                                                    style={{
                                                                        flex: 1,
                                                                        background: 'rgba(59, 130, 246, 0.1)',
                                                                        border: '1px solid rgba(59, 130, 246, 0.3)',
                                                                        borderRadius: '8px',
                                                                        padding: '0.75rem',
                                                                        cursor: 'pointer',
                                                                        color: '#3b82f6',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        gap: '0.5rem',
                                                                        fontSize: '0.9rem',
                                                                        fontWeight: '600',
                                                                        transition: 'all 0.2s'
                                                                    }}
                                                                >
                                                                    <Eye size={18} /> Détails
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleEditProperty(property)}
                                                                    style={{
                                                                        background: 'rgba(245, 158, 11, 0.1)',
                                                                        border: '1px solid rgba(245, 158, 11, 0.3)',
                                                                        borderRadius: '8px',
                                                                        padding: '0.75rem',
                                                                        cursor: 'pointer',
                                                                        color: '#f59e0b',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        transition: 'all 0.2s'
                                                                    }}
                                                                >
                                                                    <Edit size={18} />
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleDeleteProperty(property.id)}
                                                                    style={{
                                                                        background: 'rgba(239, 68, 68, 0.1)',
                                                                        border: '1px solid rgba(239, 68, 68, 0.3)',
                                                                        borderRadius: '8px',
                                                                        padding: '0.75rem',
                                                                        cursor: 'pointer',
                                                                        color: '#ef4444',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        transition: 'all 0.2s'
                                                                    }}
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="comptes"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                            <th style={{ padding: '1rem', textAlign: 'left', color: '#94a3b8', fontWeight: '600', fontSize: '0.9rem' }}>Collaborateur</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', color: '#94a3b8', fontWeight: '600', fontSize: '0.9rem' }}>Email</th>
                                            <th style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8', fontWeight: '600', fontSize: '0.9rem' }}>Biens Créés</th>
                                            <th style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8', fontWeight: '600', fontSize: '0.9rem' }}>Date d'ajout</th>
                                            <th style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8', fontWeight: '600', fontSize: '0.9rem' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredCollaborateurs.map((collab) => (
                                            <tr key={collab.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        <div style={{
                                                            width: '40px', height: '40px', borderRadius: '50%',
                                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            fontSize: '1.1rem', fontWeight: 'bold', color: 'white'
                                                        }}>
                                                            {collab.prenom?.[0]}{collab.nom?.[0]}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: '500', color: 'white' }}>{collab.prenom} {collab.nom}</div>
                                                            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>ID: {collab.id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem', color: '#cbd5e1' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <Mail size={16} style={{ color: '#94a3b8' }} /> {collab.email}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                    <span style={{
                                                        background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6',
                                                        padding: '0.25rem 0.75rem', borderRadius: '12px',
                                                        fontSize: '0.9rem', fontWeight: '600'
                                                    }}>
                                                        {collab._count?.biensCreated || 0}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                                        <Calendar size={16} /> {new Date(collab.dateCreation).toLocaleDateString('fr-FR')}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                                        <button onClick={() => handleViewCollab(collab)} style={{
                                                            background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)',
                                                            borderRadius: '6px', padding: '0.4rem', cursor: 'pointer', color: '#3b82f6'
                                                        }}>
                                                            <Eye size={16} />
                                                        </button>
                                                        <button onClick={() => handleEditCollabClick(collab)} style={{
                                                            background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)',
                                                            borderRadius: '6px', padding: '0.4rem', cursor: 'pointer', color: '#f59e0b'
                                                        }}>
                                                            <Edit size={16} />
                                                        </button>
                                                        <button onClick={() => handleDeleteCollab(collab.id)} style={{
                                                            background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
                                                            borderRadius: '6px', padding: '0.4rem', cursor: 'pointer', color: '#ef4444'
                                                        }}>
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
                                        <p>Aucun collaborateur trouvé</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Create Modal */}
                <AnimatePresence>
                    {showCreateModal && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            style={{
                                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                                background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem'
                            }}
                            onClick={() => !createLoading && setShowCreateModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                                className="modal-content"
                                style={{ maxWidth: '500px', width: '100%', padding: '2rem', position: 'relative' }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button onClick={() => !createLoading && setShowCreateModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                                    <X size={24} />
                                </button>
                                <h2 style={{ marginBottom: '1.5rem', color: 'white' }}>Nouveau Collaborateur</h2>
                                {createSuccess ? (
                                    <div style={{ padding: '3rem', textAlign: 'center' }}>
                                        <CheckCircle2 size={64} style={{ color: '#22c55e', marginBottom: '1rem' }} />
                                        <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>Collaborateur créé !</h3>
                                    </div>
                                ) : (
                                    <form onSubmit={handleCreateCollab}>
                                        {createError && (
                                            <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#ef4444', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <AlertCircle size={20} /> {createError}
                                            </div>
                                        )}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                            <div className="form-group">
                                                <label>Nom *</label>
                                                <input type="text" value={formData.nom} onChange={(e) => setFormData({ ...formData, nom: e.target.value })} required disabled={createLoading} />
                                            </div>
                                            <div className="form-group">
                                                <label>Prénom *</label>
                                                <input type="text" value={formData.prenom} onChange={(e) => setFormData({ ...formData, prenom: e.target.value })} required disabled={createLoading} />
                                            </div>
                                        </div>
                                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                                            <label>Email *</label>
                                            <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required disabled={createLoading} />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: '1.5rem', position: 'relative' }}>
                                            <label>Mot de passe *</label>
                                            <div style={{ position: 'relative' }}>
                                                <input 
                                                    type={showPassword ? "text" : "password"} 
                                                    value={formData.password} 
                                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                                                    required 
                                                    disabled={createLoading} 
                                                    minLength={6}
                                                    style={{ width: '100%', paddingRight: '40px' }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    style={{
                                                        position: 'absolute',
                                                        right: '10px',
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        background: 'none',
                                                        border: 'none',
                                                        color: '#94a3b8',
                                                        cursor: 'pointer',
                                                        padding: 0,
                                                        display: 'flex',
                                                        alignItems: 'center'
                                                    }}
                                                >
                                                    {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                                                </button>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <button type="button" onClick={() => setShowCreateModal(false)} className="btn-danger" disabled={createLoading} style={{ flex: 1 }}>Annuler</button>
                                            <button type="submit" className="btn-primary" disabled={createLoading} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                                {createLoading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />} Créer
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* View Collab Modal */}
                <AnimatePresence>
                    {viewCollab && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            style={{
                                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                                background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem'
                            }}
                            onClick={() => setViewCollab(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                                className="modal-content"
                                style={{ maxWidth: '500px', width: '100%', padding: '2rem', position: 'relative' }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button onClick={() => setViewCollab(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                                    <X size={24} />
                                </button>
                                <h2 style={{ marginBottom: '1.5rem', color: 'white' }}>Détails du Collaborateur</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                        <div style={{
                                            width: '60px', height: '60px', borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '1.5rem', fontWeight: 'bold', color: 'white'
                                        }}>
                                            {viewCollab.prenom?.[0]}{viewCollab.nom?.[0]}
                                        </div>
                                        <div>
                                            <h3 style={{ color: 'white', margin: 0 }}>{viewCollab.prenom} {viewCollab.nom}</h3>
                                            <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>ID: {viewCollab.id}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gap: '1rem' }}>
                                        <div>
                                            <label style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Email</label>
                                            <div style={{ color: 'white', fontSize: '1rem' }}>{viewCollab.email}</div>
                                        </div>
                                        <div>
                                            <label style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Date d'ajout</label>
                                            <div style={{ color: 'white', fontSize: '1rem' }}>{new Date(viewCollab.dateCreation).toLocaleDateString('fr-FR')}</div>
                                        </div>
                                        <div>
                                            <label style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Biens créés</label>
                                            <div style={{ color: 'white', fontSize: '1rem' }}>{viewCollab._count?.biensCreated || 0}</div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Edit Collab Modal */}
                <AnimatePresence>
                    {editCollab && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            style={{
                                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                                background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem'
                            }}
                            onClick={() => !updateLoading && setEditCollab(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                                className="modal-content"
                                style={{ maxWidth: '500px', width: '100%', padding: '2rem', position: 'relative' }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button onClick={() => !updateLoading && setEditCollab(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                                    <X size={24} />
                                </button>
                                <h2 style={{ marginBottom: '1.5rem', color: 'white' }}>Modifier le Collaborateur</h2>
                                <form onSubmit={handleUpdateCollab}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                        <div className="form-group">
                                            <label>Nom</label>
                                            <input type="text" value={editFormData.nom} onChange={(e) => setEditFormData({ ...editFormData, nom: e.target.value })} required disabled={updateLoading} />
                                        </div>
                                        <div className="form-group">
                                            <label>Prénom</label>
                                            <input type="text" value={editFormData.prenom} onChange={(e) => setEditFormData({ ...editFormData, prenom: e.target.value })} required disabled={updateLoading} />
                                        </div>
                                    </div>
                                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                        <label>Email</label>
                                        <input type="email" value={editFormData.email} onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })} required disabled={updateLoading} />
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button type="button" onClick={() => setEditCollab(null)} className="btn-danger" disabled={updateLoading} style={{ flex: 1 }}>Annuler</button>
                                        <button type="submit" className="btn-primary" disabled={updateLoading} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                            {updateLoading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />} Enregistrer
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </PageTransition>
    );
};

export default GestionCollaborateurs;

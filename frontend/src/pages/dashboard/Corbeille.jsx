
import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, Eye, Edit, Trash2, X, MapPin, Home, DollarSign, Package, ChevronDown, LayoutGrid, List, User, Maximize, LayoutDashboard, CheckCircle2, XCircle, AlertCircle, FileCheck, Clock, Undo } from 'lucide-react';
import PageTransition from '../../components/PageTransition';
import PropertyDetailsModal from '../../components/property/PropertyDetailsModal';
import { getTrashedProperties, getPropertyById, restoreProperty, permanentlyDeleteProperty, emptyTrash, apiConfig } from '../../api/api';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars


import { searchProperty } from '../../utils/searchUtils';

const Corbeille = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [filterType, setFilterType] = useState('ALL');
    const [sortDate, setSortDate] = useState('NEWEST');
    const [showTypeDropdown, setShowTypeDropdown] = useState(false);
    const [showDateDropdown, setShowDateDropdown] = useState(false);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getTrashedProperties();

            // Properties fetched successfully

            // Extract properties from response
            // Backend returns { status: 'success', data: [...], count: N }
            const propertiesData = response.data || [];
            // All properties in trash (deletedAt is not null)
            setProperties(propertiesData);
        } catch (err) {
            console.error('Error fetching trashed properties:', err);
            setError(err.message || 'Erreur lors du chargement des biens supprimés');
        } finally {
            setLoading(false);
        }
    };

    // Calculate stats
    const totalProperties = properties.length;

    // Filter properties based on search and type, then sort by date
    const filteredProperties = properties.filter(property => {
        const matchesSearch = searchProperty(property, searchQuery);
        const matchesType = filterType === 'ALL' || property.type === filterType;

        return matchesSearch && matchesType;
    }).sort((a, b) => {
        const dateA = new Date(a.dateCreation).getTime();
        const dateB = new Date(b.dateCreation).getTime();

        if (sortDate === 'NEWEST') return dateB - dateA;
        if (sortDate === 'OLDEST') return dateA - dateB;
        return 0;
    });

    const getStatusBadgeClass = (statut) => {
        switch (statut) {
            case 'DISPONIBLE':
                return 'available';
            case 'EN_COURS':
                return 'pending';
            case 'VENDU':
            case 'LOUE':
                return 'sold';
            default:
                return '';
        }
    };

    const getStatusLabel = (statut) => {
        const labels = {
            'DISPONIBLE': 'Disponible',
            'EN_COURS': 'En cours',
            'VENDU': 'Vendu',
            'LOUE': 'Loué',
        };
        return labels[statut] || statut;
    };

    const handleRestoreProperty = async (propertyId) => {
        if (!propertyId) {
            console.error('Error: propertyId is undefined or null');
            alert('Erreur: ID du bien introuvable');
            return;
        }

        if (window.confirm('🔄 Voulez-vous restaurer ce bien?\n\nLe bien sera retiré de la corbeille et restauré dans les archives.')) {
            try {
                await restoreProperty(propertyId);
                // Refresh properties list
                fetchProperties();
                alert('✅ Bien restauré avec succès!');
            } catch (err) {
                console.error('Error restoring property:', err);
                alert('Erreur lors de la restauration du bien: ' + err.message);
            }
        }
    };

    const handlePermanentDelete = async (propertyId) => {
        if (!propertyId) {
            console.error('Error: propertyId is undefined or null');
            alert('Erreur: ID du bien introuvable');
            return;
        }

        if (window.confirm('⚠️ SUPPRESSION DÉFINITIVE ⚠️\n\nÊtes-vous ABSOLUMENT SÛR de vouloir supprimer définitivement ce bien?\n\n❌ Cette action est IRRÉVERSIBLE!\n❌ Toutes les données (documents, photos, etc.) seront DÉFINITIVEMENT supprimées.\n\nTapez "SUPPRIMER" pour confirmer.')) {
            const confirmation = prompt('Tapez "SUPPRIMER" pour confirmer la suppression définitive:');
            if (confirmation === 'SUPPRIMER') {
                try {
                    await permanentlyDeleteProperty(propertyId);
                    // Refresh properties list
                    fetchProperties();
                    alert('✅ Bien supprimé définitivement');
                } catch (err) {
                    console.error('Error permanently deleting property:', err);
                    alert('Erreur lors de la suppression définitive: ' + err.message);
                }
            } else {
                alert('Suppression annulée');
            }
        }
    };

    const handleEmptyTrash = async () => {
        if (properties.length === 0) return;

        if (window.confirm('⚠️ VIDER LA CORBEILLE ⚠️\n\nÊtes-vous sûr de vouloir supprimer DÉFINITIVEMENT TOUS les biens de la corbeille ?\n\n❌ Cette action est IRRÉVERSIBLE et supprimera tous les fichiers associés.')) {
            const confirmation = prompt('Tapez "VIDER" pour confirmer la suppression définitive de TOUS les éléments:');
            if (confirmation === 'VIDER') {
                try {
                    setLoading(true);
                    await emptyTrash();
                    await fetchProperties();
                    alert('✅ Corbeille vidée avec succès');
                } catch (err) {
                    console.error('Error emptying trash:', err);
                    alert('Erreur lors du vidage de la corbeille: ' + err.message);
                    setLoading(false);
                }
            } else {
                alert('Opération annulée');
            }
        }
    };

    const getDaysRemaining = (deletedAt) => {
        if (!deletedAt) return 30; // If no deletedAt, assume full 30 days
        const deleted = new Date(deletedAt);
        const now = new Date();
        const diffTime = now - deleted;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const remaining = 30 - diffDays;
        return remaining;
    };

    const formatPrice = (price) => {
        if (!price) return '-';
        return new Intl.NumberFormat('fr-DZ', {
            style: 'decimal',
            minimumFractionDigits: 0,
        }).format(price) + ' DA';
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }).format(date);
    };

    const getPriorityLabel = (priorite) => {
        const labels = {
            'TRES_IMPORTANT': 'Très Important',
            'IMPORTANT': 'Important',
            'NORMAL': 'Normal',
        };
        return labels[priorite] || 'Normal';
    };

    const getPriorityColor = (priorite) => {
        const colors = {
            'TRES_IMPORTANT': { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)', text: '#ef4444' },
            'IMPORTANT': { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)', text: '#f59e0b' },
            'NORMAL': { bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.4)', text: '#3b82f6' },
        };
        return colors[priorite] || colors['NORMAL'];
    };

    const getFileUrl = (url) => {
        if (!url) return '#';
        if (url.startsWith('http')) return url;
        const cleanUrl = url.startsWith('/') ? url : `/ ${url} `;
        return `${apiConfig.baseUrl}${cleanUrl} `;
    };

    const getFirstPhoto = (property) => {
        if (!property.piecesJointes) return null;
        const photo = property.piecesJointes.find(pj => pj.type === 'PHOTO' && pj.visibilite === 'PUBLIABLE');
        return photo ? getFileUrl(photo.url) : null;
    };

    const getPropertySpecs = (property) => {
        let specs = [];

        // Surface
        let surface = null;
        if (property.detailAppartement?.surfaceTotal) surface = property.detailAppartement.surfaceTotal;
        else if (property.detailVilla?.surface) surface = property.detailVilla.surface;
        else if (property.detailTerrain?.surface) surface = property.detailTerrain.surface;
        else if (property.detailLocal?.surface) surface = property.detailLocal.surface;
        else if (property.detailImmeuble?.surface) surface = property.detailImmeuble.surface;

        if (surface) specs.push(`${surface} m²`);

        // Rooms / Pieces / Type
        let pieces = null;
        if (property.detailAppartement?.typeAppart) pieces = property.detailAppartement.typeAppart;
        else if (property.detailVilla?.pieces) pieces = `${property.detailVilla.pieces} Pièces`;
        else if (property.detailImmeuble?.nbAppartements) pieces = `${property.detailImmeuble.nbAppartements} Appts`;

        if (pieces) specs.push(pieces);

        return specs;
    };

    const handleViewProperty = async (property) => {
        setSelectedProperty(property); // Show modal immediately with basic info
        setLoadingDetails(true);

        try {
            const response = await getPropertyById(property.id);
            if (response.data) {
                setSelectedProperty(response.data); // Update with full details
            }
        } catch (err) {
            console.error('Error fetching property details:', err);
            // Optionally show error in modal or toast
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleCloseModal = () => {
        setSelectedProperty(null);
        setLoadingDetails(false);
    };

    return (
        <PageTransition>
            <div className="page-container">
                {selectedProperty && (
                    <PropertyDetailsModal
                        property={selectedProperty}
                        onClose={handleCloseModal}
                        isLoading={loadingDetails && !selectedProperty.detailAppartement}
                    />
                )}

                <header className="page-header">
                    <div>
                        <h1 className="page-title">Corbeille</h1>
                        <p className="page-subtitle">Biens supprimés (Suppression définitive après 30 jours)</p>
                    </div>
                </header>

                <div className="filters-bar">
                    <div className="search-wrapper">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Rechercher un bien..."
                            className="search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className={`filter-dropdown ${showTypeDropdown ? 'open' : ''}`} onClick={() => setShowTypeDropdown(!showTypeDropdown)}>
                        <Filter size={18} />
                        <span>{filterType === 'ALL' ? 'Type de bien' : filterType}</span>
                        <ChevronDown size={16} className="dropdown-arrow" />
                        {showTypeDropdown && (
                            <div className="dropdown-menu">
                                <div className={`dropdown-item ${filterType === 'ALL' ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); setFilterType('ALL'); setShowTypeDropdown(false); }}>Tous les types</div>
                                <div className={`dropdown-item ${filterType === 'APPARTEMENT' ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); setFilterType('APPARTEMENT'); setShowTypeDropdown(false); }}>Appartement</div>
                                <div className={`dropdown-item ${filterType === 'VILLA' ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); setFilterType('VILLA'); setShowTypeDropdown(false); }}>Villa</div>
                                <div className={`dropdown-item ${filterType === 'TERRAIN' ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); setFilterType('TERRAIN'); setShowTypeDropdown(false); }}>Terrain</div>
                                <div className={`dropdown-item ${filterType === 'LOCAL' ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); setFilterType('LOCAL'); setShowTypeDropdown(false); }}>Local</div>
                                <div className={`dropdown-item ${filterType === 'IMMEUBLE' ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); setFilterType('IMMEUBLE'); setShowTypeDropdown(false); }}>Immeuble</div>
                            </div>
                        )}
                    </div>

                    <div className={`filter-dropdown ${showDateDropdown ? 'open' : ''}`} onClick={() => setShowDateDropdown(!showDateDropdown)}>
                        <Calendar size={18} />
                        <span>{sortDate === 'NEWEST' ? 'Plus récents' : 'Plus anciens'}</span>
                        <ChevronDown size={16} className="dropdown-arrow" />
                        {showDateDropdown && (
                            <div className="dropdown-menu">
                                <div className={`dropdown-item ${sortDate === 'NEWEST' ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); setSortDate('NEWEST'); setShowDateDropdown(false); }}>Plus récents</div>
                                <div className={`dropdown-item ${sortDate === 'OLDEST' ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); setSortDate('OLDEST'); setShowDateDropdown(false); }}>Plus anciens</div>
                            </div>
                        )}
                    </div>

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

                    {filteredProperties.length > 0 && (
                        <button
                            onClick={handleEmptyTrash}
                            style={{
                                marginLeft: '0.5rem',
                                background: 'rgba(239, 68, 68, 0.2)',
                                color: '#ef4444',
                                border: '1px solid rgba(239, 68, 68, 0.4)',
                                borderRadius: '8px',
                                padding: '0.5rem 1rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                            }}
                        >
                            <Trash2 size={18} />
                            Vider
                        </button>
                    )}
                </div>

                <div className="stats-grid">
                    <div className="stat-card blue">
                        <div className="stat-value">{totalProperties}</div>
                        <div className="stat-label">Total Corbeille</div>
                    </div>
                </div>

                <div className="content-table-container">
                    {loading ? (
                        <div style={{
                            padding: '3rem',
                            textAlign: 'center',
                            color: 'var(--text-secondary)'
                        }}>
                            Chargement de la corbeille...
                        </div>
                    ) : error ? (
                        <div style={{
                            padding: '2rem',
                            textAlign: 'center',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '8px',
                            color: '#ef4444'
                        }}>
                            ❌ {error}
                        </div>
                    ) : filteredProperties.length === 0 ? (
                        <div style={{
                            padding: '3rem',
                            textAlign: 'center',
                            color: 'var(--text-secondary)'
                        }}>
                            {searchQuery
                                ? `Aucun bien trouvé pour "${searchQuery}"`
                                : '🗑️ La corbeille est vide.'}
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">
                            {viewMode === 'list' ? (
                                <motion.table
                                    key="list"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="glass-table"
                                >
                                    <thead>
                                        <tr>
                                            <th>Bien</th>
                                            <th>Type</th>
                                            <th>Prix</th>
                                            <th>Statut</th>
                                            <th>Transaction</th>
                                            <th>Date d'ajout</th>
                                            <th>Expiration</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredProperties.map((property) => {
                                            const remaining = getDaysRemaining(property.deletedAt);
                                            return (
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
                                                        <span className={`status-badge ${property.transaction === 'VENTE' ? 'available' : 'pending'}`}>
                                                            {property.transaction}
                                                        </span>
                                                    </td>
                                                    <td>{formatDate(property.dateCreation)}</td>
                                                    <td>
                                                        <span className={`status-badge ${remaining <= 5 ? 'error' : 'neutral'}`} style={{
                                                            background: remaining <= 5 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                                                            color: remaining <= 5 ? '#ef4444' : '#94a3b8',
                                                            border: remaining <= 5 ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(148, 163, 184, 0.3)',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '0.25rem'
                                                        }}>
                                                            <Clock size={12} />
                                                            {remaining <= 0 ? 'Imminente' : `${remaining} jours`}
                                                        </span>
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
                                                                title="Restaurer"
                                                                onClick={() => handleRestoreProperty(property.id)}
                                                                style={{
                                                                    background: 'rgba(34, 197, 94, 0.1)',
                                                                    border: '1px solid rgba(34, 197, 94, 0.3)',
                                                                    borderRadius: '6px',
                                                                    padding: '0.4rem',
                                                                    cursor: 'pointer',
                                                                    color: '#22c55e'
                                                                }}
                                                            >
                                                                <Undo size={16} />
                                                            </button>
                                                            <button
                                                                className="btn-icon"
                                                                title="Supprimer Définitivement"
                                                                onClick={() => handlePermanentDelete(property.id)}
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
                                            )
                                        })}
                                    </tbody>
                                </motion.table>
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
                                    }}>
                                    {filteredProperties.map((property) => {
                                        const photoUrl = getFirstPhoto(property);
                                        const remaining = getDaysRemaining(property.deletedAt);
                                        return (
                                            <div key={property.id} style={{
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                borderRadius: '16px',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                padding: '1rem',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '1rem',
                                                transition: 'transform 0.2s',
                                                cursor: 'default',
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
                                                            {property.type === 'APPARTEMENT' ? <Home size={48} /> :
                                                                property.type === 'VILLA' ? <Home size={48} /> :
                                                                    property.type === 'TERRAIN' ? <MapPin size={48} /> :
                                                                        property.type === 'LOCAL' ? <DollarSign size={48} /> :
                                                                            <Package size={48} />}
                                                            <span style={{ fontSize: '0.9rem' }}>Pas de photo</span>
                                                        </div>
                                                    )}
                                                    <span className="status-badge sold" style={{ position: 'absolute', top: '1rem', right: '1rem', backdropFilter: 'blur(4px)', boxShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
                                                        Archivé
                                                    </span>

                                                    {/* Expiration Badge */}
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '1rem',
                                                        left: '1rem',
                                                        background: remaining <= 5 ? 'rgba(239, 68, 68, 0.9)' : 'rgba(30, 41, 59, 0.8)',
                                                        backdropFilter: 'blur(4px)',
                                                        padding: '0.25rem 0.5rem',
                                                        borderRadius: '6px',
                                                        color: 'white',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '600',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.25rem',
                                                        boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                                                    }}>
                                                        <Clock size={12} />
                                                        {remaining <= 0 ? 'Suppression imminente' : `${remaining}j restants`}
                                                    </div>

                                                    <div style={{
                                                        position: 'absolute',
                                                        bottom: '1rem',
                                                        left: '1rem',
                                                        background: 'rgba(0,0,0,0.6)',
                                                        backdropFilter: 'blur(4px)',
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '20px',
                                                        color: 'white',
                                                        fontSize: '0.8rem',
                                                        fontWeight: '500',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.25rem'
                                                    }}>
                                                        {property.type === 'APPARTEMENT' ? <Home size={14} /> :
                                                            property.type === 'VILLA' ? <Home size={14} /> :
                                                                property.type === 'TERRAIN' ? <MapPin size={14} /> :
                                                                    property.type === 'LOCAL' ? <DollarSign size={14} /> :
                                                                        <Package size={14} />}
                                                        {property.type}
                                                    </div>
                                                </div>

                                                <div style={{ padding: '0 0.5rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                                        <div>
                                                            <h3 style={{ color: 'white', fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                                                                {property.titre}
                                                            </h3>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                                                                <MapPin size={14} />
                                                                {property.adresse}
                                                            </div>
                                                        </div>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <div style={{ color: '#3b82f6', fontWeight: '700', fontSize: '1.1rem' }}>
                                                                {property.transaction === 'VENTE'
                                                                    ? formatPrice(property.prixVente)
                                                                    : formatPrice(property.prixLocation)}
                                                            </div>
                                                            <div style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                                                                {property.transaction}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Owner & Specs Section */}
                                                    <div style={{
                                                        padding: '0.75rem',
                                                        background: 'rgba(0,0,0,0.2)',
                                                        borderRadius: '8px',
                                                        marginBottom: '1rem',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '0.5rem'
                                                    }}>
                                                        {/* Owner Info */}
                                                        {property.proprietaire && (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#e2e8f0' }}>
                                                                <User size={14} style={{ color: '#94a3b8' }} />
                                                                <span style={{ fontWeight: '500' }}>
                                                                    {property.proprietaire.nom} {property.proprietaire.prenom}
                                                                </span>
                                                                {property.proprietaire.telephone && (
                                                                    <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>• {property.proprietaire.telephone}</span>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Specs */}
                                                        {getPropertySpecs(property).length > 0 && (
                                                            <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.85rem', color: '#94a3b8', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.5rem' }}>
                                                                {getPropertySpecs(property).map((spec, i) => (
                                                                    <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                                        {i === 0 ? <Maximize size={14} /> : <LayoutDashboard size={14} />}
                                                                        {spec}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Tracking (Suivi) Section */}
                                                    {property.suivi && (
                                                        <div style={{
                                                            padding: '0.75rem',
                                                            background: 'rgba(0,0,0,0.3)',
                                                            borderRadius: '8px',
                                                            marginBottom: '1rem',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            gap: '0.5rem',
                                                            border: '1px solid rgba(255,255,255,0.05)'
                                                        }}>
                                                            <div style={{
                                                                fontSize: '0.75rem',
                                                                fontWeight: '600',
                                                                color: '#94a3b8',
                                                                textTransform: 'uppercase',
                                                                letterSpacing: '0.05em',
                                                                marginBottom: '0.25rem'
                                                            }}>
                                                                Suivi
                                                            </div>

                                                            <div style={{
                                                                display: 'grid',
                                                                gridTemplateColumns: 'repeat(3, 1fr)',
                                                                gap: '0.5rem'
                                                            }}>
                                                                {/* Visité */}
                                                                <div style={{
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    alignItems: 'center',
                                                                    gap: '0.25rem',
                                                                    padding: '0.5rem',
                                                                    background: property.suivi.estVisite
                                                                        ? 'rgba(34, 197, 94, 0.1)'
                                                                        : 'rgba(148, 163, 184, 0.1)',
                                                                    borderRadius: '6px',
                                                                    border: `1px solid ${property.suivi.estVisite
                                                                        ? 'rgba(34, 197, 94, 0.3)'
                                                                        : 'rgba(148, 163, 184, 0.2)'
                                                                        } `
                                                                }}>
                                                                    {property.suivi.estVisite ? (
                                                                        <CheckCircle2 size={16} style={{ color: '#22c55e' }} />
                                                                    ) : (
                                                                        <XCircle size={16} style={{ color: '#94a3b8' }} />
                                                                    )}
                                                                    <span style={{
                                                                        fontSize: '0.7rem',
                                                                        color: property.suivi.estVisite ? '#22c55e' : '#94a3b8',
                                                                        fontWeight: '500'
                                                                    }}>
                                                                        {property.suivi.estVisite ? 'Visité' : 'Non visité'}
                                                                    </span>
                                                                </div>

                                                                {/* Priorité */}
                                                                <div style={{
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    alignItems: 'center',
                                                                    gap: '0.25rem',
                                                                    padding: '0.5rem',
                                                                    background: getPriorityColor(property.suivi.priorite).bg,
                                                                    borderRadius: '6px',
                                                                    border: `1px solid ${getPriorityColor(property.suivi.priorite).border} `
                                                                }}>
                                                                    <AlertCircle size={16} style={{ color: getPriorityColor(property.suivi.priorite).text }} />
                                                                    <span style={{
                                                                        fontSize: '0.7rem',
                                                                        color: getPriorityColor(property.suivi.priorite).text,
                                                                        fontWeight: '500',
                                                                        textAlign: 'center'
                                                                    }}>
                                                                        {getPriorityLabel(property.suivi.priorite)}
                                                                    </span>
                                                                </div>

                                                                {/* Mandat */}
                                                                <div style={{
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    alignItems: 'center',
                                                                    gap: '0.25rem',
                                                                    padding: '0.5rem',
                                                                    background: property.suivi.aMandat
                                                                        ? 'rgba(139, 92, 246, 0.15)'
                                                                        : 'rgba(148, 163, 184, 0.1)',
                                                                    borderRadius: '6px',
                                                                    border: `1px solid ${property.suivi.aMandat
                                                                        ? 'rgba(139, 92, 246, 0.4)'
                                                                        : 'rgba(148, 163, 184, 0.2)'
                                                                        } `
                                                                }}>
                                                                    <FileCheck size={16} style={{ color: property.suivi.aMandat ? '#8b5cf6' : '#94a3b8' }} />
                                                                    <span style={{
                                                                        fontSize: '0.7rem',
                                                                        color: property.suivi.aMandat ? '#8b5cf6' : '#94a3b8',
                                                                        fontWeight: '500'
                                                                    }}>
                                                                        {property.suivi.aMandat ? 'Mandat' : 'Pas mandat'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
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
                                                        onClick={() => handleRestoreProperty(property.id)}
                                                        style={{
                                                            flex: 1,
                                                            background: 'rgba(34, 197, 94, 0.1)',
                                                            border: '1px solid rgba(34, 197, 94, 0.3)',
                                                            borderRadius: '8px',
                                                            padding: '0.75rem',
                                                            cursor: 'pointer',
                                                            color: '#22c55e',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '0.5rem',
                                                            fontSize: '0.9rem',
                                                            fontWeight: '600',
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        <Undo size={18} /> Restaurer
                                                    </button>
                                                    <button
                                                        onClick={() => handlePermanentDelete(property.id)}
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
                                        );
                                    })}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </PageTransition >
    );
};

export default Corbeille;

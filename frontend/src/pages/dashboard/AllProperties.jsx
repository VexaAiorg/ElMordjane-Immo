import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, Eye, Edit, Trash2, X, MapPin, Home, DollarSign, FileText, Package, Image } from 'lucide-react';
import PageTransition from '../../components/PageTransition';
import { getAllProperties, getPropertyById } from '../../api/api';

const PropertyDetailsModal = ({ property, onClose, isLoading }) => {
    if (!property && !isLoading) return null;

    const formatPrice = (price) => {
        if (!price) return '-';
        return new Intl.NumberFormat('fr-DZ', {
            style: 'decimal',
            minimumFractionDigits: 0,
        }).format(price) + ' DA';
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const renderSpecificDetails = () => {
        let details = null;
        let title = '';

        if (property.type === 'APPARTEMENT' && property.detailAppartement) {
            details = property.detailAppartement;
            title = 'Détails Appartement';
        } else if (property.type === 'VILLA' && property.detailVilla) {
            details = property.detailVilla;
            title = 'Détails Villa';
        } else if (property.type === 'TERRAIN' && property.detailTerrain) {
            details = property.detailTerrain;
            title = 'Détails Terrain';
        } else if (property.type === 'LOCAL' && property.detailLocal) {
            details = property.detailLocal;
            title = 'Détails Local';
        } else if (property.type === 'IMMEUBLE' && property.detailImmeuble) {
            details = property.detailImmeuble;
            title = 'Détails Immeuble';
        }

        if (!details) return null;

        const displayKeys = Object.keys(details).filter(key => !['id', 'bienId'].includes(key));

        return (
            <div className="modal-section">
                <h3><Package size={18} /> {title}</h3>
                <div className="info-grid">
                    {displayKeys.map(key => (
                        <div className="info-item" key={key}>
                            <span className="label">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                            <span className="value">
                                {typeof details[key] === 'boolean' 
                                    ? (details[key] ? 'Oui' : 'Non')
                                    : (details[key] || '-')}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>
                    <X size={24} />
                </button>
                
                {isLoading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'white' }}>
                        Chargement des détails...
                    </div>
                ) : (
                    <>
                        <div className="modal-header">
                            <h2>{property.titre}</h2>
                            <span className={`status-badge ${property.statut === 'DISPONIBLE' ? 'available' : 'pending'}`}>
                                {property.statut}
                            </span>
                        </div>

                        <div className="modal-body">
                            <div className="modal-section">
                                <h3><Home size={18} /> Informations Générales</h3>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <span className="label">Type</span>
                                        <span className="value">{property.type}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">Transaction</span>
                                        <span className="value">{property.transaction}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">Prix</span>
                                        <span className="value">
                                            {property.transaction === 'VENTE' 
                                                ? formatPrice(property.prixVente)
                                                : formatPrice(property.prixLocation)}
                                        </span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">Date d'ajout</span>
                                        <span className="value">{formatDate(property.dateCreation)}</span>
                                    </div>
                                </div>
                            </div>

                            {renderSpecificDetails()}

                            <div className="modal-section">
                                <h3><MapPin size={18} /> Localisation</h3>
                                <p className="address-text">{property.adresse}</p>
                            </div>

                            {property.description && (
                                <div className="modal-section">
                                    <h3><FileText size={18} /> Description</h3>
                                    <p className="description-text">{property.description}</p>
                                </div>
                            )}

                            {property.proprietaire && (
                                <div className="modal-section">
                                    <h3><DollarSign size={18} /> Propriétaire</h3>
                                    <div className="info-grid">
                                        <div className="info-item">
                                            <span className="label">Nom complet</span>
                                            <span className="value">{property.proprietaire.nom} {property.proprietaire.prenom}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="label">Téléphone</span>
                                            <span className="value">{property.proprietaire.telephone}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="label">Email</span>
                                            <span className="value">{property.proprietaire.email || '-'}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {property.suivi && (
                                <div className="modal-section">
                                    <h3><Eye size={18} /> Suivi & Mandat</h3>
                                    <div className="info-grid">
                                        <div className="info-item">
                                            <span className="label">Visité ?</span>
                                            <span className="value">{property.suivi.estVisite ? 'Oui' : 'Non'}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="label">Priorité</span>
                                            <span className="value">{property.suivi.priorite}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="label">Mandat ?</span>
                                            <span className="value">{property.suivi.aMandat ? 'Oui' : 'Non'}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                                   {property.papiers && property.papiers.length > 0 && (
                                <div className="modal-section">
                                    <h3><FileText size={18} /> Documents Juridiques</h3>
                                    <div className="info-grid">
                                        {property.papiers.map((papier, index) => {
                                            // Try to find a matching attachment
                                            const matchingAttachment = property.piecesJointes?.find(pj => 
                                                pj.type === 'DOCUMENT' && 
                                                (pj.nom?.toLowerCase() === papier.nom?.toLowerCase() || 
                                                 pj.nom?.toLowerCase().includes(papier.nom?.toLowerCase()))
                                            );

                                            return (
                                                <div className="info-item" key={index}>
                                                    <span className="label">{papier.nom}</span>
                                                    {matchingAttachment ? (
                                                        <a 
                                                            href={matchingAttachment.url} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="value"
                                                            style={{
                                                                color: '#3b82f6',
                                                                textDecoration: 'underline',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '0.25rem'
                                                            }}
                                                        >
                                                            {papier.statut} <Eye size={14} />
                                                        </a>
                                                    ) : (
                                                        <span className="value" style={{
                                                            color: papier.statut === 'DISPONIBLE' ? '#34d399' : '#f87171'
                                                        }}>
                                                            {papier.statut}
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {property.piecesJointes && property.piecesJointes.length > 0 && (
                                <div className="modal-section">
                                    <h3><Image size={18} /> Galerie & Fichiers</h3>
                                    
                                    {/* Photos */}
                                    {property.piecesJointes.filter(pj => pj.type === 'PHOTO').length > 0 && (
                                        <div style={{ marginBottom: '1.5rem' }}>
                                            <h4 style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.75rem' }}>Photos</h4>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem' }}>
                                                {property.piecesJointes.filter(pj => pj.type === 'PHOTO').map((pj, index) => (
                                                    <a 
                                                        key={index} 
                                                        href={pj.url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        style={{
                                                            position: 'relative',
                                                            aspectRatio: '1',
                                                            borderRadius: '8px',
                                                            overflow: 'hidden',
                                                            border: '1px solid rgba(255,255,255,0.1)'
                                                        }}
                                                    >
                                                        <img 
                                                            src={pj.url} 
                                                            alt={pj.nom || 'Photo'} 
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Documents */}
                                    {property.piecesJointes.filter(pj => pj.type === 'DOCUMENT').length > 0 && (
                                        <div>
                                            <h4 style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.75rem' }}>Autres Documents</h4>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                                                {property.piecesJointes.filter(pj => pj.type === 'DOCUMENT').map((pj, index) => (
                                                    <a 
                                                        key={index} 
                                                        href={pj.url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.5rem',
                                                            padding: '0.75rem 1rem',
                                                            background: 'rgba(255,255,255,0.05)',
                                                            borderRadius: '8px',
                                                            textDecoration: 'none',
                                                            color: 'white',
                                                            border: '1px solid rgba(255,255,255,0.1)',
                                                            fontSize: '0.9rem'
                                                        }}
                                                    >
                                                        <FileText size={18} style={{ color: '#3b82f6' }} />
                                                        <span>{pj.nom || 'Document'}</span>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}            </div>

                    </>
                )}
            </div>
        </div>
    );
};

const AllProperties = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getAllProperties();
            
            console.log('Fetched properties:', response);
            
            // Extract properties from response
            // Backend returns { status: 'success', data: [...], count: N }
            const propertiesData = response.data || [];
            setProperties(propertiesData);
        } catch (err) {
            console.error('Error fetching properties:', err);
            setError(err.message || 'Erreur lors du chargement des biens');
        } finally {
            setLoading(false);
        }
    };

    // Calculate stats
    const totalProperties = properties.length;
    const availableProperties = properties.filter(p => p.statut === 'DISPONIBLE').length;
    const inNegotiation = properties.filter(p => p.statut === 'EN_COURS').length;
    const soldRented = properties.filter(p => ['VENDU', 'LOUE'].includes(p.statut)).length;

    // Filter properties based on search
    const filteredProperties = properties.filter(property => {
        const query = searchQuery.toLowerCase();
        return (
            property.titre?.toLowerCase().includes(query) ||
            property.adresse?.toLowerCase().includes(query) ||
            property.type?.toLowerCase().includes(query)
        );
    });

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
                        isLoading={loadingDetails && !selectedProperty.detailAppartement} // Only show loading if we don't have details yet
                    />
                )}
                
                <header className="page-header">
                    <div>
                        <h1 className="page-title">Tous les Biens</h1>
                        <p className="page-subtitle">Gérez et suivez tous les biens immobiliers</p>
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

                    <div className="filter-dropdown">
                        <Filter size={18} />
                        <span>Type de bien</span>
                    </div>

                    <div className="filter-dropdown">
                        <Calendar size={18} />
                        <span>Date d'ajout</span>
                    </div>
                </div>

                <div className="stats-grid">
                    <div className="stat-card blue">
                        <div className="stat-value">{totalProperties}</div>
                        <div className="stat-label">Total Biens</div>
                    </div>
                    <div className="stat-card green">
                        <div className="stat-value">{availableProperties}</div>
                        <div className="stat-label">Disponibles</div>
                    </div>
                    <div className="stat-card orange">
                        <div className="stat-value">{inNegotiation}</div>
                        <div className="stat-label">En Négociation</div>
                    </div>
                    <div className="stat-card purple">
                        <div className="stat-value">{soldRented}</div>
                        <div className="stat-label">Vendus/Loués</div>
                    </div>
                </div>

                <div className="content-table-container">
                    {loading ? (
                        <div style={{ 
                            padding: '3rem', 
                            textAlign: 'center', 
                            color: 'rgba(255, 255, 255, 0.6)' 
                        }}>
                            Chargement des biens immobiliers...
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
                            color: 'rgba(255, 255, 255, 0.6)' 
                        }}>
                            {searchQuery 
                                ? `Aucun bien trouvé pour "${searchQuery}"`
                                : 'Aucun bien immobilier. Ajoutez-en un avec le wizard!'}
                        </div>
                    ) : (
                        <table className="glass-table">
                            <thead>
                                <tr>
                                    <th>Bien</th>
                                    <th>Type</th>
                                    <th>Prix</th>
                                    <th>Statut</th>
                                    <th>Date d'ajout</th>
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
                                        <td>{formatDate(property.dateCreation)}</td>
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
                    )}
                </div>
            </div>
        </PageTransition>
    );
};

export default AllProperties;

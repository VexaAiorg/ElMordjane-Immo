import React, { useState } from 'react';
import { X, MapPin, Home, DollarSign, FileText, Package, Eye, ChevronDown, ChevronUp, Lock, Globe } from 'lucide-react';
import { apiConfig } from '../../api/api';

const PropertyDetailsModal = ({ property, onClose, isLoading }) => {
    const [expandedSections, setExpandedSections] = useState({
        juridical: true,
        publicFiles: true,
        internalFiles: true
    });

    if (!property && !isLoading) return null;

    const getFileUrl = (url) => {
        if (!url) return '#';
        if (url.startsWith('http')) return url;
        const cleanUrl = url.startsWith('/') ? url : `/${url}`;
        return `${apiConfig.baseUrl}${cleanUrl}`;
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
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const getPriorityLabel = (priorite) => {
        const labels = {
            'TRES_IMPORTANT': 'Très Important',
            'IMPORTANT': 'Important',
            'NORMAL': 'Normal',
        };
        return labels[priorite] || priorite;
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
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

    // Categorize documents
    const juridicalDocuments = property?.papiers || [];
    
    const publicFiles = {
        photos: property?.piecesJointes?.filter(pj => 
            pj.type === 'PHOTO' && pj.visibilite === 'PUBLIABLE' && !pj.categorie
        ) || [],
        documents: property?.piecesJointes?.filter(pj => 
            pj.type === 'DOCUMENT' && pj.visibilite === 'PUBLIABLE' && !pj.categorie
        ) || [],
        localisations: property?.piecesJointes?.filter(pj => 
            pj.type === 'LOCALISATION' && pj.visibilite === 'PUBLIABLE' && !pj.categorie
        ) || []
    };

    const internalFiles = {
        photos: property?.piecesJointes?.filter(pj => 
            pj.type === 'PHOTO' && pj.visibilite === 'INTERNE' && !pj.categorie
        ) || [],
        documents: property?.piecesJointes?.filter(pj => 
            pj.type === 'DOCUMENT' && pj.visibilite === 'INTERNE' && !pj.categorie
        ) || [],
        localisations: property?.piecesJointes?.filter(pj => 
            pj.type === 'LOCALISATION' && pj.visibilite === 'INTERNE' && !pj.categorie
        ) || []
    };

    const hasPublicFiles = publicFiles.photos.length > 0 || publicFiles.documents.length > 0 || publicFiles.localisations.length > 0;
    const hasInternalFiles = internalFiles.photos.length > 0 || internalFiles.documents.length > 0 || internalFiles.localisations.length > 0;

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
                            <div>
                                <h2>{property.titre}</h2>
                                {property?.createdBy && (
                                    <p style={{ 
                                        margin: '0.5rem 0 0 0', 
                                        fontSize: '0.85rem', 
                                        color: '#94a3b8',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <span style={{ opacity: 0.7 }}>Créé par:</span>
                                        <span style={{ color: '#60a5fa', fontWeight: '500' }}>
                                            {property.createdBy.prenom} {property.createdBy.nom}
                                        </span>
                                    </p>
                                )}
                            </div>
                            <span className={`status-badge ${property.statut === 'DISPONIBLE' ? 'available' : 'pending'}`}>
                                {property.statut}
                            </span>
                        </div>

                        <div className="modal-body">
                            {/* Informations Générales */}
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

                            {/* Property Specific Details */}
                            {renderSpecificDetails()}

                            {/* Localisation */}
                            <div className="modal-section">
                                <h3><MapPin size={18} /> Localisation</h3>
                                <p className="address-text">{property.adresse}</p>
                            </div>

                            {/* Description */}
                            {property.description && (
                                <div className="modal-section">
                                    <h3><FileText size={18} /> Description</h3>
                                    <p className="description-text">{property.description}</p>
                                </div>
                            )}

                            {/* Propriétaire */}
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

                            {/* Suivi & Mandat */}
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
                                            <span className="value">{getPriorityLabel(property.suivi.priorite)}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="label">Mandat ?</span>
                                            <span className="value">{property.suivi.aMandat ? 'Oui' : 'Non'}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Documents Juridiques */}
                            {juridicalDocuments.length > 0 && (
                                <div className="modal-section">
                                    <div 
                                        style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'space-between',
                                            cursor: 'pointer',
                                            marginBottom: expandedSections.juridical ? '1rem' : '0'
                                        }}
                                        onClick={() => toggleSection('juridical')}
                                    >
                                        <h3 style={{ margin: 0 }}>
                                            <FileText size={18} /> Documents Juridiques ({juridicalDocuments.length})
                                        </h3>
                                        {expandedSections.juridical ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </div>
                                    
                                    {expandedSections.juridical && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {juridicalDocuments.map((papier, index) => {
                                                const matchingAttachment = property.piecesJointes?.find(pj => 
                                                    pj.type === 'DOCUMENT' && pj.categorie === papier.nom
                                                );

                                                const cardStyle = {
                                                    background: 'rgba(0, 0, 0, 0.2)',
                                                    padding: '1rem 1.25rem',
                                                    borderRadius: '10px',
                                                    border: `1px solid ${papier.statut === 'DISPONIBLE' ? 'rgba(52, 211, 153, 0.3)' : 'rgba(248, 113, 113, 0.3)'}`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    gap: '1rem',
                                                    textDecoration: 'none',
                                                    transition: 'all 0.2s'
                                                };

                                                const CardContent = () => (
                                                    <>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ 
                                                                display: 'flex', 
                                                                alignItems: 'center', 
                                                                gap: '0.75rem',
                                                                marginBottom: '0.5rem'
                                                            }}>
                                                                <FileText size={20} style={{ 
                                                                    color: papier.statut === 'DISPONIBLE' ? '#34d399' : '#f87171' 
                                                                }} />
                                                                <span style={{ 
                                                                    color: 'white', 
                                                                    fontWeight: '600',
                                                                    fontSize: '1rem'
                                                                }}>
                                                                    {papier.nom}
                                                                </span>
                                                            </div>
                                                            {matchingAttachment && (
                                                                <div style={{ 
                                                                    fontSize: '0.85rem', 
                                                                    color: '#94a3b8',
                                                                    marginLeft: '2rem'
                                                                }}>
                                                                    📎 Fichier: <span style={{ color: '#cbd5e1' }}>{matchingAttachment.nom || 'Document attaché'}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div style={{ 
                                                            display: 'flex', 
                                                            alignItems: 'center', 
                                                            gap: '1rem' 
                                                        }}>
                                                            <span style={{
                                                                padding: '0.4rem 0.9rem',
                                                                borderRadius: '20px',
                                                                fontSize: '0.8rem',
                                                                fontWeight: '600',
                                                                background: papier.statut === 'DISPONIBLE' 
                                                                    ? 'rgba(16, 185, 129, 0.2)' 
                                                                    : papier.statut === 'EN_COURS'
                                                                    ? 'rgba(251, 191, 36, 0.2)'
                                                                    : 'rgba(239, 68, 68, 0.2)',
                                                                color: papier.statut === 'DISPONIBLE' 
                                                                    ? '#34d399' 
                                                                    : papier.statut === 'EN_COURS'
                                                                    ? '#fbbf24'
                                                                    : '#f87171'
                                                            }}>
                                                                {papier.statut}
                                                            </span>
                                                            {matchingAttachment && (
                                                                <div style={{
                                                                    padding: '0.4rem 0.8rem',
                                                                    background: 'rgba(59, 130, 246, 0.15)',
                                                                    borderRadius: '6px',
                                                                    fontSize: '0.8rem',
                                                                    color: '#3b82f6',
                                                                    fontWeight: '500'
                                                                }}>
                                                                    Ouvrir
                                                                </div>
                                                            )}
                                                        </div>
                                                    </>
                                                );

                                                return matchingAttachment ? (
                                                    <a
                                                        key={index}
                                                        href={getFileUrl(matchingAttachment.url)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={cardStyle}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)';
                                                            e.currentTarget.style.borderColor = papier.statut === 'DISPONIBLE' 
                                                                ? 'rgba(52, 211, 153, 0.5)' 
                                                                : 'rgba(248, 113, 113, 0.5)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.2)';
                                                            e.currentTarget.style.borderColor = papier.statut === 'DISPONIBLE' 
                                                                ? 'rgba(52, 211, 153, 0.3)' 
                                                                : 'rgba(248, 113, 113, 0.3)';
                                                        }}
                                                    >
                                                        <CardContent />
                                                    </a>
                                                ) : (
                                                    <div key={index} style={cardStyle}>
                                                        <CardContent />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Fichiers du Bien (Publiables) */}
                            {hasPublicFiles && (
                                <div className="modal-section">
                                    <div 
                                        style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'space-between',
                                            cursor: 'pointer',
                                            marginBottom: expandedSections.publicFiles ? '1rem' : '0'
                                        }}
                                        onClick={() => toggleSection('publicFiles')}
                                    >
                                        <h3 style={{ margin: 0 }}>
                                            <Globe size={18} /> Fichiers du Bien (Publiables)
                                        </h3>
                                        {expandedSections.publicFiles ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </div>
                                    
                                    {expandedSections.publicFiles && (
                                        <>
                                            {/* Photos Publiables */}
                                            {publicFiles.photos.length > 0 && (
                                                <div style={{ marginBottom: '1.5rem' }}>
                                                    <h4 style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                                                        Photos ({publicFiles.photos.length})
                                                    </h4>
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem' }}>
                                                        {publicFiles.photos.map((pj, index) => (
                                                            <a 
                                                                key={index} 
                                                                href={getFileUrl(pj.url)} 
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
                                                                    src={getFileUrl(pj.url)} 
                                                                    alt={pj.nom || 'Photo'} 
                                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                />
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Documents Publiables */}
                                            {publicFiles.documents.length > 0 && (
                                                <div style={{ marginBottom: '1.5rem' }}>
                                                    <h4 style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                                                        Documents ({publicFiles.documents.length})
                                                    </h4>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                        {publicFiles.documents.map((pj, index) => (
                                                            <a 
                                                                key={index} 
                                                                href={getFileUrl(pj.url)} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'space-between',
                                                                    gap: '1rem',
                                                                    padding: '1rem 1.25rem',
                                                                    background: 'rgba(255,255,255,0.05)',
                                                                    borderRadius: '10px',
                                                                    textDecoration: 'none',
                                                                    color: 'white',
                                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                                    transition: 'all 0.2s'
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                                                                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                                                                }}
                                                            >
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                                                                    <div style={{
                                                                        width: '40px',
                                                                        height: '40px',
                                                                        borderRadius: '8px',
                                                                        background: 'rgba(59, 130, 246, 0.2)',
                                                                        border: '1px solid rgba(59, 130, 246, 0.3)',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center'
                                                                    }}>
                                                                        <FileText size={20} style={{ color: '#3b82f6' }} />
                                                                    </div>
                                                                    <div style={{ flex: 1 }}>
                                                                        <div style={{ 
                                                                            fontWeight: '500',
                                                                            fontSize: '0.95rem',
                                                                            marginBottom: '0.25rem'
                                                                        }}>
                                                                            {pj.nom || 'Document'}
                                                                        </div>
                                                                        <div style={{ 
                                                                            fontSize: '0.8rem',
                                                                            color: '#94a3b8'
                                                                        }}>
                                                                            🌐 Public
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div style={{
                                                                    padding: '0.4rem 0.8rem',
                                                                    background: 'rgba(59, 130, 246, 0.15)',
                                                                    borderRadius: '6px',
                                                                    fontSize: '0.8rem',
                                                                    color: '#3b82f6',
                                                                    fontWeight: '500'
                                                                }}>
                                                                    Ouvrir
                                                                </div>
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Localisations Publiables */}
                                            {publicFiles.localisations.length > 0 && (
                                                <div>
                                                    <h4 style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                                                        Localisations ({publicFiles.localisations.length})
                                                    </h4>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                        {publicFiles.localisations.map((pj, index) => (
                                                            <a 
                                                                key={index} 
                                                                href={pj.url} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '0.75rem',
                                                                    padding: '1rem 1.25rem',
                                                                    background: 'rgba(255,255,255,0.05)',
                                                                    borderRadius: '10px',
                                                                    textDecoration: 'none',
                                                                    color: 'white',
                                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                                    transition: 'all 0.2s'
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                                                }}
                                                            >
                                                                <MapPin size={20} style={{ color: '#10b981' }} />
                                                                <span>{pj.nom || 'Localisation'}</span>
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Pièces Jointes Internes */}
                            {hasInternalFiles && (
                                <div className="modal-section">
                                    <div 
                                        style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'space-between',
                                            cursor: 'pointer',
                                            marginBottom: expandedSections.internalFiles ? '1rem' : '0'
                                        }}
                                        onClick={() => toggleSection('internalFiles')}
                                    >
                                        <h3 style={{ margin: 0 }}>
                                            <Lock size={18} /> Pièces Jointes Internes
                                        </h3>
                                        {expandedSections.internalFiles ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </div>
                                    
                                    {expandedSections.internalFiles && (
                                        <>
                                            {/* Photos Internes */}
                                            {internalFiles.photos.length > 0 && (
                                                <div style={{ marginBottom: '1.5rem' }}>
                                                    <h4 style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                                                        Photos Internes ({internalFiles.photos.length})
                                                    </h4>
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem' }}>
                                                        {internalFiles.photos.map((pj, index) => (
                                                            <a 
                                                                key={index} 
                                                                href={getFileUrl(pj.url)} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                style={{
                                                                    position: 'relative',
                                                                    aspectRatio: '1',
                                                                    borderRadius: '8px',
                                                                    overflow: 'hidden',
                                                                    border: '1px solid rgba(239, 68, 68, 0.3)'
                                                                }}
                                                            >
                                                                <img 
                                                                    src={getFileUrl(pj.url)} 
                                                                    alt={pj.nom || 'Photo interne'} 
                                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                />
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Documents Internes */}
                                            {internalFiles.documents.length > 0 && (
                                                <div style={{ marginBottom: '1.5rem' }}>
                                                    <h4 style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                                                        Documents Internes ({internalFiles.documents.length})
                                                    </h4>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                        {internalFiles.documents.map((pj, index) => (
                                                            <a 
                                                                key={index} 
                                                                href={getFileUrl(pj.url)} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'space-between',
                                                                    gap: '1rem',
                                                                    padding: '1rem 1.25rem',
                                                                    background: 'rgba(239, 68, 68, 0.1)',
                                                                    borderRadius: '10px',
                                                                    textDecoration: 'none',
                                                                    color: 'white',
                                                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                                                    transition: 'all 0.2s'
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                                                                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                                                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
                                                                }}
                                                            >
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                                                                    <div style={{
                                                                        width: '40px',
                                                                        height: '40px',
                                                                        borderRadius: '8px',
                                                                        background: 'rgba(239, 68, 68, 0.2)',
                                                                        border: '1px solid rgba(239, 68, 68, 0.3)',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center'
                                                                    }}>
                                                                        <FileText size={20} style={{ color: '#ef4444' }} />
                                                                    </div>
                                                                    <div style={{ flex: 1 }}>
                                                                        <div style={{ 
                                                                            fontWeight: '500',
                                                                            fontSize: '0.95rem',
                                                                            marginBottom: '0.25rem'
                                                                        }}>
                                                                            {pj.nom || 'Document interne'}
                                                                        </div>
                                                                        <div style={{ 
                                                                            fontSize: '0.8rem',
                                                                            color: '#94a3b8'
                                                                        }}>
                                                                            🔒 Interne
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div style={{
                                                                    padding: '0.4rem 0.8rem',
                                                                    background: 'rgba(239, 68, 68, 0.15)',
                                                                    borderRadius: '6px',
                                                                    fontSize: '0.8rem',
                                                                    color: '#ef4444',
                                                                    fontWeight: '500'
                                                                }}>
                                                                    Ouvrir
                                                                </div>
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Localisations Internes */}
                                            {internalFiles.localisations.length > 0 && (
                                                <div>
                                                    <h4 style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                                                        Localisations Internes ({internalFiles.localisations.length})
                                                    </h4>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                        {internalFiles.localisations.map((pj, index) => (
                                                            <a 
                                                                key={index} 
                                                                href={pj.url} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '0.75rem',
                                                                    padding: '1rem 1.25rem',
                                                                    background: 'rgba(239, 68, 68, 0.1)',
                                                                    borderRadius: '10px',
                                                                    textDecoration: 'none',
                                                                    color: 'white',
                                                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                                                    transition: 'all 0.2s'
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                                                }}
                                                            >
                                                                <MapPin size={20} style={{ color: '#ef4444' }} />
                                                                <span>{pj.nom || 'Localisation interne'}</span>
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default PropertyDetailsModal;

import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, Eye, Edit, Trash2, X, MapPin, Home, DollarSign, FileText, Package, Image, ChevronDown } from 'lucide-react';
import PageTransition from '../../components/PageTransition';
import { getAllProperties, getPropertyById, deleteProperty, updateProperty, apiConfig } from '../../api/api';

const PropertyDetailsModal = ({ property, onClose, isLoading }) => {
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
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {property.papiers.map((papier, index) => {
                                            // Find matching attachment using categorie field
                                            const matchingAttachment = property.piecesJointes?.find(pj => 
                                                pj.type === 'DOCUMENT' && pj.categorie === papier.nom
                                            );

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
                                                                : 'rgba(239, 68, 68, 0.2)',
                                                            color: papier.statut === 'DISPONIBLE' ? '#34d399' : '#f87171'
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

                                    {/* Documents */}
                                    {(() => {
                                        // Filter out documents that have a categorie (juridical documents)
                                        const otherDocuments = property.piecesJointes.filter(pj => 
                                            pj.type === 'DOCUMENT' && !pj.categorie
                                        );

                                        return otherDocuments.length > 0 && (
                                            <div>
                                                <h4 style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.75rem' }}>Autres Documents</h4>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                    {otherDocuments.map((pj, index) => (
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
                                                                        {pj.visibilite === 'PUBLIABLE' ? '🌐 Public' : '🔒 Interne'}
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
                                        );
                                    })()}
                                </div>
                            )}            </div>

                    </>
                )}
            </div>
        </div>
    );
};

const PropertyEditModal = ({ property, onClose, onUpdate, isLoading }) => {
    const [formData, setFormData] = useState({
        titre: property?.titre || '',
        description: property?.description || '',
        type: property?.type || 'APPARTEMENT',
        statut: property?.statut || 'DISPONIBLE',
        transaction: property?.transaction || 'VENTE',
        prixVente: property?.prixVente || '',
        prixLocation: property?.prixLocation || '',
        adresse: property?.adresse || '',
    });
    const [newPhotos, setNewPhotos] = useState([]);
    const [newDocuments, setNewDocuments] = useState([]);
    const [saving, setSaving] = useState(false);

    if (!property && !isLoading) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e, type) => {
        const files = Array.from(e.target.files);
        if (type === 'photos') {
            setNewPhotos(prev => [...prev, ...files]);
        } else {
            setNewDocuments(prev => [...prev, ...files]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const propertyData = {
                bienImmobilier: formData,
                proprietaire: {
                    id: property.proprietaire?.id,
                    nom: property.proprietaire?.nom,
                    prenom: property.proprietaire?.prenom,
                    telephone: property.proprietaire?.telephone,
                    email: property.proprietaire?.email,
                },
                piecesJointes: property.piecesJointes || [],
            };

            await updateProperty(property.id, propertyData, newDocuments, newPhotos);
            onUpdate();
            onClose();
        } catch (error) {
            console.error('Error updating property:', error);
            alert('Erreur lors de la mise à jour: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px' }}>
                <button className="modal-close" onClick={onClose}>
                    <X size={24} />
                </button>
                
                <div className="modal-header">
                    <h2>Modifier le Bien</h2>
                </div>

                <div className="modal-body">
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Titre</label>
                                <input
                                    type="text"
                                    name="titre"
                                    value={formData.titre}
                                    onChange={handleChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        color: 'white',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        color: 'white',
                                        fontSize: '1rem',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Type</label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '8px',
                                            color: 'white',
                                            fontSize: '1rem'
                                        }}
                                    >
                                        <option value="APPARTEMENT">Appartement</option>
                                        <option value="VILLA">Villa</option>
                                        <option value="TERRAIN">Terrain</option>
                                        <option value="LOCAL">Local</option>
                                        <option value="IMMEUBLE">Immeuble</option>
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Statut</label>
                                    <select
                                        name="statut"
                                        value={formData.statut}
                                        onChange={handleChange}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '8px',
                                            color: 'white',
                                            fontSize: '1rem'
                                        }}
                                    >
                                        <option value="DISPONIBLE">Disponible</option>
                                        <option value="EN_COURS">En cours</option>
                                        <option value="VENDU">Vendu</option>
                                        <option value="LOUE">Loué</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Transaction</label>
                                    <select
                                        name="transaction"
                                        value={formData.transaction}
                                        onChange={handleChange}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '8px',
                                            color: 'white',
                                            fontSize: '1rem'
                                        }}
                                    >
                                        <option value="VENTE">Vente</option>
                                        <option value="LOCATION">Location</option>
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Prix Vente (DA)</label>
                                    <input
                                        type="number"
                                        name="prixVente"
                                        value={formData.prixVente}
                                        onChange={handleChange}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '8px',
                                            color: 'white',
                                            fontSize: '1rem'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Prix Location (DA)</label>
                                    <input
                                        type="number"
                                        name="prixLocation"
                                        value={formData.prixLocation}
                                        onChange={handleChange}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '8px',
                                            color: 'white',
                                            fontSize: '1rem'
                                        }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Adresse</label>
                                <input
                                    type="text"
                                    name="adresse"
                                    value={formData.adresse}
                                    onChange={handleChange}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        color: 'white',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Ajouter Photos</label>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, 'photos')}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        color: 'white',
                                        fontSize: '1rem'
                                    }}
                                />
                                {newPhotos.length > 0 && (
                                    <p style={{ marginTop: '0.5rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                                        {newPhotos.length} photo(s) sélectionnée(s)
                                    </p>
                                )}
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Ajouter Documents</label>
                                <input
                                    type="file"
                                    multiple
                                    accept=".pdf,.doc,.docx"
                                    onChange={(e) => handleFileChange(e, 'documents')}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        color: 'white',
                                        fontSize: '1rem'
                                    }}
                                />
                                {newDocuments.length > 0 && (
                                    <p style={{ marginTop: '0.5rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                                        {newDocuments.length} document(s) sélectionné(s)
                                    </p>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontSize: '1rem'
                                    }}
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        background: saving ? 'rgba(59, 130, 246, 0.5)' : 'rgba(59, 130, 246, 0.8)',
                                        border: '1px solid rgba(59, 130, 246, 0.3)',
                                        borderRadius: '8px',
                                        color: 'white',
                                        cursor: saving ? 'not-allowed' : 'pointer',
                                        fontSize: '1rem'
                                    }}
                                >
                                    {saving ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
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
    const [filterType, setFilterType] = useState('ALL');
    const [sortDate, setSortDate] = useState('NEWEST');
    const [showTypeDropdown, setShowTypeDropdown] = useState(false);
    const [showDateDropdown, setShowDateDropdown] = useState(false);
    const [editingProperty, setEditingProperty] = useState(null);

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
    // Filter properties based on search and type, then sort by date
    const filteredProperties = properties.filter(property => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = (
            property.titre?.toLowerCase().includes(query) ||
            property.adresse?.toLowerCase().includes(query) ||
            property.type?.toLowerCase().includes(query)
        );
        
        const matchesType = filterType === 'ALL' || property.type === filterType;
        
        return matchesSearch && matchesType;
    }).sort((a, b) => {
        const dateA = new Date(a.dateCreation).getTime();
        const dateB = new Date(b.dateCreation).getTime();
        
        if (sortDate === 'NEWEST') return dateB - dateA;
        if (sortDate === 'OLDEST') return dateA - dateB;
        return 0;
    });

    const handleDeleteProperty = async (propertyId) => {
        console.log('handleDeleteProperty called with ID:', propertyId);
        
        if (!propertyId) {
            console.error('Error: propertyId is undefined or null');
            alert('Erreur: ID du bien introuvable');
            return;
        }

        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce bien ? Cette action est irréversible.')) {
            try {
                console.log('Sending delete request...');
                await deleteProperty(propertyId);
                console.log('Delete request successful');
                // Refresh properties list
                fetchProperties();
            } catch (err) {
                console.error('Error deleting property:', err);
                alert('Erreur lors de la suppression du bien: ' + err.message);
            }
        } else {
            console.log('Delete cancelled by user');
        }
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

    const handleEditProperty = async (property) => {
        setEditingProperty(property);
        setLoadingDetails(true);
        
        try {
            const response = await getPropertyById(property.id);
            if (response.data) {
                setEditingProperty(response.data);
            }
        } catch (err) {
            console.error('Error fetching property details:', err);
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleCloseEditModal = () => {
        setEditingProperty(null);
        setLoadingDetails(false);
    };

    const handleUpdateSuccess = () => {
        fetchProperties();
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
                
                {editingProperty && (
                    <PropertyEditModal 
                        property={editingProperty} 
                        onClose={handleCloseEditModal}
                        onUpdate={handleUpdateSuccess}
                        isLoading={loadingDetails && !editingProperty.detailAppartement}
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
                    )}
                </div>
            </div>
        </PageTransition>
    );
};

export default AllProperties;

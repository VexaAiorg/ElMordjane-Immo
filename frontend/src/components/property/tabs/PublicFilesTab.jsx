import React from 'react';
import { Image, FileText, MapPin, Trash2, Upload, Globe } from 'lucide-react';
import { apiConfig } from '../../../api/api';

const PublicFilesTab = ({ piecesJointes, newFiles, onFileAdd, onFileDelete }) => {
    const getFileUrl = (url) => {
        if (!url) return '#';
        if (url.startsWith('http')) return url;
        const cleanUrl = url.startsWith('/') ? url : `/${url}`;
        return `${apiConfig.baseUrl}${cleanUrl}`;
    };

    const handleFileUpload = (e, fileType) => {
        const files = Array.from(e.target.files);
        const filesWithMetadata = files.map(file => ({
            file,
            type: fileType,
            visibilite: 'PUBLIABLE',
            categorie: null
        }));
        onFileAdd(filesWithMetadata, fileType === 'PHOTO' ? 'Photos' : fileType === 'DOCUMENT' ? 'Documents' : 'Localisations');
    };

    const photos = piecesJointes.filter(pj => pj.type === 'PHOTO');
    const documents = piecesJointes.filter(pj => pj.type === 'DOCUMENT');
    const localisations = piecesJointes.filter(pj => pj.type === 'LOCALISATION');

    const uploadZoneStyle = {
        padding: '3rem 2rem',
        border: '2px dashed rgba(59, 130, 246, 0.4)',
        borderRadius: '12px',
        background: 'rgba(59, 130, 246, 0.05)',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem'
    };

    return (
        <div style={{ display: 'grid', gap: '2rem' }}>
            <div style={{
                padding: '1rem',
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: '8px',
                color: '#cbd5e1',
                fontSize: '0.9rem'
            }}>
                <strong><Globe size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />Fichiers Publics</strong>
                <p style={{ margin: '0.5rem 0 0 0', color: '#94a3b8' }}>
                    Ces fichiers seront visibles publiquement sur le site web. Ajoutez des photos, documents et localisations pour présenter le bien.
                </p>
            </div>

            {/* Photos Section */}
            <div>
                <h3 style={{ color: '#cbd5e1', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Image size={20} /> Photos ({photos.length})
                </h3>

                {photos.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                        {photos.map((photo) => (
                            <div
                                key={photo.id}
                                style={{
                                    position: 'relative',
                                    aspectRatio: '1',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    border: '1px solid rgba(59, 130, 246, 0.3)'
                                }}
                            >
                                <img
                                    src={getFileUrl(photo.url)}
                                    alt={photo.nom || 'Photo'}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                <button
                                    onClick={() => {
                                        if (window.confirm('Supprimer cette photo ?')) {
                                            onFileDelete(photo.id);
                                        }
                                    }}
                                    style={{
                                        position: 'absolute',
                                        top: '0.5rem',
                                        right: '0.5rem',
                                        padding: '0.4rem',
                                        background: 'rgba(239, 68, 68, 0.9)',
                                        border: 'none',
                                        borderRadius: '4px',
                                        color: 'white',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <label
                    style={uploadZoneStyle}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                        e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)';
                        e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                    }}
                >
                    <Upload size={48} style={{ color: '#3b82f6' }} />
                    <p style={{ color: '#3b82f6', fontWeight: '600', margin: 0, fontSize: '1rem' }}>
                        Ajouter des photos
                    </p>
                    <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
                        JPG, PNG (max 10MB)
                    </p>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleFileUpload(e, 'PHOTO')}
                        style={{ display: 'none' }}
                    />
                </label>

                {newFiles.publicPhotos && newFiles.publicPhotos.length > 0 && (
                    <div style={{ marginTop: '1rem' }}>
                        {newFiles.publicPhotos.map((nf, idx) => (
                            <div
                                key={idx}
                                style={{
                                    padding: '0.5rem',
                                    background: 'rgba(34, 197, 94, 0.1)',
                                    borderRadius: '4px',
                                    color: '#22c55e',
                                    fontSize: '0.85rem',
                                    marginBottom: '0.5rem'
                                }}
                            >
                                ✓ Nouveau: {nf.file.name}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Documents Section */}
            <div>
                <h3 style={{ color: '#cbd5e1', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={20} /> Documents ({documents.length})
                </h3>

                {documents.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                        {documents.map((doc) => (
                            <div
                                key={doc.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '1rem',
                                    background: 'rgba(59, 130, 246, 0.1)',
                                    border: '1px solid rgba(59, 130, 246, 0.2)',
                                    borderRadius: '8px'
                                }}
                            >
                                <a
                                    href={getFileUrl(doc.url)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        color: '#3b82f6',
                                        textDecoration: 'none',
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <FileText size={18} />
                                    {doc.nom || 'Document'}
                                </a>
                                <button
                                    onClick={() => {
                                        if (window.confirm('Supprimer ce document ?')) {
                                            onFileDelete(doc.id);
                                        }
                                    }}
                                    style={{
                                        padding: '0.4rem 0.6rem',
                                        background: 'rgba(239, 68, 68, 0.2)',
                                        border: '1px solid rgba(239, 68, 68, 0.3)',
                                        borderRadius: '4px',
                                        color: '#ef4444',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <label
                    style={uploadZoneStyle}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                        e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)';
                        e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                    }}
                >
                    <Upload size={48} style={{ color: '#3b82f6' }} />
                    <p style={{ color: '#3b82f6', fontWeight: '600', margin: 0, fontSize: '1rem' }}>
                        Ajouter des documents
                    </p>
                    <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
                        PDF, DOC, DOCX (max 10MB)
                    </p>
                    <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        multiple
                        onChange={(e) => handleFileUpload(e, 'DOCUMENT')}
                        style={{ display: 'none' }}
                    />
                </label>

                {newFiles.publicDocuments && newFiles.publicDocuments.length > 0 && (
                    <div style={{ marginTop: '1rem' }}>
                        {newFiles.publicDocuments.map((nf, idx) => (
                            <div
                                key={idx}
                                style={{
                                    padding: '0.5rem',
                                    background: 'rgba(34, 197, 94, 0.1)',
                                    borderRadius: '4px',
                                    color: '#22c55e',
                                    fontSize: '0.85rem',
                                    marginBottom: '0.5rem'
                                }}
                            >
                                ✓ Nouveau: {nf.file.name}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Localisations Section */}
            <div>
                <h3 style={{ color: '#cbd5e1', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={20} /> Localisations ({localisations.length})
                </h3>

                {localisations.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                        {localisations.map((loc) => (
                            <div
                                key={loc.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '1rem',
                                    background: 'rgba(59, 130, 246, 0.1)',
                                    border: '1px solid rgba(59, 130, 246, 0.2)',
                                    borderRadius: '8px'
                                }}
                            >
                                <a
                                    href={loc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        color: '#3b82f6',
                                        textDecoration: 'none',
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <MapPin size={18} />
                                    {loc.nom || 'Localisation'}
                                </a>
                                <button
                                    onClick={() => {
                                        if (window.confirm('Supprimer cette localisation ?')) {
                                            onFileDelete(loc.id);
                                        }
                                    }}
                                    style={{
                                        padding: '0.4rem 0.6rem',
                                        background: 'rgba(239, 68, 68, 0.2)',
                                        border: '1px solid rgba(239, 68, 68, 0.3)',
                                        borderRadius: '4px',
                                        color: '#ef4444',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <p style={{ color: '#64748b', fontSize: '0.85rem', fontStyle: 'italic' }}>
                    Les localisations sont gérées via le formulaire de création. Utilisez l'onglet "Informations de Base" pour modifier l'adresse.
                </p>
            </div>
        </div>
    );
};

export default PublicFilesTab;

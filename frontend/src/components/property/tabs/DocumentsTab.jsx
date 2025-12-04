import React from 'react';
import { FileText, Trash2, Upload } from 'lucide-react';
import { apiConfig } from '../../../api/api';

const DocumentsTab = ({ papiers, piecesJointes, newFiles, onPapierChange, onFileAdd, onFileDelete }) => {
    const [showAddForm, setShowAddForm] = React.useState(false);
    const [newPapier, setNewPapier] = React.useState({ nom: '', statut: 'MANQUANT' });

    const handleStatusChange = (papierId, newStatus) => {
        const updatedPapiers = papiers.map(p =>
            p.id === papierId ? { ...p, statut: newStatus } : p
        );
        onPapierChange(updatedPapiers);
    };

    const handleAddPapier = () => {
        if (!newPapier.nom.trim()) {
            alert('Veuillez entrer un nom pour le document');
            return;
        }

        const papierToAdd = {
            id: `temp-${Date.now()}`, // Temporary ID for new papiers
            nom: newPapier.nom.trim(),
            statut: newPapier.statut,
            bienId: null // Will be set when saving
        };

        onPapierChange([...papiers, papierToAdd]);
        setNewPapier({ nom: '', statut: 'MANQUANT' });
        setShowAddForm(false);
    };

    const handleDeletePapier = (papierId) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce document juridique ?')) {
            const updatedPapiers = papiers.filter(p => p.id !== papierId);
            onPapierChange(updatedPapiers);
        }
    };

    const handleFileUpload = (e, papierNom) => {
        const files = Array.from(e.target.files);
        const filesWithCategory = files.map(file => ({
            file,
            categorie: papierNom,
            type: 'DOCUMENT',
            visibilite: 'INTERNE'
        }));
        onFileAdd(filesWithCategory);
    };

    const getFileUrl = (url) => {
        if (!url) return '#';
        if (url.startsWith('http')) return url;
        const cleanUrl = url.startsWith('/') ? url : `/${url}`;
        return `${apiConfig.baseUrl}${cleanUrl}`;
    };

    return (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div style={{
                padding: '1rem',
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: '8px',
                color: '#cbd5e1',
                fontSize: '0.9rem'
            }}>
                <strong>ℹ️ Documents Juridiques</strong>
                <p style={{ margin: '0.5rem 0 0 0', color: '#94a3b8' }}>
                    Gérez les documents juridiques requis pour ce bien. Vous pouvez mettre à jour le statut de chaque document et associer des fichiers.
                </p>
            </div>

            {/* Add New Document Button and Form */}
            <div>
                {!showAddForm ? (
                    <button
                        onClick={() => setShowAddForm(true)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.25rem',
                            background: 'rgba(34, 197, 94, 0.2)',
                            border: '1px solid rgba(34, 197, 94, 0.3)',
                            borderRadius: '8px',
                            color: '#22c55e',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            transition: 'all 0.2s',
                            width: '100%',
                            justifyContent: 'center'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(34, 197, 94, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(34, 197, 94, 0.2)';
                        }}
                    >
                        <FileText size={18} />
                        Ajouter un nouveau document juridique
                    </button>
                ) : (
                    <div style={{
                        padding: '1.25rem',
                        background: 'rgba(34, 197, 94, 0.1)',
                        border: '1px solid rgba(34, 197, 94, 0.2)',
                        borderRadius: '8px'
                    }}>
                        <h4 style={{ color: '#22c55e', marginBottom: '1rem', fontSize: '1rem' }}>
                            Nouveau Document Juridique
                        </h4>
                        
                        <div style={{ display: 'grid', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>
                                    Nom du document *
                                </label>
                                <input
                                    type="text"
                                    value={newPapier.nom}
                                    onChange={(e) => setNewPapier({ ...newPapier, nom: e.target.value })}
                                    placeholder="Ex: Acte de propriété, Livret foncier..."
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: 'rgba(0,0,0,0.3)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '6px',
                                        color: 'white',
                                        fontSize: '0.9rem'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>
                                    Statut initial
                                </label>
                                <select
                                    value={newPapier.statut}
                                    onChange={(e) => setNewPapier({ ...newPapier, statut: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: 'rgba(0,0,0,0.3)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '6px',
                                        color: 'white',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    <option value="MANQUANT">Manquant</option>
                                    <option value="EN_COURS">En cours</option>
                                    <option value="DISPONIBLE">Disponible</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => {
                                    setShowAddForm(false);
                                    setNewPapier({ nom: '', statut: 'MANQUANT' });
                                }}
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: 'rgba(255,255,255,0.1)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '6px',
                                    color: '#94a3b8',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem'
                                }}
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleAddPapier}
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: 'rgba(34, 197, 94, 0.8)',
                                    border: '1px solid rgba(34, 197, 94, 0.3)',
                                    borderRadius: '6px',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    fontWeight: '600'
                                }}
                            >
                                Ajouter
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {papiers && papiers.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {papiers.map((papier) => {
                        const matchingAttachment = piecesJointes?.find(pj =>
                            pj.type === 'DOCUMENT' && pj.categorie === papier.nom
                        );

                        return (
                            <div
                                key={papier.id}
                                style={{
                                    background: 'rgba(0, 0, 0, 0.2)',
                                    padding: '1.25rem',
                                    borderRadius: '10px',
                                    border: `1px solid ${papier.statut === 'DISPONIBLE' ? 'rgba(52, 211, 153, 0.3)' : 'rgba(248, 113, 113, 0.3)'}`,
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: '1rem'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <select
                                            value={papier.statut}
                                            onChange={(e) => handleStatusChange(papier.id, e.target.value)}
                                            style={{
                                                padding: '0.5rem 0.75rem',
                                                borderRadius: '6px',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                background: papier.statut === 'DISPONIBLE'
                                                    ? 'rgba(16, 185, 129, 0.2)'
                                                    : papier.statut === 'EN_COURS'
                                                    ? 'rgba(251, 191, 36, 0.2)'
                                                    : 'rgba(239, 68, 68, 0.2)',
                                                color: papier.statut === 'DISPONIBLE'
                                                    ? '#34d399'
                                                    : papier.statut === 'EN_COURS'
                                                    ? '#fbbf24'
                                                    : '#f87171',
                                                fontSize: '0.85rem',
                                                fontWeight: '600',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <option value="DISPONIBLE">Disponible</option>
                                            <option value="EN_COURS">En cours</option>
                                            <option value="MANQUANT">Manquant</option>
                                        </select>

                                        <button
                                            onClick={() => handleDeletePapier(papier.id)}
                                            style={{
                                                padding: '0.5rem',
                                                background: 'rgba(239, 68, 68, 0.2)',
                                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                                borderRadius: '6px',
                                                color: '#ef4444',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                                            }}
                                            title="Supprimer ce document"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Existing file */}
                                {matchingAttachment && (
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '0.75rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        borderRadius: '6px',
                                        marginBottom: '0.75rem'
                                    }}>
                                        <a
                                            href={getFileUrl(matchingAttachment.url)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                color: '#3b82f6',
                                                textDecoration: 'none',
                                                fontSize: '0.9rem',
                                                flex: 1
                                            }}
                                        >
                                            📎 {matchingAttachment.nom || 'Document attaché'}
                                        </a>
                                        <button
                                            onClick={() => {
                                                if (window.confirm('Supprimer ce fichier ?')) {
                                                    onFileDelete(matchingAttachment.id);
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
                                                alignItems: 'center',
                                                gap: '0.25rem'
                                            }}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                )}

                                {/* Upload new file */}
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.75rem',
                                    background: 'rgba(59, 130, 246, 0.1)',
                                    border: '1px dashed rgba(59, 130, 246, 0.3)',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    color: '#3b82f6',
                                    fontSize: '0.9rem',
                                    transition: 'all 0.2s'
                                }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                                    }}
                                >
                                    <Upload size={16} />
                                    <span>{matchingAttachment ? 'Remplacer le fichier' : 'Ajouter un fichier'}</span>
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                        onChange={(e) => handleFileUpload(e, papier.nom)}
                                        style={{ display: 'none' }}
                                    />
                                </label>

                                {/* Show newly selected files */}
                                {newFiles.filter(nf => nf.categorie === papier.nom).map((nf, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            marginTop: '0.5rem',
                                            padding: '0.5rem',
                                            background: 'rgba(34, 197, 94, 0.1)',
                                            borderRadius: '4px',
                                            color: '#22c55e',
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        ✓ Nouveau: {nf.file.name}
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div style={{
                    padding: '3rem',
                    textAlign: 'center',
                    color: '#64748b',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '8px'
                }}>
                    <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                    <p>Aucun document juridique défini pour ce bien</p>
                </div>
            )}
        </div>
    );
};

export default DocumentsTab;

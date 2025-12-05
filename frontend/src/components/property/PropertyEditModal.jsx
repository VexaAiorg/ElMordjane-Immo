import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import BasicInfoTab from './tabs/BasicInfoTab';
import OwnerInfoTab from './tabs/OwnerInfoTab';
import PropertyDetailsTab from './tabs/PropertyDetailsTab';
import DocumentsTab from './tabs/DocumentsTab';
import TrackingTab from './tabs/TrackingTab';
import PublicFilesTab from './tabs/PublicFilesTab';
import InternalFilesTab from './tabs/InternalFilesTab';
import { updateProperty } from '../../api/api';

const PropertyEditModal = ({ property, onClose, onUpdate, isLoading }) => {
    const [activeTab, setActiveTab] = useState('basic');
    const [saving, setSaving] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    
    // Form data state
    const [formData, setFormData] = useState({
        bienImmobilier: {
            titre: property?.titre || '',
            description: property?.description || '',
            type: property?.type || 'APPARTEMENT',
            statut: property?.statut || 'DISPONIBLE',
            transaction: property?.transaction || 'VENTE',
            prixVente: property?.prixVente || '',
            prixLocation: property?.prixLocation || '',
            adresse: property?.adresse || '',
        },
        proprietaire: {
            id: property?.proprietaire?.id || null,
            nom: property?.proprietaire?.nom || '',
            prenom: property?.proprietaire?.prenom || '',
            telephone: property?.proprietaire?.telephone || '',
            email: property?.proprietaire?.email || '',
            adresse: property?.proprietaire?.adresse || '',
            typeIdentite: property?.proprietaire?.typeIdentite || '',
            numIdentite: property?.proprietaire?.numIdentite || '',
            qualite: property?.proprietaire?.qualite || '',
            prixType: property?.proprietaire?.prixType || '',
            prixNature: property?.proprietaire?.prixNature || '',
            prixSource: property?.proprietaire?.prixSource || '',
            paiementVente: property?.proprietaire?.paiementVente || '',
            paiementLocation: property?.proprietaire?.paiementLocation || '',
        },
        propertyDetails: getInitialPropertyDetails(property),
        suivi: {
            estVisite: property?.suivi?.estVisite || false,
            priorite: property?.suivi?.priorite || 'NORMAL',
            aMandat: property?.suivi?.aMandat || false,
            urlGoogleSheet: property?.suivi?.urlGoogleSheet || '',
            urlGooglePhotos: property?.suivi?.urlGooglePhotos || '',
        },
        papiers: property?.papiers || [],
        piecesJointes: property?.piecesJointes || [],
    });

    // Files to delete
    const [filesToDelete, setFilesToDelete] = useState([]);
    
    // New files to upload
    const [newFiles, setNewFiles] = useState({
        juridical: [],
        publicPhotos: [],
        publicDocuments: [],
        publicLocalisations: [],
        internalPhotos: [],
        internalDocuments: [],
        internalLocalisations: [],
    });

    // Reload form data when property changes (e.g., when full data loads from API)
    React.useEffect(() => {
        if (property) {
            console.log('Loading property data:', property);
            console.log('Proprietaire data:', property.proprietaire);
            console.log('Detail Appartement:', property.detailAppartement);
            
            // Update all form data with fresh property data
            setFormData({
                bienImmobilier: {
                    titre: property?.titre || '',
                    description: property?.description || '',
                    type: property?.type || 'APPARTEMENT',
                    statut: property?.statut || 'DISPONIBLE',
                    transaction: property?.transaction || 'VENTE',
                    prixVente: property?.prixVente || '',
                    prixLocation: property?.prixLocation || '',
                    adresse: property?.adresse || '',
                },
                proprietaire: {
                    id: property?.proprietaire?.id || null,
                    nom: property?.proprietaire?.nom || '',
                    prenom: property?.proprietaire?.prenom || '',
                    telephone: property?.proprietaire?.telephone || '',
                    email: property?.proprietaire?.email || '',
                    adresse: property?.proprietaire?.adresse || '',
                    typeIdentite: property?.proprietaire?.typeIdentite || '',
                    numIdentite: property?.proprietaire?.numIdentite || '',
                    qualite: property?.proprietaire?.qualite || '',
                    prixType: property?.proprietaire?.prixType || '',
                    prixNature: property?.proprietaire?.prixNature || '',
                    prixSource: property?.proprietaire?.prixSource || '',
                    paiementVente: property?.proprietaire?.paiementVente || '',
                    paiementLocation: property?.proprietaire?.paiementLocation || '',
                },
                propertyDetails: getInitialPropertyDetails(property),
                suivi: {
                    estVisite: property?.suivi?.estVisite || false,
                    priorite: property?.suivi?.priorite || 'NORMAL',
                    aMandat: property?.suivi?.aMandat || false,
                    urlGoogleSheet: property?.suivi?.urlGoogleSheet || '',
                    urlGooglePhotos: property?.suivi?.urlGooglePhotos || '',
                },
                papiers: property?.papiers || [],
                piecesJointes: property?.piecesJointes || [],
            });
        }
    }, [property]); // Re-run when property changes

    if (!property && !isLoading) return null;

    function getInitialPropertyDetails(property) {
        if (!property) return {};
        
        const type = property.type;
        if (type === 'APPARTEMENT' && property.detailAppartement) {
            return { ...property.detailAppartement };
        } else if (type === 'VILLA' && property.detailVilla) {
            return { ...property.detailVilla };
        } else if (type === 'TERRAIN' && property.detailTerrain) {
            return { ...property.detailTerrain };
        } else if (type === 'LOCAL' && property.detailLocal) {
            return { ...property.detailLocal };
        } else if (type === 'IMMEUBLE' && property.detailImmeuble) {
            return { ...property.detailImmeuble };
        }
        return {};
    }

    const handleClose = () => {
        if (hasUnsavedChanges) {
            const confirmed = window.confirm(
                'Vous avez des modifications non enregistrées. Voulez-vous vraiment fermer ?'
            );
            if (!confirmed) return;
        }
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Confirmation before saving
        const confirmed = window.confirm(
            '⚠️ Êtes-vous sûr de vouloir enregistrer ces modifications ?\n\nCette action modifiera les informations du bien immobilier.'
        );
        
        if (!confirmed) {
            return; // User cancelled
        }
        
        setSaving(true);

        try {
            // Collect all new files first to generate metadata
            const allNewDocuments = [
                ...newFiles.juridical,
                ...newFiles.publicDocuments,
                ...newFiles.internalDocuments,
            ];

            const allNewPhotos = [
                ...newFiles.publicPhotos,
                ...newFiles.internalPhotos,
            ];

            // Generate metadata for new files to include in piecesJointes
            const newFilesMetadata = [
                ...allNewDocuments,
                ...allNewPhotos
            ].map(f => ({
                nom: f.file.name,
                type: f.type,
                visibilite: f.visibilite,
                categorie: f.categorie
            }));

            console.log('Files to delete:', filesToDelete);
            console.log('New files metadata:', newFilesMetadata);

            // Prepare data for backend
            const propertyData = {
                bienImmobilier: formData.bienImmobilier,
                proprietaire: formData.proprietaire,
                suivi: formData.suivi,
                papiers: formData.papiers.map(p => ({ 
                    id: p.id, 
                    statut: p.statut,
                    nom: p.nom
                })),
                piecesJointes: [
                    // Existing files (excluding deleted ones, as they are already filtered out of formData.piecesJointes)
                    ...formData.piecesJointes.map(pj => ({ 
                        id: pj.id, 
                        visibilite: pj.visibilite,
                        categorie: pj.categorie
                    })),
                    // New files metadata
                    ...newFilesMetadata
                ],
                filesToDelete: filesToDelete,
            };

            // Add property-specific details based on type
            const type = formData.bienImmobilier.type;
            
            console.log('Property Details before sending:', formData.propertyDetails);
            
            if (type === 'APPARTEMENT') {
                propertyData.detailAppartement = formData.propertyDetails;
            } else if (type === 'VILLA') {
                propertyData.detailVilla = formData.propertyDetails;
            } else if (type === 'TERRAIN') {
                propertyData.detailTerrain = formData.propertyDetails;
            } else if (type === 'LOCAL') {
                propertyData.detailLocal = formData.propertyDetails;
            } else if (type === 'IMMEUBLE') {
                propertyData.detailImmeuble = formData.propertyDetails;
            }

            console.log('Full payload being sent:', JSON.stringify(propertyData, null, 2));

            // Pass the actual File objects (not the wrapper objects)
            await updateProperty(
                property.id, 
                propertyData, 
                allNewDocuments.map(f => f.file), 
                allNewPhotos.map(f => f.file)
            );
            
            setHasUnsavedChanges(false);
            onUpdate();
            onClose();
        } catch (error) {
            console.error('Error updating property:', error);
            alert('Erreur lors de la mise à jour: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const tabs = [
        { id: 'basic', label: 'Informations de Base', icon: '📋' },
        { id: 'owner', label: 'Propriétaire', icon: '👤' },
        { id: 'details', label: 'Détails du Bien', icon: '🏠' },
        { id: 'documents', label: 'Documents Juridiques', icon: '📁' },
        { id: 'tracking', label: 'Suivi', icon: '📊' },
        { id: 'publicFiles', label: 'Fichiers Publics', icon: '🌐' },
        { id: 'internalFiles', label: 'Fichiers Internes', icon: '🔒' },
    ];

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div 
                className="modal-content" 
                onClick={e => e.stopPropagation()} 
                style={{ maxWidth: '900px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            >
                <button className="modal-close" onClick={handleClose}>
                    <X size={24} />
                </button>
                
                <div className="modal-header">
                    <h2>Modifier le Bien</h2>
                </div>

                {/* Enhanced Tab Navigation with Arrows */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem 2rem',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    flexShrink: 0,
                    background: 'rgba(30, 41, 59, 0.5)'
                }}>
                    {/* Previous Button */}
                    <button
                        type="button"
                        onClick={() => {
                            const currentIndex = tabs.findIndex(t => t.id === activeTab);
                            if (currentIndex > 0) {
                                setActiveTab(tabs[currentIndex - 1].id);
                            }
                        }}
                        disabled={tabs.findIndex(t => t.id === activeTab) === 0}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            background: 'transparent',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: tabs.findIndex(t => t.id === activeTab) === 0 ? '#64748b' : '#94a3b8',
                            cursor: tabs.findIndex(t => t.id === activeTab) === 0 ? 'not-allowed' : 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: '500',
                            opacity: tabs.findIndex(t => t.id === activeTab) === 0 ? 0.4 : 1,
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            if (tabs.findIndex(t => t.id === activeTab) !== 0) {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                                e.currentTarget.style.color = '#3b82f6';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                            e.currentTarget.style.color = '#94a3b8';
                        }}
                    >
                        <ChevronLeft size={18} />
                        <span>Précédent</span>
                    </button>

                    {/* Current Tab Display */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.25rem',
                        flex: 1,
                        margin: '0 2rem'
                    }}>
                        <div style={{
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            color: '#3b82f6',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <span style={{ fontSize: '1.3rem' }}>
                                {tabs.find(t => t.id === activeTab)?.icon}
                            </span>
                            {tabs.find(t => t.id === activeTab)?.label}
                        </div>
                        <div style={{
                            fontSize: '0.75rem',
                            color: '#64748b',
                            fontWeight: '500'
                        }}>
                            {tabs.findIndex(t => t.id === activeTab) + 1} / {tabs.length}
                        </div>
                    </div>

                    {/* Next Button */}
                    <button
                        type="button"
                        onClick={() => {
                            const currentIndex = tabs.findIndex(t => t.id === activeTab);
                            if (currentIndex < tabs.length - 1) {
                                setActiveTab(tabs[currentIndex + 1].id);
                            }
                        }}
                        disabled={tabs.findIndex(t => t.id === activeTab) === tabs.length - 1}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            background: 'transparent',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: tabs.findIndex(t => t.id === activeTab) === tabs.length - 1 ? '#64748b' : '#94a3b8',
                            cursor: tabs.findIndex(t => t.id === activeTab) === tabs.length - 1 ? 'not-allowed' : 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: '500',
                            opacity: tabs.findIndex(t => t.id === activeTab) === tabs.length - 1 ? 0.4 : 1,
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            if (tabs.findIndex(t => t.id === activeTab) !== tabs.length - 1) {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                                e.currentTarget.style.color = '#3b82f6';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                            e.currentTarget.style.color = '#94a3b8';
                        }}
                    >
                        <span>Suivant</span>
                        <ChevronRight size={18} />
                    </button>
                </div>

                {/* Tab Content */}
                <div className="modal-body" style={{ flex: 1, overflowY: 'auto' }}>
                    <form onSubmit={handleSubmit}>
                        {activeTab === 'basic' && (
                            <BasicInfoTab
                                formData={formData.bienImmobilier}
                                onChange={(updates) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        bienImmobilier: { ...prev.bienImmobilier, ...updates }
                                    }));
                                    setHasUnsavedChanges(true);
                                }}
                            />
                        )}

                        {activeTab === 'owner' && (
                            <OwnerInfoTab
                                formData={formData.proprietaire}
                                onChange={(updates) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        proprietaire: { ...prev.proprietaire, ...updates }
                                    }));
                                    setHasUnsavedChanges(true);
                                }}
                            />
                        )}

                        {activeTab === 'details' && (
                            <PropertyDetailsTab
                                propertyType={formData.bienImmobilier.type}
                                formData={formData.propertyDetails}
                                onChange={(updates) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        propertyDetails: { ...prev.propertyDetails, ...updates }
                                    }));
                                    setHasUnsavedChanges(true);
                                }}
                            />
                        )}

                        {activeTab === 'documents' && (
                            <DocumentsTab
                                papiers={formData.papiers}
                                piecesJointes={formData.piecesJointes}
                                newFiles={newFiles.juridical}
                                onPapierChange={(updatedPapiers) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        papiers: updatedPapiers
                                    }));
                                    setHasUnsavedChanges(true);
                                }}
                                onFileAdd={(files) => {
                                    setNewFiles(prev => ({
                                        ...prev,
                                        juridical: [...prev.juridical, ...files]
                                    }));
                                    setHasUnsavedChanges(true);
                                }}
                                onFileDelete={(fileId) => {
                                    setFilesToDelete(prev => [...prev, fileId]);
                                    setFormData(prev => ({
                                        ...prev,
                                        piecesJointes: prev.piecesJointes.filter(pj => pj.id !== fileId)
                                    }));
                                    setHasUnsavedChanges(true);
                                }}
                            />
                        )}

                        {activeTab === 'tracking' && (
                            <TrackingTab
                                formData={formData.suivi}
                                onChange={(updates) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        suivi: { ...prev.suivi, ...updates }
                                    }));
                                    setHasUnsavedChanges(true);
                                }}
                            />
                        )}

                        {activeTab === 'publicFiles' && (
                            <PublicFilesTab
                                piecesJointes={formData.piecesJointes.filter(pj => 
                                    pj.visibilite === 'PUBLIABLE' && !pj.categorie
                                )}
                                newFiles={newFiles}
                                onFileAdd={(files, type) => {
                                    setNewFiles(prev => ({
                                        ...prev,
                                        [`public${type}`]: [...prev[`public${type}`], ...files]
                                    }));
                                    setHasUnsavedChanges(true);
                                }}
                                onFileDelete={(fileId) => {
                                    setFilesToDelete(prev => [...prev, fileId]);
                                    setFormData(prev => ({
                                        ...prev,
                                        piecesJointes: prev.piecesJointes.filter(pj => pj.id !== fileId)
                                    }));
                                    setHasUnsavedChanges(true);
                                }}
                                onVisibilityChange={(fileId, newVisibility) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        piecesJointes: prev.piecesJointes.map(pj =>
                                            pj.id === fileId ? { ...pj, visibilite: newVisibility } : pj
                                        )
                                    }));
                                    setHasUnsavedChanges(true);
                                }}
                            />
                        )}

                        {activeTab === 'internalFiles' && (
                            <InternalFilesTab
                                piecesJointes={formData.piecesJointes.filter(pj => 
                                    pj.visibilite === 'INTERNE' && !pj.categorie
                                )}
                                newFiles={newFiles}
                                onFileAdd={(files, type) => {
                                    setNewFiles(prev => ({
                                        ...prev,
                                        [`internal${type}`]: [...prev[`internal${type}`], ...files]
                                    }));
                                    setHasUnsavedChanges(true);
                                }}
                                onFileDelete={(fileId) => {
                                    setFilesToDelete(prev => [...prev, fileId]);
                                    setFormData(prev => ({
                                        ...prev,
                                        piecesJointes: prev.piecesJointes.filter(pj => pj.id !== fileId)
                                    }));
                                    setHasUnsavedChanges(true);
                                }}
                                onVisibilityChange={(fileId, newVisibility) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        piecesJointes: prev.piecesJointes.map(pj =>
                                            pj.id === fileId ? { ...pj, visibilite: newVisibility } : pj
                                        )
                                    }));
                                    setHasUnsavedChanges(true);
                                }}
                            />
                        )}

                        {/* Action Buttons */}
                        <div style={{ 
                            display: 'flex', 
                            gap: '1rem', 
                            justifyContent: 'flex-end', 
                            marginTop: '2rem',
                            paddingTop: '1.5rem',
                            borderTop: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            <button
                                type="button"
                                onClick={handleClose}
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
                                    fontSize: '1rem',
                                    fontWeight: '600'
                                }}
                            >
                                {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PropertyEditModal;

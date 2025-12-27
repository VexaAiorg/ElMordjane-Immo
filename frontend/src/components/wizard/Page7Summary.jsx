import React, { useState } from 'react';
import { Check, Edit2, Home, User, FileText, Package, Eye, Image } from 'lucide-react';
import { useWizard } from '../../contexts/WizardContext';
import { useNavigate } from 'react-router-dom';
import { createProperty } from '../../api/api';


// eslint-disable-next-line no-unused-vars
const SummarySection = ({ title, icon: Icon, children, onEdit }) => (
    <div className="summary-section">
        <div className="summary-header">
            <div className="summary-title">
                <Icon size={20} />
                <h3>{title}</h3>
            </div>
            {onEdit && (
                <button type="button" onClick={onEdit} className="btn-icon-edit">
                    <Edit2 size={16} />
                    <span>Modifier</span>
                </button>
            )}
        </div>
        <div className="summary-content">{children}</div>
    </div>
);

const SummaryItem = ({ label, value }) => (
    <div className="summary-item">
        <span className="summary-label">{label}:</span>
        <span className="summary-value">{value || '-'}</span>
    </div>
);

const Page7Summary = () => {
    const { formData, uploadedFileUrls, goToStep, resetWizard } = useWizard();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError(null);

        try {
            // Prepare property data object matching backend expectations
            const isNewOwner = !formData.owner?.proprietaireId;

            // Map specific details based on property type
            const propertyType = formData.basicInfo?.type;
            let specificDetail = {};
            let specificDetailKey = '';

            if (propertyType === 'APPARTEMENT') specificDetailKey = 'detailAppartement';
            else if (propertyType === 'TERRAIN') specificDetailKey = 'detailTerrain';
            else if (propertyType === 'VILLA') specificDetailKey = 'detailVilla';
            else if (propertyType === 'LOCAL') specificDetailKey = 'detailLocal';
            else if (propertyType === 'IMMEUBLE') specificDetailKey = 'detailImmeuble';

            if (specificDetailKey && formData.propertyDetails) {
                specificDetail = { [specificDetailKey]: formData.propertyDetails };
            }

            // Build piecesJointes array from uploaded file URLs
            const piecesJointes = [];

            // 1. Add documents from Page 4 (using uploadedFileUrls.documents) - INTERNE
            if (uploadedFileUrls.documents) {
                Object.entries(uploadedFileUrls.documents).forEach(([docName, fileData]) => {
                    piecesJointes.push({
                        type: 'DOCUMENT',
                        visibilite: 'INTERNE',
                        nom: fileData.originalname || docName,
                        url: fileData.url,
                        categorie: docName, // Link to the juridical document name (e.g., "Acte", "Livret Foncier")
                    });
                });
            }

            // 2. Add photos from Page 5 - Fichiers liés au bien (PUBLIABLE by default)
            if (uploadedFileUrls.trackingPhotos && uploadedFileUrls.trackingPhotos.length > 0) {
                uploadedFileUrls.trackingPhotos.forEach((fileData, idx) => {
                    // Find matching attachment to get visibility setting
                    const attachment = formData.trackingAttachments?.piecesJointes?.find(
                        a => a.type === 'PHOTO' && a.file?.name === fileData.originalname
                    );

                    const piece = {
                        type: 'PHOTO',
                        visibilite: attachment?.visibilite || 'PUBLIABLE',
                        nom: fileData.originalname,
                        url: fileData.url,
                    };

                    piecesJointes.push(piece);
                });
            }

            // 3. Add documents from Page 5 - Fichiers liés au bien (PUBLIABLE by default)
            if (uploadedFileUrls.trackingDocs && uploadedFileUrls.trackingDocs.length > 0) {
                uploadedFileUrls.trackingDocs.forEach((fileData) => {
                    // Find matching attachment to get visibility setting
                    const attachment = formData.trackingAttachments?.piecesJointes?.find(
                        a => a.type === 'DOCUMENT' && a.file?.name === fileData.originalname
                    );

                    piecesJointes.push({
                        type: 'DOCUMENT',
                        visibilite: attachment?.visibilite || 'PUBLIABLE',
                        nom: fileData.originalname,
                        url: fileData.url,
                    });
                });
            }

            // 4. Add localisation URLs from Page 5 (PUBLIABLE by default)
            if (formData.trackingAttachments?.piecesJointes) {
                formData.trackingAttachments.piecesJointes
                    .filter(a => a.type === 'LOCALISATION')
                    .forEach(loc => {
                        piecesJointes.push({
                            type: 'LOCALISATION',
                            visibilite: loc.visibilite || 'PUBLIABLE',
                            nom: loc.nom || 'Localisation',
                            url: loc.url,
                        });
                    });
            }

            // 5. Add photos from Page 6 - Pièces Jointes (INTERNE by default)
            if (uploadedFileUrls.photos && uploadedFileUrls.photos.length > 0) {
                uploadedFileUrls.photos.forEach((fileData) => {
                    // Find matching attachment to get visibility setting
                    const attachment = formData.attachments?.piecesJointes?.find(
                        a => a.type === 'PHOTO' && a.file?.name === fileData.originalname
                    );

                    piecesJointes.push({
                        type: 'PHOTO',
                        visibilite: attachment?.visibilite || 'INTERNE',
                        nom: fileData.originalname,
                        url: fileData.url,
                    });
                });
            }

            // 6. Add documents from Page 6 - Pièces Jointes (INTERNE by default)
            if (uploadedFileUrls.attachmentDocs && uploadedFileUrls.attachmentDocs.length > 0) {
                uploadedFileUrls.attachmentDocs.forEach((fileData) => {
                    // Find matching attachment to get visibility setting
                    const attachment = formData.attachments?.piecesJointes?.find(
                        a => a.type === 'DOCUMENT' && a.file?.name === fileData.originalname
                    );

                    piecesJointes.push({
                        type: 'DOCUMENT',
                        visibilite: attachment?.visibilite || 'INTERNE',
                        nom: fileData.originalname,
                        url: fileData.url,
                    });
                });
            }

            // 7. Add localisation URLs from Page 6 (INTERNE by default)
            if (formData.attachments?.piecesJointes) {
                formData.attachments.piecesJointes
                    .filter(a => a.type === 'LOCALISATION')
                    .forEach(loc => {
                        piecesJointes.push({
                            type: 'LOCALISATION',
                            visibilite: loc.visibilite || 'INTERNE',
                            nom: loc.nom || 'Localisation',
                            url: loc.url,
                        });
                    });
            }

            const propertyData = {
                // Property Info
                bienImmobilier: {
                    titre: formData.basicInfo?.titre,
                    type: formData.basicInfo?.type,
                    transaction: formData.basicInfo?.transaction,
                    statut: formData.basicInfo?.statut,
                    adresse: formData.basicInfo?.adresse,
                    description: formData.basicInfo?.description,
                    prixVente: formData.basicInfo?.prixVente,
                    prixLocation: formData.basicInfo?.prixLocation,
                },

                // Owner info - Flat structure with flag
                proprietaire: isNewOwner ? {
                    isNewOwner: true,
                    nom: formData.owner?.nom,
                    prenom: formData.owner?.prenom,
                    telephone: formData.owner?.telephone,
                    email: formData.owner?.email,
                    adresse: formData.owner?.adresse,
                    typeIdentite: formData.owner?.typeIdentite,
                    numIdentite: formData.owner?.numIdentite,
                    qualite: formData.owner?.qualite,
                    prixType: formData.owner?.prixType,
                    prixNature: formData.owner?.prixNature,
                    paiementVente: formData.owner?.paiementVente,
                    paiementLocation: formData.owner?.paiementLocation,
                } : {
                    isNewOwner: false,
                    proprietaireId: parseInt(formData.owner?.proprietaireId),
                },

                // Specific Details (spread the key-value pair)
                ...specificDetail,

                // Documents (papiers) - Checklist status
                papiers: formData.documents?.papiers?.map(doc => ({
                    nom: doc.nom,
                    statut: doc.statut,
                    categorie: propertyType // Default category to property type
                })) || [],

                // Tracking
                suivi: {
                    estVisite: formData.tracking?.estVisite || false,
                    priorite: formData.tracking?.priorite || 'NORMAL',
                    aMandat: formData.tracking?.aMandat || false,
                    urlGoogleSheet: formData.tracking?.urlGoogleSheet,
                    urlGooglePhotos: formData.tracking?.urlGooglePhotos,
                },

                // Attachments with URLs (files already uploaded)
                piecesJointes,
            };

            // Creating property with collected data

            // Call API with propertyData (no file uploads needed - files already on server!)
            await createProperty(propertyData, [], []); // Empty arrays for files

            // Property created successfully

            // Show success message
            alert('✅ Bien immobilier ajouté avec succès! 🎉');

            // Reset wizard
            resetWizard();

            // Navigate to all properties page
            navigate('/dashboard/menu');

        } catch (err) {
            console.error('Error creating property:', err);
            setError(err.message || 'Une erreur est survenue lors de la création du bien');
        } finally {
            setIsSubmitting(false);
        }
    };

    const { basicInfo, owner, propertyDetails, documents, tracking, trackingAttachments, attachments } = formData;

    return (
        <div className="wizard-page">
            <h2 className="wizard-page-title">Récapitulatif</h2>
            <p className="wizard-page-subtitle">Vérifiez les informations avant la soumission</p>

            <div className="summary-container">
                {/* Basic Information */}
                <SummarySection
                    title="Informations de Base"
                    icon={Home}
                    onEdit={() => goToStep(1)}
                >
                    <SummaryItem label="Titre" value={basicInfo?.titre} />
                    <SummaryItem label="Type" value={basicInfo?.type} />
                    <SummaryItem label="Transaction" value={basicInfo?.transaction} />
                    <SummaryItem label="Statut" value={basicInfo?.statut} />
                    <SummaryItem
                        label="Prix"
                        value={
                            basicInfo?.transaction === 'VENTE'
                                ? `${basicInfo?.prixVente?.toLocaleString()} DA`
                                : `${basicInfo?.prixLocation?.toLocaleString()} DA`
                        }
                    />
                    <SummaryItem label="Adresse" value={basicInfo?.adresse} />
                    {basicInfo?.description && (
                        <SummaryItem label="Description" value={basicInfo?.description} />
                    )}
                </SummarySection>

                {/* Owner Information */}
                <SummarySection
                    title="Propriétaire"
                    icon={User}
                    onEdit={() => goToStep(2)}
                >
                    {owner?.proprietaireId ? (
                        <SummaryItem label="Propriétaire" value={`ID: ${owner.proprietaireId}`} />
                    ) : (
                        <>
                            <SummaryItem label="Nom" value={`${owner?.nom} ${owner?.prenom}`} />
                            <SummaryItem label="Téléphone" value={owner?.telephone} />
                            <SummaryItem label="Email" value={owner?.email} />
                            <SummaryItem label="Adresse" value={owner?.adresse} />
                            <SummaryItem label="Identité" value={`${owner?.typeIdentite} - ${owner?.numIdentite}`} />
                            <SummaryItem label="Qualité" value={owner?.qualite} />
                            <SummaryItem label="Type de Prix" value={owner?.prixType} />
                            <SummaryItem label="Nature" value={owner?.prixNature} />
                            <SummaryItem
                                label="Paiement"
                                value={owner?.paiementVente || owner?.paiementLocation}
                            />
                        </>
                    )}
                </SummarySection>

                {/* Property Details */}
                <SummarySection
                    title="Détails du Bien"
                    icon={Package}
                    onEdit={() => goToStep(3)}
                >
                    {propertyDetails && Object.keys(propertyDetails).length > 0 ? (
                        Object.entries(propertyDetails).map(([key, value]) => {
                            // Format the key for display
                            const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());

                            // Format the value
                            let displayValue = value;
                            if (typeof value === 'boolean') {
                                displayValue = value ? 'Oui' : 'Non';
                            } else if (typeof value === 'number') {
                                displayValue = value.toString();
                            }

                            return <SummaryItem key={key} label={label} value={displayValue} />;
                        })
                    ) : (
                        <p className="no-data">Aucun détail spécifique</p>
                    )}
                </SummarySection>

                {/* Documents */}
                <SummarySection
                    title="Documents & Papiers"
                    icon={FileText}
                    onEdit={() => goToStep(4)}
                >
                    {documents?.papiers && documents.papiers.length > 0 ? (
                        <div className="documents-summary">
                            {documents.papiers.map((doc, index) => (
                                <div key={index} className="doc-summary-item">
                                    <span className="doc-name">{doc.nom}</span>
                                    <span className={`doc-status status-${doc.statut?.toLowerCase()}`}>
                                        {doc.statut}
                                    </span>
                                    {doc.file && <Check size={16} className="doc-check" />}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="no-data">Aucun document</p>
                    )}
                </SummarySection>

                {/* Tracking */}
                <SummarySection
                    title="Suivi Interne"
                    icon={Eye}
                    onEdit={() => goToStep(5)}
                >
                    <SummaryItem label="Visité" value={tracking?.estVisite ? 'Oui' : 'Non'} />
                    <SummaryItem label="Priorité" value={tracking?.priorite} />
                    <SummaryItem label="Mandat" value={tracking?.aMandat ? 'Oui' : 'Non'} />
                    {tracking?.urlGoogleSheet && (
                        <SummaryItem label="Google Sheet" value={tracking.urlGoogleSheet} />
                    )}
                    {tracking?.urlGooglePhotos && (
                        <SummaryItem label="Google Photos" value={tracking.urlGooglePhotos} />
                    )}
                    {/* Page 5 Fichiers liés au bien (PUBLIABLE) */}
                    {trackingAttachments?.piecesJointes && trackingAttachments.piecesJointes.length > 0 && (
                        <div className="attachments-summary" style={{ marginTop: '1rem' }}>
                            <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Fichiers liés au bien (Publiables):</p>
                            <div className="attachment-count">
                                <span>Photos: {trackingAttachments.piecesJointes.filter(a => a.type === 'PHOTO').length}</span>
                                <span>Documents: {trackingAttachments.piecesJointes.filter(a => a.type === 'DOCUMENT').length}</span>
                                <span>Localisations: {trackingAttachments.piecesJointes.filter(a => a.type === 'LOCALISATION').length}</span>
                            </div>
                        </div>
                    )}
                </SummarySection>

                {/* Attachments - Page 6 */}
                <SummarySection
                    title="Pièces Jointes Supplémentaires"
                    icon={Image}
                    onEdit={() => goToStep(6)}
                >
                    {attachments?.piecesJointes && attachments.piecesJointes.length > 0 ? (
                        <div className="attachments-summary">
                            <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Fichiers internes:</p>
                            <div className="attachment-count">
                                <span>Photos: {attachments.piecesJointes.filter(a => a.type === 'PHOTO').length}</span>
                                <span>Documents: {attachments.piecesJointes.filter(a => a.type === 'DOCUMENT').length}</span>
                                <span>Localisations: {attachments.piecesJointes.filter(a => a.type === 'LOCALISATION').length}</span>
                            </div>

                        </div>
                    ) : (
                        <p className="no-data">Aucune pièce jointe supplémentaire</p>
                    )}
                </SummarySection>
            </div>

            {/* Error Display */}
            {error && (
                <div className="error-message" style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '8px',
                    color: '#ef4444'
                }}>
                    ❌ {error}
                </div>
            )}

            <div className="wizard-actions">
                <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => goToStep(6)}
                    disabled={isSubmitting}
                >
                    Précédent
                </button>
                <div className="action-group">
                    <button
                        type="button"
                        className="btn-outline"
                        onClick={resetWizard}
                        disabled={isSubmitting}
                    >
                        Recommencer
                    </button>
                    <button
                        type="button"
                        className="btn-success"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        <Check size={18} />
                        {isSubmitting ? 'En cours...' : 'Confirmer et Ajouter'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Page7Summary;

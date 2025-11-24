import React from 'react';
import { Check, Edit2, Home, User, FileText, Package, Eye, Image } from 'lucide-react';
import { useWizard } from '../../contexts/WizardContext';

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
    const { formData, goToStep, resetWizard } = useWizard();

    const handleSubmit = async () => {
        // TODO: Submit to backend API
        console.log('Submitting property data:', formData);

        // For now, just show success message
        alert('Bien immobilier ajouté avec succès! 🎉');

        // Reset wizard and redirect
        resetWizard();
        // TODO: Navigate to dashboard
    };

    const { basicInfo, owner, propertyDetails, documents, tracking, attachments } = formData;

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
                </SummarySection>

                {/* Attachments */}
                <SummarySection
                    title="Pièces Jointes"
                    icon={Image}
                    onEdit={() => goToStep(6)}
                >
                    {attachments?.piecesJointes && attachments.piecesJointes.length > 0 ? (
                        <div className="attachments-summary">
                            <div className="attachment-count">
                                <span>Photos: {attachments.piecesJointes.filter(a => a.type === 'PHOTO').length}</span>
                                <span>Documents: {attachments.piecesJointes.filter(a => a.type === 'DOCUMENT').length}</span>
                                <span>Localisations: {attachments.piecesJointes.filter(a => a.type === 'LOCALISATION').length}</span>
                            </div>
                            <div className="visibility-count">
                                <span>Publiables: {attachments.piecesJointes.filter(a => a.visibilite === 'PUBLIABLE').length}</span>
                                <span>Internes: {attachments.piecesJointes.filter(a => a.visibilite === 'INTERNE').length}</span>
                            </div>
                        </div>
                    ) : (
                        <p className="no-data">Aucune pièce jointe</p>
                    )}
                </SummarySection>
            </div>

            <div className="wizard-actions">
                <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => goToStep(6)}
                >
                    Précédent
                </button>
                <div className="action-group">
                    <button
                        type="button"
                        className="btn-outline"
                        onClick={resetWizard}
                    >
                        Recommencer
                    </button>
                    <button
                        type="button"
                        className="btn-success"
                        onClick={handleSubmit}
                    >
                        <Check size={18} />
                        Confirmer et Ajouter
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Page7Summary;

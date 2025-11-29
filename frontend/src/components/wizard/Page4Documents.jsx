import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, Check } from 'lucide-react';
import { useWizard } from '../../contexts/WizardContext';

// Document templates based on property type
const getDocumentTemplates = (propertyType) => {
    const templates = {
        APPARTEMENT: [
            'Acte',
            'Livret Foncier',
            'Copie de Fiche',
            'Négatif',
            'CC4',
            'LPP (Affectation)',
            'Attestation de remise de clé',
        ],
        TERRAIN: [
            'Acte (Livret Foncier)',
            'Extrait Cadastral',
            'Permis',
            'Certificat d\'Urbanisme',
            'Acte Indivision',
            'Papier Timbre',
            'Négatif',
            'CC12',
        ],
        VILLA: [
            'Acte (Livret Foncier)',
            'Extrait Cadastral',
            'Permis',
            'Certificat d\'Urbanisme',
            'Acte Indivision',
            'Papier Timbre',
            'Négatif',
            'CC12',
            'Avancement des Travaux',
            'Permis de Construire',
        ],
        LOCAL: [
            'Acte',
            'Livret Foncier',
            'Copie de Fiche',
            'Négatif',
            'CC4',
            'LPP (Affectation)',
            'Attestation de remise de clé',
            'Désistement OPGI',
        ],
        IMMEUBLE: [
            'Acte (Livret Foncier)',
            'Extrait Cadastral',
            'Permis',
            'Certificat d\'Urbanisme',
            'Acte Indivision',
            'Papier Timbre',
            'Négatif',
            'CC12',
            'Avancement des Travaux',
            'Permis de Construire',
            'EDD (État Descriptif de Division)',
        ],
    };

    return templates[propertyType] || [];
};

const FileUploadZone = ({ onFilesAccepted, documentName }) => {
    const onDrop = useCallback((acceptedFiles) => {
        onFilesAccepted(acceptedFiles);
    }, [onFilesAccepted]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        },
        multiple: false,
    });

    return (
        <div
            {...getRootProps()}
            className={`file-upload-zone ${isDragActive ? 'active' : ''}`}
        >
            <input {...getInputProps()} />
            <Upload size={24} />
            {isDragActive ? (
                <p>Déposez le fichier ici...</p>
            ) : (
                <p>Glissez-déposez ou cliquez pour sélectionner</p>
            )}
        </div>
    );
};

const Page4Documents = () => {
    const { formData, updateFormData, markPageAsValidated, nextStep, prevStep, updateFileUploads, fileUploads } = useWizard();

    const propertyType = formData.basicInfo?.type;
    const documentTemplates = getDocumentTemplates(propertyType);

    const [documents, setDocuments] = useState(
        formData.documents?.papiers?.length > 0
            ? formData.documents.papiers
            : documentTemplates.map((nom) => ({
                nom,
                statut: 'MANQUANT',
                file: null,
            }))
    );

    const handleStatusChange = (index, statut) => {
        const updated = [...documents];
        updated[index].statut = statut;
        setDocuments(updated);
    };

    const handleFileUpload = (index, files) => {
        if (files.length > 0) {
            const updated = [...documents];
            updated[index].file = files[0];
            updated[index].statut = 'DISPONIBLE';
            setDocuments(updated);
        }
    };

    const handleFileRemove = (index) => {
        const updated = [...documents];
        updated[index].file = null;
        updated[index].statut = 'MANQUANT';
        setDocuments(updated);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        updateFormData('documents', { papiers: documents });

        // Store files separately for later upload to Cloudinary
        const documentFiles = documents.filter(doc => doc.file).map(doc => doc.file);
        updateFileUploads('documents', documentFiles);

        markPageAsValidated(4);
        nextStep();
    };

    if (!propertyType) {
        return (
            <div className="wizard-page">
                <div className="error-state">
                    <p>Veuillez sélectionner un type de bien à la page 1</p>
                    <button className="btn-secondary" onClick={() => prevStep()}>
                        Retour
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="wizard-page">
            <h2 className="wizard-page-title">Documents & Papiers</h2>
            <p className="wizard-page-subtitle">
                Documents légaux et administratifs pour {propertyType}
            </p>

            <form onSubmit={handleSubmit} className="wizard-form">
                <div className="documents-list">
                    {documents.map((doc, index) => (
                        <div key={index} className="document-item">
                            <div className="document-info">
                                <div className="document-name">
                                    <FileText size={20} />
                                    <span>{doc.nom}</span>
                                </div>

                                <div className="document-status">
                                    <select
                                        value={doc.statut}
                                        onChange={(e) => handleStatusChange(index, e.target.value)}
                                        className="status-select"
                                    >
                                        <option value="DISPONIBLE">Disponible</option>
                                        <option value="MANQUANT">Manquant</option>
                                        <option value="EN_COURS">En cours</option>
                                    </select>
                                </div>
                            </div>

                            <div className="document-upload">
                                {doc.file ? (
                                    <div className="file-preview">
                                        <div className="file-info">
                                            <Check size={16} className="check-icon" />
                                            <span className="file-name">{doc.file.name}</span>
                                            <span className="file-size">
                                                {(doc.file.size / 1024).toFixed(1)} KB
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleFileRemove(index)}
                                            className="btn-icon-danger"
                                            aria-label="Supprimer le fichier"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <FileUploadZone
                                        documentName={doc.nom}
                                        onFilesAccepted={(files) => handleFileUpload(index, files)}
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                </div>



                <div className="wizard-actions">
                    <button type="button" className="btn-secondary" onClick={prevStep}>
                        Précédent
                    </button>
                    <button type="submit" className="btn-primary">
                        Suivant
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Page4Documents;

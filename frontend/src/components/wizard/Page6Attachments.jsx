import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image, FileText, MapPin, Loader } from 'lucide-react';
import { useWizard } from '../../contexts/WizardContext';
import { uploadFilesImmediately } from '../../services/uploadService';

const AttachmentUploadZone = ({ onFilesAccepted, accept, label, isUploading }) => {
    const onDrop = useCallback((acceptedFiles) => {
        onFilesAccepted(acceptedFiles);
    }, [onFilesAccepted]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept,
        multiple: true,
        disabled: isUploading,
    });

    return (
        <div
            {...getRootProps()}
            className={`file-upload-zone attachment ${isDragActive ? 'active' : ''} ${isUploading ? 'uploading' : ''}`}
        >
            <input {...getInputProps()} />
            {isUploading ? (
                <>
                    <Loader size={24} className="spinner" />
                    <p>Téléchargement...</p>
                </>
            ) : (
                <>
                    <Upload size={24} />
                    {isDragActive ? (
                        <p>Déposez les fichiers ici...</p>
                    ) : (
                        <p>{label}</p>
                    )}
                </>
            )}
        </div>
    );
};

const AttachmentItem = ({ attachment, onRemove, onVisibilityChange }) => {
    const getIcon = () => {
        switch (attachment.type) {
            case 'PHOTO':
                return <Image size={20} />;
            case 'LOCALISATION':
                return <MapPin size={20} />;
            default:
                return <FileText size={20} />;
        }
    };

    const getPreview = () => {
        if (attachment.type === 'PHOTO' && attachment.file) {
            return (
                <img
                    src={URL.createObjectURL(attachment.file)}
                    alt={attachment.nom}
                    className="attachment-preview-img"
                />
            );
        }
        return null;
    };

    return (
        <div className="attachment-item">
            {getPreview()}
            <div className="attachment-info">
                <div className="attachment-header">
                    {getIcon()}
                    <span className="attachment-name">
                        {attachment.file?.name || attachment.nom || 'Sans nom'}
                    </span>
                    {attachment.file && (
                        <span className="attachment-size">
                            {(attachment.file.size / 1024).toFixed(1)} KB
                        </span>
                    )}
                </div>

                <div className="attachment-controls">
                    <div className="visibility-control">
                        <label className="radio-label-inline">
                            <input
                                type="radio"
                                name={`visibility-${attachment.id}`}
                                value="PUBLIABLE"
                                checked={attachment.visibilite === 'PUBLIABLE'}
                                onChange={() => onVisibilityChange('PUBLIABLE')}
                            />
                            <span>Publiable</span>
                        </label>
                        <label className="radio-label-inline">
                            <input
                                type="radio"
                                name={`visibility-${attachment.id}`}
                                value="INTERNE"
                                checked={attachment.visibilite === 'INTERNE'}
                                onChange={() => onVisibilityChange('INTERNE')}
                            />
                            <span>Interne</span>
                        </label>
                    </div>

                    <button
                        type="button"
                        onClick={onRemove}
                        className="btn-icon-danger"
                        aria-label="Supprimer"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

const Page6Attachments = () => {
    const { formData, updateFormData, markPageAsValidated, nextStep, prevStep, uploadedFileUrls, updateUploadedFileUrls } = useWizard();

    const [attachments, setAttachments] = useState(
        formData.attachments?.piecesJointes || []
    );
    const [localisationUrl, setLocalisationUrl] = useState('');
    const [uploadingPhotos, setUploadingPhotos] = useState(false);
    const [uploadingDocs, setUploadingDocs] = useState(false);

    const propertyType = formData.basicInfo?.type || 'TEMP';

    const handleDocumentUpload = async (files) => {
        setUploadingDocs(true);
        try {
            // Upload files immediately to server
            const uploadedFiles = await uploadFilesImmediately(files, propertyType);

            const newAttachments = files.map((file, index) => ({
                id: Date.now() + index,
                type: 'DOCUMENT',
                visibilite: 'INTERNE',
                file,
                nom: file.name,
                serverUrl: uploadedFiles[index],
            }));
            setAttachments([...attachments, ...newAttachments]);

            // Store URLs in context
            const currentDocs = uploadedFileUrls.attachmentDocs || [];
            updateUploadedFileUrls('attachmentDocs', [...currentDocs, ...uploadedFiles]);

            console.log(`✅ Uploaded ${files.length} documents to server`);
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Échec du téléchargement des documents. Veuillez réessayer.');
        } finally {
            setUploadingDocs(false);
        }
    };

    const handlePhotoUpload = async (files) => {
        setUploadingPhotos(true);
        try {
            // Upload files immediately to server
            const uploadedFiles = await uploadFilesImmediately(files, propertyType);

            const newAttachments = files.map((file, index) => ({
                id: Date.now() + index,
                type: 'PHOTO',
                visibilite: 'INTERNE',
                file,
                nom: file.name,
                serverUrl: uploadedFiles[index],
            }));
            setAttachments([...attachments, ...newAttachments]);

            // Store URLs in context
            const currentPhotos = uploadedFileUrls.photos || [];
            updateUploadedFileUrls('photos', [...currentPhotos, ...uploadedFiles]);

            console.log(`✅ Uploaded ${files.length} photos to server`);
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Échec du téléchargement des photos. Veuillez réessayer.');
        } finally {
            setUploadingPhotos(false);
        }
    };

    const handleLocalisationAdd = () => {
        if (localisationUrl.trim()) {
            const newAttachment = {
                id: Date.now(),
                type: 'LOCALISATION',
                visibilite: 'INTERNE',
                url: localisationUrl,
                nom: 'Localisation',
            };
            setAttachments([...attachments, newAttachment]);
            setLocalisationUrl('');
        }
    };

    const handleRemove = (id) => {
        setAttachments(attachments.filter((a) => a.id !== id));
    };

    const handleVisibilityChange = (id, visibilite) => {
        setAttachments(
            attachments.map((a) => (a.id === id ? { ...a, visibilite } : a))
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        updateFormData('attachments', { piecesJointes: attachments });
        markPageAsValidated(6);
        nextStep();
    };

    const photosOnly = attachments.filter((a) => a.type === 'PHOTO');
    const documentsOnly = attachments.filter((a) => a.type === 'DOCUMENT');
    const localisationsOnly = attachments.filter((a) => a.type === 'LOCALISATION');

    return (
        <div className="wizard-page">
            <h2 className="wizard-page-title">Pièces Jointes</h2>
            <p className="wizard-page-subtitle">Photos, documents et localisation du bien</p>

            <form onSubmit={handleSubmit} className="wizard-form">
                {/* Photos Section */}
                <div className="form-section">
                    <h3 className="section-title">
                        <Image size={20} />
                        Photos ({photosOnly.length})
                    </h3>
                    <AttachmentUploadZone
                        onFilesAccepted={handlePhotoUpload}
                        accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] }}
                        label="Glissez-déposez des photos ou cliquez pour sélectionner"
                        isUploading={uploadingPhotos}
                    />
                    <div className="attachments-grid">
                        {photosOnly.map((attachment) => (
                            <AttachmentItem
                                key={attachment.id}
                                attachment={attachment}
                                onRemove={() => handleRemove(attachment.id)}
                                onVisibilityChange={(vis) => handleVisibilityChange(attachment.id, vis)}
                            />
                        ))}
                    </div>
                </div>

                {/* Documents Section */}
                <div className="form-section">
                    <h3 className="section-title">
                        <FileText size={20} />
                        Documents Supplémentaires ({documentsOnly.length})
                    </h3>
                    <AttachmentUploadZone
                        onFilesAccepted={handleDocumentUpload}
                        accept={{
                            'application/pdf': ['.pdf'],
                            'application/msword': ['.doc'],
                            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                            'image/*': ['.png', '.jpg', '.jpeg'],
                        }}
                        label="Glissez-déposez des documents ou cliquez pour sélectionner"
                        isUploading={uploadingDocs}
                    />
                    <div className="attachments-list">
                        {documentsOnly.map((attachment) => (
                            <AttachmentItem
                                key={attachment.id}
                                attachment={attachment}
                                onRemove={() => handleRemove(attachment.id)}
                                onVisibilityChange={(vis) => handleVisibilityChange(attachment.id, vis)}
                            />
                        ))}
                    </div>
                </div>

                {/* Localisation Section */}
                <div className="form-section">
                    <h3 className="section-title">
                        <MapPin size={20} />
                        Localisation / Cartes ({localisationsOnly.length})
                    </h3>
                    <div className="form-group">
                        <label htmlFor="localisationUrl">URL Google Maps ou autre</label>
                        <div className="input-with-button">
                            <input
                                id="localisationUrl"
                                type="url"
                                placeholder="https://maps.google.com/..."
                                value={localisationUrl}
                                onChange={(e) => setLocalisationUrl(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={handleLocalisationAdd}
                                className="btn-secondary"
                                disabled={!localisationUrl.trim()}
                            >
                                Ajouter
                            </button>
                        </div>
                    </div>
                    <div className="attachments-list">
                        {localisationsOnly.map((attachment) => (
                            <AttachmentItem
                                key={attachment.id}
                                attachment={attachment}
                                onRemove={() => handleRemove(attachment.id)}
                                onVisibilityChange={(vis) => handleVisibilityChange(attachment.id, vis)}
                            />
                        ))}
                    </div>
                </div>

                <div className="form-info">
                    <p>
                        💡 Les fichiers marqués comme "Publiable" seront visibles sur les annonces publiques.
                        Les fichiers "Internes" ne sont visibles que par les administrateurs.
                    </p>
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

export default Page6Attachments;

import React, { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, X, Image, FileText, MapPin } from 'lucide-react';
import { trackingSchema } from '../../utils/wizardSchemas';
import { useWizard } from '../../contexts/WizardContext';

const AttachmentUploadZone = ({ onFilesAccepted, accept, label }) => {
    const onDrop = useCallback((acceptedFiles) => {
        onFilesAccepted(acceptedFiles);
    }, [onFilesAccepted]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept,
        multiple: true,
    });

    return (
        <div
            {...getRootProps()}
            className={`file-upload-zone attachment ${isDragActive ? 'active' : ''}`}
        >
            <input {...getInputProps()} />
            <Upload size={24} />
            {isDragActive ? (
                <p>Déposez les fichiers ici...</p>
            ) : (
                <p>{label}</p>
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

const Page5Tracking = () => {
    const { formData, updateFormData, markPageAsValidated, nextStep, prevStep, updateFileUploads } = useWizard();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(trackingSchema),
        defaultValues: formData.tracking,
    });

    // Attachments State
    const [attachments, setAttachments] = useState(
        formData.attachments?.piecesJointes || []
    );
    const [localisationUrl, setLocalisationUrl] = useState('');

    const handleDocumentUpload = (files) => {
        const newAttachments = files.map((file, index) => ({
            id: Date.now() + index,
            type: 'DOCUMENT',
            visibilite: 'INTERNE',
            file,
            nom: file.name,
        }));
        setAttachments([...attachments, ...newAttachments]);
    };

    const handlePhotoUpload = (files) => {
        const newAttachments = files.map((file, index) => ({
            id: Date.now() + index,
            type: 'PHOTO',
            visibilite: 'INTERNE',
            file,
            nom: file.name,
        }));
        setAttachments([...attachments, ...newAttachments]);
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

    const onSubmit = (data) => {
        // Save tracking data
        updateFormData('tracking', data);

        // Save attachments data
        updateFormData('attachments', { piecesJointes: attachments });

        // Store photos separately for easier access
        const photos = attachments.filter(a => a.type === 'PHOTO' && a.file).map(a => a.file);
        updateFileUploads('photos', photos);

        markPageAsValidated(5);
        nextStep();
    };

    const photosOnly = attachments.filter((a) => a.type === 'PHOTO');
    const documentsOnly = attachments.filter((a) => a.type === 'DOCUMENT');
    const localisationsOnly = attachments.filter((a) => a.type === 'LOCALISATION');

    return (
        <div className="wizard-page">
            <h2 className="wizard-page-title">Suivi & Informations Internes</h2>
            <p className="wizard-page-subtitle">Gestion du workflow et priorités</p>

            <form onSubmit={handleSubmit(onSubmit)} className="wizard-form">
                <div className="form-section">
                    <h3 className="section-title">État de Visite</h3>
                    <div className="toggle-group">
                        <label className="toggle-label">
                            <span>Le bien a-t-il été visité ?</span>
                            <div className="toggle-switch">
                                <input type="checkbox" {...register('estVisite')} />
                                <span className="slider"></span>
                            </div>
                        </label>
                    </div>
                </div>

                <div className="form-section">
                    <h3 className="section-title">Classement de Priorité</h3>
                    <div className="radio-group">
                        <label className="radio-label priority">
                            <input type="radio" value="TRES_IMPORTANT" {...register('priorite')} />
                            <span className="priority-badge very-important">Très Important</span>
                        </label>
                        <label className="radio-label priority">
                            <input type="radio" value="IMPORTANT" {...register('priorite')} />
                            <span className="priority-badge important">Important</span>
                        </label>
                        <label className="radio-label priority">
                            <input type="radio" value="NORMAL" {...register('priorite')} defaultChecked />
                            <span className="priority-badge normal">Normal</span>
                        </label>
                    </div>
                </div>

                <div className="form-section">
                    <h3 className="section-title">Mandat</h3>
                    <div className="toggle-group">
                        <label className="toggle-label">
                            <span>Mandat délivré ?</span>
                            <div className="toggle-switch">
                                <input type="checkbox" {...register('aMandat')} />
                                <span className="slider"></span>
                            </div>
                        </label>
                    </div>
                </div>

                <div className="form-section">
                    <h3 className="section-title">Intégration Externe (Optionnel)</h3>
                    <div className="form-grid">
                        <div className="form-group full-width">
                            <label htmlFor="urlGoogleSheet">URL Google Sheet</label>
                            <input
                                id="urlGoogleSheet"
                                type="url"
                                placeholder="https://docs.google.com/spreadsheets/..."
                                {...register('urlGoogleSheet')}
                                className={errors.urlGoogleSheet ? 'error' : ''}
                            />
                            {errors.urlGoogleSheet && (
                                <span className="error-message">{errors.urlGoogleSheet.message}</span>
                            )}
                        </div>

                        <div className="form-group full-width">
                            <label htmlFor="urlGooglePhotos">URL Google Photos</label>
                            <input
                                id="urlGooglePhotos"
                                type="url"
                                placeholder="https://photos.google.com/..."
                                {...register('urlGooglePhotos')}
                                className={errors.urlGooglePhotos ? 'error' : ''}
                            />
                            {errors.urlGooglePhotos && (
                                <span className="error-message">{errors.urlGooglePhotos.message}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Fichiers et médias liés au bien */}
                <div className="form-section">
                    <h3 className="section-title">Fichiers et médias liés au bien</h3>

                    {/* Photos Section */}
                    <div className="subsection">
                        <h4 className="subsection-title">
                            <Image size={18} /> Photos ({photosOnly.length})
                        </h4>
                        <AttachmentUploadZone
                            onFilesAccepted={handlePhotoUpload}
                            accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] }}
                            label="Glissez-déposez des photos ou cliquez pour sélectionner"
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
                    <div className="subsection">
                        <h4 className="subsection-title">
                            <FileText size={18} /> Documents ({documentsOnly.length})
                        </h4>
                        <AttachmentUploadZone
                            onFilesAccepted={handleDocumentUpload}
                            accept={{
                                'application/pdf': ['.pdf'],
                                'application/msword': ['.doc'],
                                'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                                'image/*': ['.png', '.jpg', '.jpeg'],
                            }}
                            label="Glissez-déposez des documents ou cliquez pour sélectionner"
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
                    <div className="subsection">
                        <h4 className="subsection-title">
                            <MapPin size={18} /> Localisation ({localisationsOnly.length})
                        </h4>
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

export default Page5Tracking;

import React, { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, X, Image, FileText, MapPin, Loader } from 'lucide-react';
import { trackingSchema } from '../../utils/wizardSchemas';
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

const AttachmentItem = ({ attachment, onRemove }) => {
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
                    <span className="status-badge available" style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}>
                        Publiable
                    </span>
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
    const { formData, updateFormData, markPageAsValidated, nextStep, prevStep, uploadedFileUrls, updateUploadedFileUrls } = useWizard();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(trackingSchema),
        defaultValues: formData.tracking,
    });

    // Attachments State - use trackingAttachments for Page 5 (default: PUBLIABLE)
    const [attachments, setAttachments] = useState(
        formData.trackingAttachments?.piecesJointes || []
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

            // Default visibility is PUBLIABLE for Page 5 (Fichiers liés au bien)
            const newAttachments = files.map((file, index) => ({
                id: Date.now() + index,
                type: 'DOCUMENT',
                visibilite: 'PUBLIABLE',
                file,
                nom: file.name,
                serverUrl: uploadedFiles[index],
            }));
            setAttachments([...attachments, ...newAttachments]);

            // Store URLs in context (trackingDocs for Page 5)
            const currentDocs = uploadedFileUrls.trackingDocs || [];
            updateUploadedFileUrls('trackingDocs', [...currentDocs, ...uploadedFiles]);

            console.log(`✅ [Page 5] Uploaded ${files.length} documents (PUBLIABLE)`);
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

            // Default visibility is PUBLIABLE for Page 5 (Fichiers liés au bien)
            const newAttachments = files.map((file, index) => ({
                id: Date.now() + index,
                type: 'PHOTO',
                visibilite: 'PUBLIABLE',
                file,
                nom: file.name,
                serverUrl: uploadedFiles[index],
            }));
            setAttachments([...attachments, ...newAttachments]);

            // Store URLs in context (trackingPhotos for Page 5)
            const currentPhotos = uploadedFileUrls.trackingPhotos || [];
            updateUploadedFileUrls('trackingPhotos', [...currentPhotos, ...uploadedFiles]);

            console.log(`✅ [Page 5] Uploaded ${files.length} photos (PUBLIABLE)`);
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Échec du téléchargement des photos. Veuillez réessayer.');
        } finally {
            setUploadingPhotos(false);
        }
    };

    const handleLocalisationAdd = () => {
        if (localisationUrl.trim()) {
            // Default visibility is PUBLIABLE for Page 5
            const newAttachment = {
                id: Date.now(),
                type: 'LOCALISATION',
                visibilite: 'PUBLIABLE',
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



    const onSubmit = (data) => {
        // Save tracking data
        updateFormData('tracking', data);

        // Save attachments data to trackingAttachments (Page 5 - PUBLIABLE)
        updateFormData('trackingAttachments', { piecesJointes: attachments });

        markPageAsValidated(5);
        nextStep();
    };

    const photosOnly = attachments.filter((a) => a.type === 'PHOTO');
    const documentsOnly = attachments.filter((a) => a.type === 'DOCUMENT');
    const localisationsOnly = attachments.filter((a) => a.type === 'LOCALISATION');

    return (
        <div className="wizard-page">
            <h2 className="wizard-page-title">Suivi & Informations </h2>
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
                    <h3 className="section-title">Fichiers et médias liés au bien (Publiable)</h3>

                    {/* Photos Section */}
                    <div className="subsection">
                        <h4 className="subsection-title">
                            <Image size={18} /> Photos ({photosOnly.length})
                        </h4>
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
                            isUploading={uploadingDocs}
                        />
                        <div className="attachments-list">
                            {documentsOnly.map((attachment) => (
                                <AttachmentItem
                                    key={attachment.id}
                                    attachment={attachment}
                                    onRemove={() => handleRemove(attachment.id)}
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

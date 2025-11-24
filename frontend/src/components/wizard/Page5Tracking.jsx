import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { trackingSchema } from '../../utils/wizardSchemas';
import { useWizard } from '../../contexts/WizardContext';

const Page5Tracking = () => {
    const { formData, updateFormData, markPageAsValidated, nextStep, prevStep } = useWizard();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(trackingSchema),
        defaultValues: formData.tracking,
    });

    const onSubmit = (data) => {
        updateFormData('tracking', data);
        markPageAsValidated(5);
        nextStep();
    };

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

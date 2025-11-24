import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { basicInfoSchema } from '../../utils/wizardSchemas';
import { useWizard } from '../../contexts/WizardContext';

const Page1BasicInfo = () => {
    const { formData, updateFormData, markPageAsValidated, nextStep } = useWizard();

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
    } = useForm({
        resolver: zodResolver(basicInfoSchema),
        defaultValues: formData.basicInfo,
    });

    const transaction = watch('transaction');

    useEffect(() => {
        // Set default status if not set
        if (!formData.basicInfo.statut) {
            setValue('statut', 'DISPONIBLE');
        }
    }, []);

    const onSubmit = (data) => {
        updateFormData('basicInfo', data);
        markPageAsValidated(1);
        nextStep();
    };

    return (
        <div className="wizard-page">
            <h2 className="wizard-page-title">Informations de Base</h2>
            <p className="wizard-page-subtitle">Commencez par les informations essentielles du bien</p>

            <form onSubmit={handleSubmit(onSubmit)} className="wizard-form">
                <div className="form-grid">
                    {/* Titre */}
                    <div className="form-group full-width">
                        <label htmlFor="titre">
                            Titre du bien <span className="required">*</span>
                        </label>
                        <input
                            id="titre"
                            type="text"
                            placeholder="Ex: Villa moderne avec piscine"
                            {...register('titre')}
                            className={errors.titre ? 'error' : ''}
                        />
                        {errors.titre && <span className="error-message">{errors.titre.message}</span>}
                    </div>

                    {/* Description */}
                    <div className="form-group full-width">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            rows="4"
                            placeholder="Description détaillée du bien..."
                            {...register('description')}
                        />
                        {errors.description && <span className="error-message">{errors.description.message}</span>}
                    </div>

                    {/* Type de bien */}
                    <div className="form-group">
                        <label htmlFor="type">
                            Type de bien <span className="required">*</span>
                        </label>
                        <select id="type" {...register('type')} className={errors.type ? 'error' : ''}>
                            <option value="">Sélectionner...</option>
                            <option value="APPARTEMENT">Appartement</option>
                            <option value="TERRAIN">Terrain</option>
                            <option value="VILLA">Villa</option>
                            <option value="LOCAL">Local Commercial</option>
                            <option value="IMMEUBLE">Immeuble</option>
                        </select>
                        {errors.type && <span className="error-message">{errors.type.message}</span>}
                    </div>

                    {/* Type de transaction */}
                    <div className="form-group">
                        <label htmlFor="transaction">
                            Type de transaction <span className="required">*</span>
                        </label>
                        <select id="transaction" {...register('transaction')} className={errors.transaction ? 'error' : ''}>
                            <option value="">Sélectionner...</option>
                            <option value="VENTE">Vente</option>
                            <option value="LOCATION">Location</option>
                        </select>
                        {errors.transaction && <span className="error-message">{errors.transaction.message}</span>}
                    </div>

                    {/* Statut */}
                    <div className="form-group">
                        <label htmlFor="statut">
                            Statut <span className="required">*</span>
                        </label>
                        <select id="statut" {...register('statut')}>
                            <option value="DISPONIBLE">Disponible</option>
                            <option value="VENDU">Vendu</option>
                            <option value="LOUE">Loué</option>
                        </select>
                        {errors.statut && <span className="error-message">{errors.statut.message}</span>}
                    </div>

                    {/* Prix - Dynamic based on transaction type */}
                    {transaction === 'VENTE' && (
                        <div className="form-group full-width">
                            <label htmlFor="prixVente">
                                Prix de vente (DA) <span className="required">*</span>
                            </label>
                            <input
                                id="prixVente"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="Ex: 25000000"
                                {...register('prixVente', { valueAsNumber: true })}
                                className={errors.prixVente ? 'error' : ''}
                            />
                            {errors.prixVente && <span className="error-message">{errors.prixVente.message}</span>}
                        </div>
                    )}

                    {transaction === 'LOCATION' && (
                        <div className="form-group full-width">
                            <label htmlFor="prixLocation">
                                Prix de location (DA) <span className="required">*</span>
                            </label>
                            <input
                                id="prixLocation"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="Ex: 50000"
                                {...register('prixLocation', { valueAsNumber: true })}
                                className={errors.prixLocation ? 'error' : ''}
                            />
                            {errors.prixLocation && <span className="error-message">{errors.prixLocation.message}</span>}
                        </div>
                    )}

                    {/* Adresse */}
                    <div className="form-group full-width">
                        <label htmlFor="adresse">
                            Adresse <span className="required">*</span>
                        </label>
                        <input
                            id="adresse"
                            type="text"
                            placeholder="Ex: Lot 25, Cité El Menzah, Oran"
                            {...register('adresse')}
                            className={errors.adresse ? 'error' : ''}
                        />
                        {errors.adresse && <span className="error-message">{errors.adresse.message}</span>}
                    </div>
                </div>

                <div className="wizard-actions">
                    <div></div> {/* Empty div for spacing */}
                    <button type="submit" className="btn-primary">
                        Suivant
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Page1BasicInfo;

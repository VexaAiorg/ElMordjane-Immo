import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { ownerInfoSchema } from '../../utils/wizardSchemas';
import { useWizard } from '../../contexts/WizardContext';

const Page2OwnerInfo = () => {
    const { formData, updateFormData, markPageAsValidated, nextStep, prevStep, currentStep } = useWizard();
    const [isNewOwner, setIsNewOwner] = useState(true);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
    } = useForm({
        resolver: zodResolver(ownerInfoSchema),
        defaultValues: {
            ...formData.owner,
            isNewOwner: true,
        },
    });

    const transaction = formData.basicInfo?.transaction;

    const onSubmit = (data) => {
        updateFormData('owner', data);
        markPageAsValidated(2);
        nextStep();
    };

    return (
        <div className="wizard-page">
            <h2 className="wizard-page-title">Informations Propriétaire</h2>
            <p className="wizard-page-subtitle">Renseignements sur le propriétaire du bien</p>

            <form onSubmit={handleSubmit(onSubmit)} className="wizard-form">
                {/* Owner Selection Toggle */}
                <div className="owner-toggle">
                    <button
                        type="button"
                        className={`toggle-btn ${isNewOwner ? 'active' : ''}`}
                        onClick={() => {
                            setIsNewOwner(true);
                            setValue('isNewOwner', true);
                        }}
                    >
                        Nouveau Propriétaire
                    </button>
                    <button
                        type="button"
                        className={`toggle-btn ${!isNewOwner ? 'active' : ''}`}
                        onClick={() => {
                            setIsNewOwner(false);
                            setValue('isNewOwner', false);
                        }}
                    >
                        Propriétaire Existant
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {isNewOwner ? (
                        <motion.div
                            key="new-owner"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {/* Basic Info */}
                            <div className="form-section">
                                <h3 className="section-title">Informations Personnelles</h3>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label htmlFor="nom">
                                            Nom <span className="required">*</span>
                                        </label>
                                        <input
                                            id="nom"
                                            type="text"
                                            placeholder="Ex: Benali"
                                            {...register('nom')}
                                            className={errors.nom ? 'error' : ''}
                                        />
                                        {errors.nom && <span className="error-message">{errors.nom.message}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="prenom">
                                            Prénom <span className="required">*</span>
                                        </label>
                                        <input
                                            id="prenom"
                                            type="text"
                                            placeholder="Ex: Ahmed"
                                            {...register('prenom')}
                                            className={errors.prenom ? 'error' : ''}
                                        />
                                        {errors.prenom && <span className="error-message">{errors.prenom.message}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="telephone">
                                            Téléphone <span className="required">*</span>
                                        </label>
                                        <input
                                            id="telephone"
                                            type="tel"
                                            placeholder="Ex: 0555123456"
                                            {...register('telephone')}
                                            maxLength={10}
                                            className={errors.telephone ? 'error' : ''}
                                        />
                                        {errors.telephone && <span className="error-message">{errors.telephone.message}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="email">Email</label>
                                        <input
                                            id="email"
                                            type="email"
                                            placeholder="exemple@email.com"
                                            {...register('email')}
                                            className={errors.email ? 'error' : ''}
                                        />
                                        {errors.email && <span className="error-message">{errors.email.message}</span>}
                                    </div>

                                    <div className="form-group full-width">
                                        <label htmlFor="adresse">Adresse</label>
                                        <input
                                            id="adresse"
                                            type="text"
                                            placeholder="Adresse du propriétaire"
                                            {...register('adresse')}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Identity Section */}
                            <div className="form-section">
                                <h3 className="section-title">Identité</h3>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label htmlFor="typeIdentite">Type d'identité</label>
                                        <select id="typeIdentite" {...register('typeIdentite')}>
                                            <option value="">Sélectionner...</option>
                                            <option value="CNI">Carte Nationale d'Identité</option>
                                            <option value="PC">Permis de Conduire</option>
                                            <option value="PP">Passeport</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="numIdentite">Numéro d'identité</label>
                                        <input
                                            id="numIdentite"
                                            type="text"
                                            maxLength={20}
                                            placeholder="Ex: 123456789"
                                            {...register('numIdentite')}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Quality Section */}
                            <div className="form-section">
                                <h3 className="section-title">Qualité</h3>
                                <div className="radio-group horizontal">
                                    <label className="radio-label">
                                        <input type="radio" value="PROPRIETAIRE" {...register('qualite')} />
                                        <span>Propriétaire</span>
                                    </label>
                                    <label className="radio-label">
                                        <input type="radio" value="HERITIER" {...register('qualite')} />
                                        <span>Héritier</span>
                                    </label>
                                    <label className="radio-label">
                                        <input type="radio" value="PROCUREUR" {...register('qualite')} />
                                        <span>Procureur</span>
                                    </label>
                                </div>
                            </div>

                            {/* Price Information */}
                            <div className="form-section">
                                <h3 className="section-title">Informations Prix</h3>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Type de Prix</label>
                                        <div className="radio-group horizontal">
                                            <label className="radio-label">
                                                <input type="radio" value="DEMANDE" {...register('prixType')} />
                                                <span>Demande</span>
                                            </label>
                                            <label className="radio-label">
                                                <input type="radio" value="OFFERT" {...register('prixType')} />
                                                <span>Offert</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Nature du Prix</label>
                                        <div className="radio-group horizontal">
                                            <label className="radio-label">
                                                <input type="radio" value="FERME" {...register('prixNature')} />
                                                <span>Ferme</span>
                                            </label>
                                            <label className="radio-label">
                                                <input type="radio" value="FIXE" {...register('prixNature')} />
                                                <span>Fixe</span>
                                            </label>
                                            <label className="radio-label">
                                                <input type="radio" value="NEGOCIABLE" {...register('prixNature')} />
                                                <span>Négociable</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Source du Prix</label>
                                        <div className="radio-group horizontal">
                                            <label className="radio-label">
                                                <input type="radio" value="A_MON_NIVEAU" {...register('prixSource')} />
                                                <span>À mon niveau</span>
                                            </label>
                                            <label className="radio-label">
                                                <input type="radio" value="AILLEURS" {...register('prixSource')} />
                                                <span>Ailleurs</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="form-section">
                                <h3 className="section-title">Mode de Paiement</h3>
                                {transaction === 'VENTE' && (
                                    <div className="radio-group horizontal">
                                        <label className="radio-label">
                                            <input type="radio" value="CREDIT" {...register('paiementVente')} />
                                            <span>Crédit</span>
                                        </label>
                                        <label className="radio-label">
                                            <input type="radio" value="CACHE" {...register('paiementVente')} />
                                            <span>Cache</span>
                                        </label>
                                    </div>
                                )}
                                {transaction === 'LOCATION' && (
                                    <div className="radio-group horizontal">
                                        <label className="radio-label">
                                            <input type="radio" value="ANNUEL" {...register('paiementLocation')} />
                                            <span>Annuel</span>
                                        </label>
                                        <label className="radio-label">
                                            <input type="radio" value="SEMESTRIEL" {...register('paiementLocation')} />
                                            <span>Semestriel</span>
                                        </label>
                                        <label className="radio-label">
                                            <input type="radio" value="JOURNALIER" {...register('paiementLocation')} />
                                            <span>Journalier</span>
                                        </label>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="existing-owner"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {/* Existing Owner Selection - Allows adding a new property to an existing client */}
                            <div className="form-section">
                                <div className="form-group">
                                    <label htmlFor="proprietaireId">
                                        Sélectionner un propriétaire existant <span className="required">*</span>
                                    </label>
                                    <select id="proprietaireId" {...register('proprietaireId', { valueAsNumber: true })}>
                                        <option value="">Sélectionner...</option>
                                        {/* TODO: Load from backend */}
                                        <option value="1">Benali Ahmed - 0555123456</option>
                                        <option value="2">Mokhtar Sara - 0666789012</option>
                                    </select>
                                </div>
                                <div className="form-info">
                                    <p>💡 Sélectionnez un client existant pour ajouter un nouveau bien à son portefeuille.</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

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

export default Page2OwnerInfo;

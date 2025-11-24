import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getDetailsSchema } from '../../utils/wizardSchemas';
import { useWizard } from '../../contexts/WizardContext';

const Page3PropertyDetails = () => {
    const { formData, updateFormData, markPageAsValidated, nextStep, prevStep } = useWizard();

    const propertyType = formData.basicInfo?.type;
    const detailsSchema = getDetailsSchema(propertyType);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm({
        resolver: zodResolver(detailsSchema),
        defaultValues: formData.propertyDetails,
    });

    const onSubmit = (data) => {
        updateFormData('propertyDetails', data);
        markPageAsValidated(3);
        nextStep();
    };

    if (!propertyType) {
        return (
            <div className="wizard-page">
                <div className="error-state">
                    <p>Veuillez sélectionner un type de bien à la page 1</p>
                    <button className="btn-secondary" onClick={prevStep}>
                        Retour
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="wizard-page">
            <h2 className="wizard-page-title">Détails du Bien</h2>
            <p className="wizard-page-subtitle">Caractéristiques spécifiques pour {propertyType}</p>

            <form onSubmit={handleSubmit(onSubmit)} className="wizard-form">
                {/* APPARTEMENT Details */}
                {propertyType === 'APPARTEMENT' && (
                    <>
                        <div className="form-section">
                            <h3 className="section-title">Type et Surface</h3>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="typeAppart">Type d'appartement</label>
                                    <select id="typeAppart" {...register('typeAppart')}>
                                        <option value="">Sélectionner...</option>
                                        <option value="Studio">Studio</option>
                                        <option value="F2">F2</option>
                                        <option value="F3">F3</option>
                                        <option value="F4">F4</option>
                                        <option value="F5">F5</option>
                                        <option value="F6">F6</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="surfaceTotal">Surface totale (m²)</label>
                                    <input
                                        id="surfaceTotal"
                                        type="number"
                                        step="0.01"
                                        placeholder="120"
                                        {...register('surfaceTotal', { valueAsNumber: true })}
                                        className={errors.surfaceTotal ? 'error' : ''}
                                    />
                                    {errors.surfaceTotal && <span className="error-message">{errors.surfaceTotal.message}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="surfaceSalon">Surface salon (m²)</label>
                                    <input
                                        id="surfaceSalon"
                                        type="number"
                                        step="0.01"
                                        {...register('surfaceSalon', { valueAsNumber: true })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="surfaceChambre">Surface chambre (m²)</label>
                                    <input
                                        id="surfaceChambre"
                                        type="number"
                                        step="0.01"
                                        {...register('surfaceChambre', { valueAsNumber: true })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="surfaceCuisine">Surface cuisine (m²)</label>
                                    <input
                                        id="surfaceCuisine"
                                        type="number"
                                        step="0.01"
                                        {...register('surfaceCuisine', { valueAsNumber: true })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="surfaceSDB">Surface SDB (m²)</label>
                                    <input
                                        id="surfaceSDB"
                                        type="number"
                                        step="0.01"
                                        {...register('surfaceSDB', { valueAsNumber: true })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="etage">Étage</label>
                                    <input
                                        id="etage"
                                        type="number"
                                        placeholder="Ex: 3"
                                        {...register('etage', { valueAsNumber: true })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="anneeConstruction">Année de construction</label>
                                    <input
                                        id="anneeConstruction"
                                        type="number"
                                        placeholder="Ex: 2020"
                                        {...register('anneeConstruction', { valueAsNumber: true })}
                                        className={errors.anneeConstruction ? 'error' : ''}
                                    />
                                    {errors.anneeConstruction && <span className="error-message">{errors.anneeConstruction.message}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="finition">Finition</label>
                                    <input
                                        id="finition"
                                        type="text"
                                        placeholder="Ex: Haut standing"
                                        {...register('finition')}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <h3 className="section-title">Équipements</h3>
                            <div className="checkbox-grid">
                                <label className="checkbox-label">
                                    <input type="checkbox" {...register('ascenseur')} />
                                    <span>Ascenseur</span>
                                </label>
                                <label className="checkbox-label">
                                    <input type="checkbox" {...register('climatisation')} />
                                    <span>Climatisation</span>
                                </label>
                                <label className="checkbox-label">
                                    <input type="checkbox" {...register('cuisineEquipee')} />
                                    <span>Cuisine équipée</span>
                                </label>
                                <label className="checkbox-label">
                                    <input type="checkbox" {...register('meuble')} />
                                    <span>Meublé</span>
                                </label>
                                <label className="checkbox-label">
                                    <input type="checkbox" {...register('parking')} />
                                    <span>Parking</span>
                                </label>
                                <label className="checkbox-label">
                                    <input type="checkbox" {...register('gardinage')} />
                                    <span>Gardinage</span>
                                </label>
                            </div>

                            <div className="form-group">
                                <label htmlFor="chauffage">Type de chauffage</label>
                                <select id="chauffage" {...register('chauffage')}>
                                    <option value="">Aucun</option>
                                    <option value="CENTRAL">Central</option>
                                    <option value="BAINS">Bains</option>
                                    <option value="AUTRE">Autre</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-section">
                            <h3 className="section-title">Proximité</h3>
                            <div className="checkbox-grid">
                                <label className="checkbox-label">
                                    <input type="checkbox" {...register('proximiteEcole')} />
                                    <span>École</span>
                                </label>
                                <label className="checkbox-label">
                                    <input type="checkbox" {...register('proximitePlage')} />
                                    <span>Plage</span>
                                </label>
                                <label className="checkbox-label">
                                    <input type="checkbox" {...register('proximiteAeroport')} />
                                    <span>Aéroport</span>
                                </label>
                            </div>

                            <div className="form-group">
                                <label htmlFor="proximiteTransport">Transport à proximité</label>
                                <select id="proximiteTransport" {...register('proximiteTransport')}>
                                    <option value="">Aucun</option>
                                    <option value="BUS">Bus</option>
                                    <option value="TRAMWAY">Tramway</option>
                                    <option value="METRO">Métro</option>
                                    <option value="TRAIN">Train</option>
                                </select>
                            </div>
                        </div>
                    </>
                )}

                {/* TERRAIN Details */}
                {propertyType === 'TERRAIN' && (
                    <div className="form-section">
                        <h3 className="section-title">Caractéristiques du Terrain</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="surface">
                                    Surface (m²) <span className="required">*</span>
                                </label>
                                <input
                                    id="surface"
                                    type="number"
                                    step="0.01"
                                    placeholder="500"
                                    {...register('surface', { valueAsNumber: true })}
                                    className={errors.surface ? 'error' : ''}
                                />
                                {errors.surface && <span className="error-message">{errors.surface.message}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="vocation">Vocation</label>
                                <input
                                    id="vocation"
                                    type="text"
                                    placeholder="Résidentiel, Commercial..."
                                    {...register('vocation')}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="longueur">Longueur (m)</label>
                                <input
                                    id="longueur"
                                    type="number"
                                    step="0.01"
                                    {...register('longueur', { valueAsNumber: true })}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="largeur">Largeur (m)</label>
                                <input
                                    id="largeur"
                                    type="number"
                                    step="0.01"
                                    {...register('largeur', { valueAsNumber: true })}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="facades">Nombre de façades</label>
                                <input
                                    id="facades"
                                    type="number"
                                    placeholder="1, 2, 3..."
                                    {...register('facades', { valueAsNumber: true })}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="statutJuridique">Statut juridique</label>
                                <input
                                    id="statutJuridique"
                                    type="text"
                                    placeholder="Acte, Livret foncier..."
                                    {...register('statutJuridique')}
                                />
                            </div>
                        </div>

                        <div className="checkbox-grid">
                            <label className="checkbox-label">
                                <input type="checkbox" {...register('viabilise')} />
                                <span>Viabilisé</span>
                            </label>
                        </div>
                    </div>
                )}

                {/* VILLA Details */}
                {propertyType === 'VILLA' && (
                    <>
                        <div className="form-section">
                            <h3 className="section-title">Terrain</h3>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="surface">
                                        Surface totale (m²) <span className="required">*</span>
                                    </label>
                                    <input
                                        id="surface"
                                        type="number"
                                        step="0.01"
                                        {...register('surface', { valueAsNumber: true })}
                                        className={errors.surface ? 'error' : ''}
                                    />
                                    {errors.surface && <span className="error-message">{errors.surface.message}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="vocation">Vocation</label>
                                    <input id="vocation" type="text" {...register('vocation')} />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="longueur">Longueur (m)</label>
                                    <input id="longueur" type="number" step="0.01" {...register('longueur', { valueAsNumber: true })} />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="largeur">Largeur (m)</label>
                                    <input id="largeur" type="number" step="0.01" {...register('largeur', { valueAsNumber: true })} />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="facades">Nombre de façades</label>
                                    <input id="facades" type="number" {...register('facades', { valueAsNumber: true })} />
                                </div>

                                <label className="checkbox-label">
                                    <input type="checkbox" {...register('viabilise')} />
                                    <span>Viabilisé</span>
                                </label>
                            </div>
                        </div>

                        <div className="form-section">
                            <h3 className="section-title">Villa</h3>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="surfaceBatie">Surface bâtie (m²)</label>
                                    <input id="surfaceBatie" type="number" step="0.01" {...register('surfaceBatie', { valueAsNumber: true })} />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="etages">Nombre d'étages</label>
                                    <input id="etages" type="number" placeholder="R+1, R+2..." {...register('etages', { valueAsNumber: true })} />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="pieces">Nombre de pièces</label>
                                    <input id="pieces" type="number" {...register('pieces', { valueAsNumber: true })} />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="etat">État</label>
                                    <select id="etat" {...register('etat')}>
                                        <option value="">Sélectionner...</option>
                                        <option value="RECENTE">Récente</option>
                                        <option value="A_DEMOLIR">À démolir</option>
                                        <option value="A_REFAIRE">À refaire</option>
                                    </select>
                                </div>

                                <div className="form-group full-width">
                                    <label htmlFor="composition">Composition</label>
                                    <input
                                        id="composition"
                                        type="text"
                                        placeholder="Duplex, Appartements..."
                                        {...register('composition')}
                                    />
                                </div>
                            </div>

                            <div className="checkbox-grid">
                                <label className="checkbox-label">
                                    <input type="checkbox" {...register('jardin')} />
                                    <span>Jardin</span>
                                </label>
                                <label className="checkbox-label">
                                    <input type="checkbox" {...register('garage')} />
                                    <span>Garage</span>
                                </label>
                                <label className="checkbox-label">
                                    <input type="checkbox" {...register('piscine')} />
                                    <span>Piscine</span>
                                </label>
                            </div>
                        </div>
                    </>
                )}

                {/* LOCAL Details */}
                {propertyType === 'LOCAL' && (
                    <div className="form-section">
                        <h3 className="section-title">Caractéristiques du Local</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="surface">
                                    Surface (m²) <span className="required">*</span>
                                </label>
                                <input
                                    id="surface"
                                    type="number"
                                    step="0.01"
                                    {...register('surface', { valueAsNumber: true })}
                                    className={errors.surface ? 'error' : ''}
                                />
                                {errors.surface && <span className="error-message">{errors.surface.message}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="typeActivite">Type d'activité</label>
                                <select id="typeActivite" {...register('typeActivite')}>
                                    <option value="">Sélectionner...</option>
                                    <option value="BUREAU">Bureau</option>
                                    <option value="OPEN_SPACE">Open Space</option>
                                    <option value="RDC">RDC</option>
                                    <option value="AUTRE">Autre</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="hauteur">Hauteur sous plafond (m)</label>
                                <input id="hauteur" type="number" step="0.01" {...register('hauteur', { valueAsNumber: true })} />
                            </div>

                            <div className="form-group">
                                <label htmlFor="facades">Nombre de façades</label>
                                <input id="facades" type="number" {...register('facades', { valueAsNumber: true })} />
                            </div>
                        </div>
                    </div>
                )}

                {/* IMMEUBLE Details */}
                {propertyType === 'IMMEUBLE' && (
                    <>
                        <div className="form-section">
                            <h3 className="section-title">Terrain et Base</h3>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="surface">
                                        Surface totale (m²) <span className="required">*</span>
                                    </label>
                                    <input
                                        id="surface"
                                        type="number"
                                        step="0.01"
                                        {...register('surface', { valueAsNumber: true })}
                                        className={errors.surface ? 'error' : ''}
                                    />
                                    {errors.surface && <span className="error-message">{errors.surface.message}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="surfaceBatie">Surface bâtie (m²)</label>
                                    <input id="surfaceBatie" type="number" step="0.01" {...register('surfaceBatie', { valueAsNumber: true })} />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="surfaceSol">Surface au sol (m²)</label>
                                    <input id="surfaceSol" type="number" step="0.01" {...register('surfaceSol', { valueAsNumber: true })} />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="etages">Nombre d'étages</label>
                                    <input id="etages" type="number" {...register('etages', { valueAsNumber: true })} />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="nbAppartements">Nombre d'appartements</label>
                                    <input id="nbAppartements" type="number" {...register('nbAppartements', { valueAsNumber: true })} />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="etat">État</label>
                                    <select id="etat" {...register('etat')}>
                                        <option value="">Sélectionner...</option>
                                        <option value="RECENTE">Récente</option>
                                        <option value="A_DEMOLIR">À démolir</option>
                                        <option value="A_REFAIRE">À refaire</option>
                                    </select>
                                </div>
                            </div>

                            <div className="checkbox-grid">
                                <label className="checkbox-label">
                                    <input type="checkbox" {...register('viabilise')} />
                                    <span>Viabilisé</span>
                                </label>
                                <label className="checkbox-label">
                                    <input type="checkbox" {...register('jardin')} />
                                    <span>Jardin</span>
                                </label>
                                <label className="checkbox-label">
                                    <input type="checkbox" {...register('garage')} />
                                    <span>Garage</span>
                                </label>
                                <label className="checkbox-label">
                                    <input type="checkbox" {...register('piscine')} />
                                    <span>Piscine</span>
                                </label>
                            </div>
                        </div>
                    </>
                )}

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

export default Page3PropertyDetails;

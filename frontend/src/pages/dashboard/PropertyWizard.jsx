import React, { useState } from 'react';
import { Check, ChevronRight, ChevronLeft } from 'lucide-react';
import PageTransition from '../../components/PageTransition';

const PropertyWizard = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        // Step 1: Basic Info
        title: '',
        type: '',
        price: '',
        // Step 2: Details
        address: '',
        description: '',
        surface: '',
        // Step 3: Confirmation (no new data)
    });

    const steps = [
        { id: 1, title: 'Informations de base' },
        { id: 2, title: 'Détails du bien' },
        { id: 3, title: 'Confirmation' },
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateStep = (step) => {
        if (step === 1) {
            return formData.title && formData.type && formData.price;
        }
        if (step === 2) {
            return formData.address && formData.surface;
        }
        return true;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, steps.length));
        } else {
            alert('Veuillez remplir tous les champs obligatoires.');
        }
    };

    const handlePrev = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmit = () => {
        console.log('Form submitted:', formData);
        alert('Bien ajouté avec succès !');
        // Redirect or reset
    };

    return (
        <PageTransition>
            <div className="page-container">
                <header className="page-header">
                    <div>
                        <h1 className="page-title">Nouveau Bien</h1>
                        <p className="page-subtitle">Ajouter une nouvelle propriété au catalogue</p>
                    </div>
                </header>

                <div className="wizard-container">
                    {/* Progress Bar */}
                    <div className="wizard-progress">
                        {steps.map((step, index) => (
                            <div key={step.id} className={`progress-step ${currentStep >= step.id ? 'active' : ''}`}>
                                <div className="step-indicator">
                                    {currentStep > step.id ? <Check size={16} /> : step.id}
                                </div>
                                <span className="step-label">{step.title}</span>
                                {index < steps.length - 1 && <div className="step-line"></div>}
                            </div>
                        ))}
                    </div>

                    {/* Step Content */}
                    <div className="wizard-content">
                        {currentStep === 1 && (
                            <div className="step-form fade-in">
                                <h2>Informations Générales</h2>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Titre du bien</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            placeholder="Ex: Villa avec piscine"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Type de bien</label>
                                        <select name="type" value={formData.type} onChange={handleChange}>
                                            <option value="">Sélectionner...</option>
                                            <option value="villa">Villa</option>
                                            <option value="appartement">Appartement</option>
                                            <option value="terrain">Terrain</option>
                                            <option value="local">Local Commercial</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Prix (DA)</label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleChange}
                                            placeholder="Ex: 25000000"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="step-form fade-in">
                                <h2>Détails et Localisation</h2>
                                <div className="form-grid">
                                    <div className="form-group full-width">
                                        <label>Adresse complète</label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            placeholder="Adresse du bien"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Surface (m²)</label>
                                        <input
                                            type="number"
                                            name="surface"
                                            value={formData.surface}
                                            onChange={handleChange}
                                            placeholder="Ex: 150"
                                        />
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Description</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            placeholder="Description détaillée du bien..."
                                            rows="4"
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="step-form fade-in">
                                <h2>Récapitulatif</h2>
                                <div className="review-card">
                                    <div className="review-item">
                                        <span className="label">Titre:</span>
                                        <span className="value">{formData.title}</span>
                                    </div>
                                    <div className="review-item">
                                        <span className="label">Type:</span>
                                        <span className="value">{formData.type}</span>
                                    </div>
                                    <div className="review-item">
                                        <span className="label">Prix:</span>
                                        <span className="value">{formData.price} DA</span>
                                    </div>
                                    <div className="review-item">
                                        <span className="label">Adresse:</span>
                                        <span className="value">{formData.address}</span>
                                    </div>
                                    <div className="review-item">
                                        <span className="label">Surface:</span>
                                        <span className="value">{formData.surface} m²</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="wizard-actions">
                        <button
                            className="btn-secondary"
                            onClick={handlePrev}
                            disabled={currentStep === 1}
                        >
                            <ChevronLeft size={18} /> Précédent
                        </button>

                        {currentStep < steps.length ? (
                            <button className="btn-primary" onClick={handleNext}>
                                Suivant <ChevronRight size={18} />
                            </button>
                        ) : (
                            <button className="btn-success" onClick={handleSubmit}>
                                Confirmer et Ajouter <Check size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default PropertyWizard;

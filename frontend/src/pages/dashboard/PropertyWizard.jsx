import React from 'react';
import { Check } from 'lucide-react';
import PageTransition from '../../components/PageTransition';
import { WizardProvider, useWizard } from '../../contexts/WizardContext';
import Page1BasicInfo from '../../components/wizard/Page1BasicInfo';
import Page2OwnerInfo from '../../components/wizard/Page2OwnerInfo';
import Page3PropertyDetails from '../../components/wizard/Page3PropertyDetails';
import Page4Documents from '../../components/wizard/Page4Documents';
import Page5Tracking from '../../components/wizard/Page5Tracking';
import Page6Attachments from '../../components/wizard/Page6Attachments';
import Page7Summary from '../../components/wizard/Page7Summary';
import '../../styles/wizard.css';

const WizardContent = () => {
    const { currentStep, validatedPages, goToStep } = useWizard();

    const steps = [
        { id: 1, title: 'Informations de base', component: Page1BasicInfo },
        { id: 2, title: 'Propriétaire', component: Page2OwnerInfo },
        { id: 3, title: 'Détails du bien', component: Page3PropertyDetails },
        { id: 4, title: 'Documents', component: Page4Documents },
        { id: 5, title: 'Suivi', component: Page5Tracking },
        { id: 6, title: 'Pièces jointes', component: Page6Attachments },
        { id: 7, title: 'Récapitulatif', component: Page7Summary },
    ];

    const CurrentPageComponent = steps[currentStep - 1]?.component;

    // Check if a step is clickable
    const isStepClickable = (stepId) => {
        // Current step is always clickable
        if (stepId === currentStep) return true;
        
        // Completed steps (with checkmark) are always clickable
        if (currentStep > stepId) return true;
        
        // For future steps, check if all previous steps are validated
        if (stepId > currentStep) {
            // Check if all steps before this one are validated
            for (let i = 1; i < stepId; i++) {
                if (!validatedPages.has(i)) {
                    return false;
                }
            }
            return true;
        }
        
        return false;
    };

    const handleStepClick = (stepId) => {
        if (isStepClickable(stepId)) {
            goToStep(stepId);
        }
    };

    return (
        <PageTransition>
            <div className="page-container wizard-container-wrapper">
                <header className="page-header">
                    <div>
                        <h1 className="page-title">Nouveau Bien Immobilier</h1>
                        <p className="page-subtitle">Ajouter une nouvelle propriété au catalogue</p>
                    </div>
                </header>

                <div className="wizard-wrapper">
                    {/* Progress Indicator */}
                    <div className="wizard-progress-bar">
                        {steps.map((step, index) => {
                            const clickable = isStepClickable(step.id);
                            return (
                                <div
                                    key={step.id}
                                    className={`progress-step ${currentStep >= step.id ? 'active' : ''} ${currentStep === step.id ? 'current' : ''
                                        } ${clickable ? 'clickable' : 'disabled'}`}
                                    onClick={() => handleStepClick(step.id)}
                                    style={{
                                        cursor: clickable ? 'pointer' : 'not-allowed',
                                        opacity: clickable ? 1 : 0.5,
                                    }}
                                    title={clickable ? `Aller à ${step.title}` : 'Complétez les étapes précédentes'}
                                >
                                    <div className="step-indicator">
                                        {currentStep > step.id ? (
                                            <Check size={16} className="check-icon" />
                                        ) : (
                                            <span>{step.id}</span>
                                        )}
                                    </div>
                                    <span className="step-label">{step.title}</span>
                                    {index < steps.length - 1 && <div className="step-line"></div>}
                                </div>
                            );
                        })}
                    </div>

                    {/* Step Counter */}
                    <div className="wizard-step-counter">
                        <span className="current-step">{currentStep}</span>
                        <span className="step-separator">/</span>
                        <span className="total-steps">{steps.length}</span>
                    </div>

                    {/* Current Page */}
                    <div className="wizard-page-container">
                        {CurrentPageComponent && <CurrentPageComponent />}
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

const PropertyWizard = () => {
    return (
        <WizardProvider>
            <WizardContent />
        </WizardProvider>
    );
};

export default PropertyWizard;

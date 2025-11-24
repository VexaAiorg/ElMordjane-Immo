import React, { createContext, useContext, useState } from 'react';

const WizardContext = createContext();

export const useWizard = () => {
    const context = useContext(WizardContext);
    if (!context) {
        throw new Error('useWizard must be used within WizardProvider');
    }
    return context;
};

export const WizardProvider = ({ children }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        // Page 1: Basic Info
        basicInfo: {},
        // Page 2: Owner
        owner: {},
        // Page 3: Property Details (dynamic)
        propertyDetails: {},
        // Page 4: Documents
        documents: { papiers: [] },
        // Page 5: Tracking
        tracking: {
            estVisite: false,
            priorite: 'NORMAL',
            aMandat: false,
        },
        // Page 6: Attachments
        attachments: { piecesJointes: [] },
    });

    const [fileUploads, setFileUploads] = useState({
        documents: [],
        photos: [],
        localisation: [],
    });

    const [validatedPages, setValidatedPages] = useState(new Set());

    const updateFormData = (page, data) => {
        setFormData((prev) => ({
            ...prev,
            [page]: { ...prev[page], ...data },
        }));
    };

    const updateFileUploads = (type, files) => {
        setFileUploads((prev) => ({
            ...prev,
            [type]: files,
        }));
    };

    const markPageAsValidated = (pageNumber) => {
        setValidatedPages((prev) => new Set([...prev, pageNumber]));
    };

    const goToStep = (step) => {
        // Only allow going to the next step if current step is validated
        // Or allow going back to any previous step
        if (step <= currentStep + 1 || step < currentStep) {
            setCurrentStep(step);
        }
    };

    const nextStep = () => {
        if (currentStep < 7) {
            setCurrentStep((prev) => prev + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    const resetWizard = () => {
        setCurrentStep(1);
        setFormData({
            basicInfo: {},
            owner: {},
            propertyDetails: {},
            documents: { papiers: [] },
            tracking: {
                estVisite: false,
                priorite: 'NORMAL',
                aMandat: false,
            },
            attachments: { piecesJointes: [] },
        });
        setFileUploads({
            documents: [],
            photos: [],
            localisation: [],
        });
        setValidatedPages(new Set());
    };

    const value = {
        currentStep,
        formData,
        fileUploads,
        validatedPages,
        updateFormData,
        updateFileUploads,
        markPageAsValidated,
        goToStep,
        nextStep,
        prevStep,
        resetWizard,
    };

    return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>;
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const WizardContext = createContext();

const STORAGE_KEY = 'wizardFormData';

export const useWizard = () => {
    const context = useContext(WizardContext);
    if (!context) {
        throw new Error('useWizard must be used within WizardProvider');
    }
    return context;
};

export const WizardProvider = ({ children }) => {
    const navigate = useNavigate();
    const { step: urlStep } = useParams();

    // Initialize state from localStorage or defaults
    const getInitialState = () => {
        try {
            const saved = sessionStorage.getItem(STORAGE_KEY);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            console.error('Error loading wizard data from sessionStorage:', error);
        }
        return {
            currentStep: 1,
            formData: {
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
            },
            validatedPages: [],
        };
    };

    const initialState = getInitialState();

    // Initialize currentStep from URL if available, otherwise from saved state
    const getInitialStep = () => {
        if (urlStep) {
            const stepNum = parseInt(urlStep, 10);
            if (stepNum >= 1 && stepNum <= 7) {
                return stepNum;
            }
        }
        return initialState.currentStep;
    };

    const [currentStep, setCurrentStep] = useState(getInitialStep());
    const [formData, setFormData] = useState(initialState.formData);
    const [fileUploads, setFileUploads] = useState({
        documents: [],
        photos: [],
        localisation: [],
    });
    const [validatedPages, setValidatedPages] = useState(new Set(initialState.validatedPages));

    // Sync URL with currentStep
    useEffect(() => {
        navigate(`/dashboard/wizard/${currentStep}`, { replace: true });
    }, [currentStep, navigate]);

    // Sync currentStep with URL parameter changes (for browser back/forward)
    useEffect(() => {
        if (urlStep) {
            const stepNum = parseInt(urlStep, 10);
            if (stepNum >= 1 && stepNum <= 7 && stepNum !== currentStep) {
                setCurrentStep(stepNum);
            }
        }
    }, [urlStep]);

    // Save to sessionStorage whenever state changes
    useEffect(() => {
        try {
            const dataToSave = {
                currentStep,
                formData,
                validatedPages: Array.from(validatedPages),
            };
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
        } catch (error) {
            console.error('Error saving wizard data to sessionStorage:', error);
        }
    }, [currentStep, formData, validatedPages]);

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
        // Clear sessionStorage
        sessionStorage.removeItem(STORAGE_KEY);
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

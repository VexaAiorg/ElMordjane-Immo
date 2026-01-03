import React, { useState, useEffect } from 'react';
import { Search, Calendar, X, User, FileText, Clock, Send, XCircle } from 'lucide-react';
import PageTransition from '../../components/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';
import { createDemande, getAllDemandes } from '../../api/api';

const Demande = () => {
    // Form state
    const [formData, setFormData] = useState({
        prenom: '',
        nom: '',
        description: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // List state
    const [demandes, setDemandes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchDemandes();
    }, []);

    const fetchDemandes = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getAllDemandes();
            setDemandes(response.data || []);
        } catch (err) {
            console.error('Error fetching demandes:', err);
            setError(err.message || 'Erreur lors du chargement des demandes');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.prenom.trim() || !formData.nom.trim() || !formData.description.trim()) {
            alert('Veuillez remplir tous les champs');
            return;
        }

        try {
            setIsSubmitting(true);
            await createDemande(formData);

            // Reset form
            setFormData({
                prenom: '',
                nom: '',
                description: ''
            });

            // Refresh list
            await fetchDemandes();

            alert('✅ Demande créée avec succès!');
        } catch (err) {
            console.error('Error creating demande:', err);
            alert('Erreur lors de la création de la demande: ' + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            prenom: '',
            nom: '',
            description: ''
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    // Filter demandes based on search
    const filteredDemandes = demandes.filter(demande => {
        const searchLower = searchQuery.toLowerCase();
        return (
            demande.prenom.toLowerCase().includes(searchLower) ||
            demande.nom.toLowerCase().includes(searchLower) ||
            demande.description.toLowerCase().includes(searchLower)
        );
    });

    return (
        <PageTransition>
            <div className="page-container">
                <header className="page-header">
                    <div>
                        <h1 className="page-title">Demandes Clients</h1>
                        <p className="page-subtitle">Gérer les demandes des clients</p>
                    </div>
                </header>

                <div className="demande-layout">
                    {/* Form Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="demande-form-section"
                    >
                        <div className="form-card">
                            <div className="form-card-header">
                                <FileText size={24} />
                                <h2>Nouvelle Demande</h2>
                            </div>

                            <form onSubmit={handleSubmit} className="demande-form">
                                <div className="form-group">
                                    <label htmlFor="prenom">
                                        <User size={16} />
                                        Prénom
                                    </label>
                                    <input
                                        type="text"
                                        id="prenom"
                                        name="prenom"
                                        value={formData.prenom}
                                        onChange={handleInputChange}
                                        placeholder="Entrez le prénom"
                                        disabled={isSubmitting}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="nom">
                                        <User size={16} />
                                        Nom
                                    </label>
                                    <input
                                        type="text"
                                        id="nom"
                                        name="nom"
                                        value={formData.nom}
                                        onChange={handleInputChange}
                                        placeholder="Entrez le nom"
                                        disabled={isSubmitting}
                                        required
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label htmlFor="description">
                                        <FileText size={16} />
                                        Description de la demande
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Décrivez la demande du client..."
                                        rows="6"
                                        disabled={isSubmitting}
                                        required
                                    />
                                </div>

                                <div className="form-actions">
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="btn-secondary"
                                        disabled={isSubmitting}
                                    >
                                        <XCircle size={18} />
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-primary"
                                        disabled={isSubmitting}
                                    >
                                        <Send size={18} />
                                        {isSubmitting ? 'Envoi...' : 'Soumettre'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>

                    {/* List Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="demande-list-section"
                    >
                        <div className="list-card">
                            <div className="list-card-header">
                                <div>
                                    <h2>Toutes les Demandes</h2>
                                    <p className="list-subtitle">
                                        {filteredDemandes.length} demande{filteredDemandes.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                                <div className="search-wrapper-small">
                                    <Search size={16} className="search-icon" />
                                    <input
                                        type="text"
                                        placeholder="Rechercher..."
                                        className="search-input-small"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="demandes-list">
                                {loading ? (
                                    <div className="list-empty">
                                        <Clock size={48} />
                                        <p>Chargement des demandes...</p>
                                    </div>
                                ) : error ? (
                                    <div className="list-error">
                                        <X size={48} />
                                        <p>{error}</p>
                                    </div>
                                ) : filteredDemandes.length === 0 ? (
                                    <div className="list-empty">
                                        <FileText size={48} />
                                        <p>
                                            {searchQuery
                                                ? `Aucune demande trouvée pour "${searchQuery}"`
                                                : 'Aucune demande pour le moment'}
                                        </p>
                                    </div>
                                ) : (
                                    <AnimatePresence mode="popLayout">
                                        {filteredDemandes.map((demande, index) => (
                                            <motion.div
                                                key={demande.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                transition={{ duration: 0.2, delay: index * 0.05 }}
                                                className="demande-item"
                                            >
                                                <div className="demande-item-header">
                                                    <div className="demande-client">
                                                        <User size={18} />
                                                        <span className="client-name">
                                                            {demande.prenom} {demande.nom}
                                                        </span>
                                                    </div>
                                                    <div className="demande-date">
                                                        <Calendar size={14} />
                                                        <span>{formatDate(demande.dateDemande)}</span>
                                                    </div>
                                                </div>
                                                <div className="demande-description">
                                                    {demande.description}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <style jsx>{`
                .demande-layout {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 2rem;
                    margin-top: 2rem;
                }

                .form-card,
                .list-card {
                    background: var(--glass-bg);
                    border-radius: 16px;
                    padding: 2rem;
                    backdrop-filter: blur(10px);
                    border: 1px solid var(--glass-border);
                    height: fit-content;
                }

                .form-card-header,
                .list-card-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 2rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid var(--glass-border);
                }

                .form-card-header h2,
                .list-card-header h2 {
                    font-size: 1.5rem;
                    color: var(--text-primary);
                    margin: 0;
                }

                .list-card-header {
                    justify-content: space-between;
                }

                .list-subtitle {
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                    margin-top: 0.25rem;
                }

                .demande-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .form-group label {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.9rem;
                    color: var(--text-secondary);
                    margin-bottom: 0.5rem;
                }

                .form-group input,
                .form-group textarea {
                    width: 100%;
                    background: var(--bg-input);
                    border: 1px solid var(--border-primary);
                    padding: 0.75rem;
                    border-radius: 8px;
                    color: var(--text-primary);
                    font-size: 1rem;
                    outline: none;
                    transition: border-color 0.2s;
                    font-family: inherit;
                }

                .form-group input:focus,
                .form-group textarea:focus {
                    border-color: var(--accent-info);
                }

                .form-group textarea {
                    resize: vertical;
                    min-height: 120px;
                }

                .form-actions {
                    display: flex;
                    gap: 1rem;
                    margin-top: 1rem;
                }

                .search-wrapper-small {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: rgba(0, 0, 0, 0.2);
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    min-width: 250px;
                }

                .search-input-small {
                    background: transparent;
                    border: none;
                    color: var(--text-primary);
                    width: 100%;
                    outline: none;
                    font-size: 0.9rem;
                }

                .demandes-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    max-height: 600px;
                    overflow-y: auto;
                    padding-right: 0.5rem;
                }

                .demandes-list::-webkit-scrollbar {
                    width: 6px;
                }

                .demandes-list::-webkit-scrollbar-track {
                    background: rgba(0, 0, 0, 0.2);
                    border-radius: 3px;
                }

                .demandes-list::-webkit-scrollbar-thumb {
                    background: var(--accent-info);
                    border-radius: 3px;
                }

                .demande-item {
                    background: rgba(0, 0, 0, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    padding: 1.25rem;
                    transition: all 0.2s;
                }

                .demande-item:hover {
                    background: rgba(0, 0, 0, 0.3);
                    border-color: var(--accent-info);
                    transform: translateY(-2px);
                }

                .demande-item-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }

                .demande-client {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .client-name {
                    font-weight: 600;
                    color: var(--text-primary);
                    font-size: 1.05rem;
                }

                .demande-date {
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                }

                .demande-description {
                    color: var(--text-primary);
                    line-height: 1.6;
                    font-size: 0.95rem;
                }

                .list-empty,
                .list-error {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 3rem 2rem;
                    text-align: center;
                    color: var(--text-secondary);
                    gap: 1rem;
                }

                .list-error {
                    color: var(--accent-error);
                }

                /* Responsive Design */
                @media (max-width: 1024px) {
                    .demande-layout {
                        grid-template-columns: 1fr;
                    }

                    .list-card-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 1rem;
                    }

                    .search-wrapper-small {
                        width: 100%;
                        min-width: unset;
                    }
                }

                @media (max-width: 768px) {
                    .demande-layout {
                        gap: 1.5rem;
                    }

                    .form-card,
                    .list-card {
                        padding: 1.5rem;
                    }

                    .form-card-header h2,
                    .list-card-header h2 {
                        font-size: 1.25rem;
                    }

                    .form-actions {
                        flex-direction: column;
                    }

                    .form-actions button {
                        width: 100%;
                    }

                    .demande-item-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 0.5rem;
                    }

                    .demandes-list {
                        max-height: 500px;
                    }
                }

                @media (max-width: 480px) {
                    .form-card,
                    .list-card {
                        padding: 1rem;
                    }

                    .form-card-header,
                    .list-card-header {
                        margin-bottom: 1.5rem;
                    }

                    .client-name {
                        font-size: 1rem;
                    }

                    .demande-description {
                        font-size: 0.9rem;
                    }
                }
            `}</style>
        </PageTransition>
    );
};

export default Demande;

import React, { useState, useEffect } from 'react';
import { Search, Calendar, X, User, FileText, Clock, Send, XCircle, Eye, Edit, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import PageTransition from '../../components/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';
import { createDemande, getAllDemandes, updateDemande, deleteDemande } from '../../api/api';

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

    // Modal states
    const [viewModal, setViewModal] = useState({ isOpen: false, data: null });
    const [editModal, setEditModal] = useState({ isOpen: false, data: null });
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, data: null });

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

    // --- CRUD Actions ---

    // VIEW
    const handleView = (demande) => {
        setViewModal({ isOpen: true, data: demande });
    };

    // EDIT
    const handleEdit = (demande) => {
        setEditModal({ isOpen: true, data: { ...demande } });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            await updateDemande(editModal.data.id, {
                prenom: editModal.data.prenom,
                nom: editModal.data.nom,
                description: editModal.data.description
            });
            setEditModal({ isOpen: false, data: null });
            await fetchDemandes();
        } catch (err) {
            console.error('Error updating demande:', err);
            alert('Erreur lors de la mise à jour: ' + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // DELETE
    const handleDelete = (demande) => {
        setDeleteModal({ isOpen: true, data: demande });
    };

    const confirmDelete = async () => {
        try {
            setIsSubmitting(true);
            await deleteDemande(deleteModal.data.id);
            setDeleteModal({ isOpen: false, data: null });
            await fetchDemandes();
        } catch (err) {
            console.error('Error deleting demande:', err);
            alert('Erreur lors de la suppression: ' + err.message);
        } finally {
            setIsSubmitting(false);
        }
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
                                <div className="form-row">
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
                                            placeholder="Prénom"
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
                                            placeholder="Nom"
                                            disabled={isSubmitting}
                                            required
                                        />
                                    </div>
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
                                                <div className="demande-content">
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
                                                    <div className="demande-description-preview">
                                                        {demande.description.length > 100
                                                            ? demande.description.substring(0, 100) + '...'
                                                            : demande.description}
                                                    </div>
                                                </div>

                                                <div className="demande-actions">
                                                    <button
                                                        onClick={() => handleView(demande)}
                                                        className="action-btn view"
                                                        title="Voir"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(demande)}
                                                        className="action-btn edit"
                                                        title="Modifier"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(demande)}
                                                        className="action-btn delete"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* --- MODALS --- */}

                {/* View Modal */}
                <AnimatePresence>
                    {viewModal.isOpen && viewModal.data && (
                        <div className="modal-overlay">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="modal-content"
                            >
                                <div className="modal-header">
                                    <h3>Détails de la demande</h3>
                                    <button onClick={() => setViewModal({ isOpen: false, data: null })} className="close-btn">
                                        <X size={20} />
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <div className="detail-group">
                                        <label>Client</label>
                                        <p className="detail-value">{viewModal.data.prenom} {viewModal.data.nom}</p>
                                    </div>
                                    <div className="detail-group">
                                        <label>Date</label>
                                        <p className="detail-value">{formatDate(viewModal.data.dateDemande)}</p>
                                    </div>
                                    <div className="detail-group">
                                        <label>Description</label>
                                        <div className="description-box">
                                            {viewModal.data.description}
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button onClick={() => setViewModal({ isOpen: false, data: null })} className="btn-secondary">
                                        Fermer
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Edit Modal */}
                <AnimatePresence>
                    {editModal.isOpen && editModal.data && (
                        <div className="modal-overlay">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="modal-content"
                            >
                                <div className="modal-header">
                                    <h3>Modifier la demande</h3>
                                    <button onClick={() => setEditModal({ isOpen: false, data: null })} className="close-btn">
                                        <X size={20} />
                                    </button>
                                </div>
                                <form onSubmit={handleUpdate}>
                                    <div className="modal-body">
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Prénom</label>
                                                <input
                                                    type="text"
                                                    value={editModal.data.prenom}
                                                    onChange={(e) => setEditModal({
                                                        ...editModal,
                                                        data: { ...editModal.data, prenom: e.target.value }
                                                    })}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Nom</label>
                                                <input
                                                    type="text"
                                                    value={editModal.data.nom}
                                                    onChange={(e) => setEditModal({
                                                        ...editModal,
                                                        data: { ...editModal.data, nom: e.target.value }
                                                    })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group full-width">
                                            <label>Description</label>
                                            <textarea
                                                rows="6"
                                                value={editModal.data.description}
                                                onChange={(e) => setEditModal({
                                                    ...editModal,
                                                    data: { ...editModal.data, description: e.target.value }
                                                })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" onClick={() => setEditModal({ isOpen: false, data: null })} className="btn-secondary">
                                            Annuler
                                        </button>
                                        <button type="submit" className="btn-primary" disabled={isSubmitting}>
                                            {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Delete Confirmation Modal */}
                <AnimatePresence>
                    {deleteModal.isOpen && deleteModal.data && (
                        <div className="modal-overlay">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="modal-content delete-modal"
                            >
                                <div className="modal-body delete-body">
                                    <div className="delete-icon">
                                        <AlertTriangle size={48} />
                                    </div>
                                    <h3>Confirmer la suppression</h3>
                                    <p>
                                        Êtes-vous sûr de vouloir supprimer la demande de
                                        <strong> {deleteModal.data.prenom} {deleteModal.data.nom}</strong> ?
                                        Cette action est irréversible.
                                    </p>
                                </div>
                                <div className="modal-footer delete-footer">
                                    <button onClick={() => setDeleteModal({ isOpen: false, data: null })} className="btn-secondary">
                                        Annuler
                                    </button>
                                    <button onClick={confirmDelete} className="btn-danger" disabled={isSubmitting}>
                                        {isSubmitting ? 'Suppression...' : 'Supprimer'}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

            </div>

            <style jsx>{`
                .demande-layout {
                    display: grid;
                    grid-template-columns: 40% 1fr;
                    gap: 2rem;
                    margin-top: 2rem;
                    align-items: start;
                }

                .form-card,
                .list-card {
                    background: var(--glass-bg);
                    border-radius: 16px;
                    padding: 2rem;
                    backdrop-filter: blur(10px);
                    border: 1px solid var(--glass-border);
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
                    flex-wrap: wrap;
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

                .form-row {
                    display: flex;
                    gap: 1rem;
                }

                .form-group {
                    flex: 1;
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

                .demande-item {
                    background: rgba(0, 0, 0, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    padding: 1.25rem;
                    transition: all 0.2s;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 1rem;
                }

                .demande-item:hover {
                    background: rgba(0, 0, 0, 0.3);
                    border-color: var(--accent-info);
                }

                .demande-content {
                    flex: 1;
                }

                .demande-item-header {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 1rem;
                    align-items: center;
                    margin-bottom: 0.5rem;
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
                    background: rgba(255, 255, 255, 0.05);
                    padding: 0.25rem 0.5rem;
                    border-radius: 4px;
                }

                .demande-description-preview {
                    color: var(--text-secondary);
                    font-size: 0.95rem;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .demande-actions {
                    display: flex;
                    gap: 0.5rem;
                }

                .action-btn {
                    background: transparent;
                    border: none;
                    color: var(--text-secondary);
                    padding: 0.5rem;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .action-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: var(--text-primary);
                }

                .action-btn.view:hover {
                    color: var(--accent-info);
                    background: rgba(59, 130, 246, 0.1);
                }

                .action-btn.edit:hover {
                    color: var(--accent-warning);
                    background: rgba(245, 158, 11, 0.1);
                }

                .action-btn.delete:hover {
                    color: var(--accent-error);
                    background: rgba(239, 68, 68, 0.1);
                }

                /* Modal Styles */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(5px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 1rem;
                }

                .modal-content {
                    background: var(--bg-elevated);
                    border: 1px solid var(--glass-border);
                    border-radius: 16px;
                    width: 100%;
                    max-width: 600px;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
                    display: flex;
                    flex-direction: column;
                }

                .modal-header {
                    padding: 1.5rem;
                    border-bottom: 1px solid var(--glass-border);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .modal-header h3 {
                    margin: 0;
                    color: var(--text-primary);
                    font-size: 1.25rem;
                }

                .close-btn {
                    background: transparent;
                    border: none;
                    color: var(--text-secondary);
                    cursor: pointer;
                    padding: 0.5rem;
                    border-radius: 50%;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                }

                .close-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: var(--text-primary);
                }

                .modal-body {
                    padding: 2rem;
                    overflow-y: auto;
                }

                .detail-group {
                    margin-bottom: 1.5rem;
                }

                .detail-group label {
                    display: block;
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                    margin-bottom: 0.5rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .detail-value {
                    font-size: 1.1rem;
                    color: var(--text-primary);
                    font-weight: 500;
                }

                .description-box {
                    background: rgba(0, 0, 0, 0.2);
                    padding: 1rem;
                    border-radius: 8px;
                    color: var(--text-primary);
                    line-height: 1.6;
                    white-space: pre-wrap;
                }

                .modal-footer {
                    padding: 1.5rem;
                    border-top: 1px solid var(--glass-border);
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                }

                /* Delete Modal specific */
                .delete-modal {
                    max-width: 450px;
                    border-color: rgba(239, 68, 68, 0.3);
                }

                .delete-body {
                    text-align: center;
                    padding: 2.5rem 2rem;
                }

                .delete-icon {
                    width: 80px;
                    height: 80px;
                    background: rgba(239, 68, 68, 0.1);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 1.5rem;
                    color: var(--accent-error);
                }

                .delete-body h3 {
                    font-size: 1.5rem;
                    color: var(--text-primary);
                    margin-bottom: 1rem;
                }

                .delete-body p {
                    color: var(--text-secondary);
                    line-height: 1.5;
                }

                .btn-danger {
                    background: var(--accent-error);
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-danger:hover {
                    filter: brightness(1.1);
                }

                /* Responsive Design */
                @media (max-width: 1024px) {
                    .demande-layout {
                        grid-template-columns: 1fr;
                        /* Stack form on top of list */
                    }
                    
                    .demande-form-section {
                        margin-bottom: 0;
                    }
                }

                @media (max-width: 768px) {
                    .page-container {
                        padding-bottom: 5rem; /* Space for mobile nav if applicable */
                    }

                    .form-card, 
                    .list-card {
                        padding: 1.5rem;
                    }

                    .form-row {
                        flex-direction: column;
                        gap: 1.5rem;
                    }

                    .list-card-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 1rem;
                    }

                    .search-wrapper-small {
                        width: 100%;
                    }
                    
                    .demande-item {
                        flex-direction: column;
                        gap: 1rem;
                    }
                    
                    .demande-actions {
                        width: 100%;
                        justify-content: flex-end;
                        border-top: 1px solid rgba(255, 255, 255, 0.1);
                        padding-top: 0.75rem;
                    }
                }

                @media (max-width: 480px) {
                    .form-card,
                    .list-card {
                        padding: 1.25rem;
                    }

                    .form-card-header h2,
                    .list-card-header h2 {
                        font-size: 1.25rem;
                    }

                    .form-actions button {
                        width: 100%;
                        flex: 1;
                    }
                }
            `}</style>
        </PageTransition>
    );
};

export default Demande;

import React from 'react';

const OwnerInfoTab = ({ formData, onChange }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        onChange({ [name]: value });
    };

    const inputStyle = {
        width: '100%',
        padding: '0.75rem',
        background: 'var(--bg-input)',
        border: '1px solid var(--border-primary)',
        borderRadius: '8px',
        color: 'var(--text-primary)',
        fontSize: '1rem'
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '0.5rem',
        color: '#94a3b8',
        fontSize: '0.9rem',
        fontWeight: '500'
    };

    return (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
            <h3 style={{ color: '#cbd5e1', marginBottom: '0.5rem' }}>Informations Personnelles</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                    <label style={labelStyle}>Nom *</label>
                    <input
                        type="text"
                        name="nom"
                        value={formData.nom}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                        placeholder="Nom du propriétaire"
                    />
                </div>

                <div>
                    <label style={labelStyle}>Prénom *</label>
                    <input
                        type="text"
                        name="prenom"
                        value={formData.prenom}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                        placeholder="Prénom du propriétaire"
                    />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                    <label style={labelStyle}>Téléphone *</label>
                    <input
                        type="tel"
                        name="telephone"
                        value={formData.telephone}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                        placeholder="0555123456"
                    />
                </div>

                <div>
                    <label style={labelStyle}>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        style={inputStyle}
                        placeholder="email@example.com"
                    />
                </div>
            </div>

            <div>
                <label style={labelStyle}>Adresse</label>
                <input
                    type="text"
                    name="adresse"
                    value={formData.adresse}
                    onChange={handleChange}
                    style={inputStyle}
                    placeholder="Adresse du propriétaire"
                />
            </div>

            <h3 style={{ color: '#cbd5e1', marginTop: '1rem', marginBottom: '0.5rem' }}>Identité</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                    <label style={labelStyle}>Type d'identité</label>
                    <select
                        name="typeIdentite"
                        value={formData.typeIdentite || ''}
                        onChange={handleChange}
                        style={inputStyle}
                    >
                        <option value="">-- Sélectionner --</option>
                        <option value="CNI">CNI (Carte Nationale)</option>
                        <option value="PC">PC (Permis de Conduire)</option>
                        <option value="PP">PP (Passeport)</option>
                    </select>
                </div>

                <div>
                    <label style={labelStyle}>Numéro d'identité</label>
                    <input
                        type="text"
                        name="numIdentite"
                        value={formData.numIdentite || ''}
                        onChange={handleChange}
                        style={inputStyle}
                        placeholder="Numéro de pièce d'identité"
                    />
                </div>
            </div>

            <div>
                <label style={labelStyle}>Qualité</label>
                <select
                    name="qualite"
                    value={formData.qualite || ''}
                    onChange={handleChange}
                    style={inputStyle}
                >
                    <option value="">-- Sélectionner --</option>
                    <option value="PROPRIETAIRE">Propriétaire</option>
                    <option value="HERITIER">Héritier</option>
                    <option value="PROCUREUR">Procureur</option>
                </select>
            </div>

            <h3 style={{ color: '#cbd5e1', marginTop: '1rem', marginBottom: '0.5rem' }}>Informations Prix</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                    <label style={labelStyle}>Type de prix</label>
                    <select
                        name="prixType"
                        value={formData.prixType || ''}
                        onChange={handleChange}
                        style={inputStyle}
                    >
                        <option value="">-- Sélectionner --</option>
                        <option value="DEMANDE">Demandé</option>
                        <option value="OFFERT">Offert</option>
                    </select>
                </div>

                <div>
                    <label style={labelStyle}>Nature du prix</label>
                    <select
                        name="prixNature"
                        value={formData.prixNature || ''}
                        onChange={handleChange}
                        style={inputStyle}
                    >
                        <option value="">-- Sélectionner --</option>
                        <option value="FERME">Ferme</option>
                        <option value="FIXE">Fixe</option>
                        <option value="NEGOCIABLE">Négociable</option>
                    </select>
                </div>

                <div>
                    <label style={labelStyle}>Source du prix</label>
                    <select
                        name="prixSource"
                        value={formData.prixSource || ''}
                        onChange={handleChange}
                        style={inputStyle}
                    >
                        <option value="">-- Sélectionner --</option>
                        <option value="A_MON_NIVEAU">À mon niveau</option>
                        <option value="AILLEURS">Ailleurs</option>
                    </select>
                </div>
            </div>

            <h3 style={{ color: '#cbd5e1', marginTop: '1rem', marginBottom: '0.5rem' }}>Modalités de Paiement</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                    <label style={labelStyle}>Paiement vente</label>
                    <select
                        name="paiementVente"
                        value={formData.paiementVente || ''}
                        onChange={handleChange}
                        style={inputStyle}
                    >
                        <option value="">-- Sélectionner --</option>
                        <option value="CREDIT">Crédit</option>
                        <option value="CACHE">Cache</option>
                    </select>
                </div>

                <div>
                    <label style={labelStyle}>Paiement location</label>
                    <select
                        name="paiementLocation"
                        value={formData.paiementLocation || ''}
                        onChange={handleChange}
                        style={inputStyle}
                    >
                        <option value="">-- Sélectionner --</option>
                        <option value="ANNUEL">Annuel</option>
                        <option value="SEMESTRIEL">Semestriel</option>
                        <option value="JOURNALIER">Journalier</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default OwnerInfoTab;

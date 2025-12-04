import React from 'react';

const BasicInfoTab = ({ formData, onChange }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Auto-sync transaction when statut changes
        if (name === 'statut') {
            const updates = { [name]: value };
            
            // Synchronize transaction based on statut
            if (value === 'VENDU') {
                updates.transaction = 'VENTE';
            } else if (value === 'LOUE') {
                updates.transaction = 'LOCATION';
            }
            // For DISPONIBLE, keep current transaction (user can choose)
            
            onChange(updates);
        } else {
            onChange({ [name]: value });
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '0.75rem',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px',
        color: 'white',
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
            <div>
                <label style={labelStyle}>Titre *</label>
                <input
                    type="text"
                    name="titre"
                    value={formData.titre}
                    onChange={handleChange}
                    required
                    style={inputStyle}
                    placeholder="Ex: Villa moderne avec piscine"
                />
            </div>

            <div>
                <label style={labelStyle}>Description</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    style={{
                        ...inputStyle,
                        resize: 'vertical'
                    }}
                    placeholder="Description détaillée du bien..."
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                    <label style={labelStyle}>Type de bien *</label>
                    <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        disabled
                        title="Le type de bien ne peut pas être modifié"
                        style={{
                            ...inputStyle,
                            opacity: 0.6,
                            cursor: 'not-allowed'
                        }}
                    >
                        <option value="APPARTEMENT">Appartement</option>
                        <option value="VILLA">Villa</option>
                        <option value="TERRAIN">Terrain</option>
                        <option value="LOCAL">Local</option>
                        <option value="IMMEUBLE">Immeuble</option>
                    </select>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                        ⚠️ Le type ne peut pas être modifié après création
                    </p>
                </div>

                <div>
                    <label style={labelStyle}>Statut *</label>
                    <select
                        name="statut"
                        value={formData.statut}
                        onChange={handleChange}
                        style={inputStyle}
                    >
                        <option value="DISPONIBLE">Disponible</option>
                        <option value="VENDU">Vendu</option>
                        <option value="LOUE">Loué</option>
                    </select>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                    <label style={labelStyle}>Transaction *</label>
                    <select
                        name="transaction"
                        value={formData.transaction}
                        onChange={handleChange}
                        disabled={formData.statut === 'VENDU' || formData.statut === 'LOUE'}
                        style={{
                            ...inputStyle,
                            opacity: (formData.statut === 'VENDU' || formData.statut === 'LOUE') ? 0.6 : 1,
                            cursor: (formData.statut === 'VENDU' || formData.statut === 'LOUE') ? 'not-allowed' : 'pointer'
                        }}
                    >
                        <option value="VENTE">Vente</option>
                        <option value="LOCATION">Location</option>
                    </select>
                    {(formData.statut === 'VENDU' || formData.statut === 'LOUE') && (
                        <p style={{ fontSize: '0.75rem', color: '#3b82f6', marginTop: '0.25rem' }}>
                            ✓ Synchronisé automatiquement avec le statut
                        </p>
                    )}
                </div>

                <div>
                    <label style={labelStyle}>Prix Vente (DA)</label>
                    <input
                        type="number"
                        name="prixVente"
                        value={formData.prixVente}
                        onChange={handleChange}
                        disabled={formData.statut === 'LOUE'}
                        style={{
                            ...inputStyle,
                            opacity: formData.statut === 'LOUE' ? 0.5 : 1,
                            cursor: formData.statut === 'LOUE' ? 'not-allowed' : 'text'
                        }}
                        placeholder="0"
                        min="0"
                    />
                    {formData.statut === 'LOUE' && (
                        <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                            🔒 Désactivé pour les biens loués
                        </p>
                    )}
                </div>

                <div>
                    <label style={labelStyle}>Prix Location (DA)</label>
                    <input
                        type="number"
                        name="prixLocation"
                        value={formData.prixLocation}
                        onChange={handleChange}
                        disabled={formData.statut === 'VENDU'}
                        style={{
                            ...inputStyle,
                            opacity: formData.statut === 'VENDU' ? 0.5 : 1,
                            cursor: formData.statut === 'VENDU' ? 'not-allowed' : 'text'
                        }}
                        placeholder="0"
                        min="0"
                    />
                    {formData.statut === 'VENDU' && (
                        <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                            🔒 Désactivé pour les biens vendus
                        </p>
                    )}
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
                    placeholder="Ex: Bab Ezzouar, Alger"
                />
            </div>
        </div>
    );
};

export default BasicInfoTab;

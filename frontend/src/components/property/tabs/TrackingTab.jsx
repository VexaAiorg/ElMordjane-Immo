import React from 'react';

const TrackingTab = ({ formData, onChange }) => {
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        onChange({ [name]: type === 'checkbox' ? checked : value });
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

    const checkboxContainerStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '8px',
        cursor: 'pointer'
    };

    return (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
            <h3 style={{ color: '#cbd5e1' }}>Informations de Suivi</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <label style={checkboxContainerStyle}>
                    <input
                        type="checkbox"
                        name="estVisite"
                        checked={formData.estVisite || false}
                        onChange={handleChange}
                    />
                    <span>Bien visité</span>
                </label>

                <label style={checkboxContainerStyle}>
                    <input
                        type="checkbox"
                        name="aMandat"
                        checked={formData.aMandat || false}
                        onChange={handleChange}
                    />
                    <span>Mandat signé</span>
                </label>

                <div>
                    <label style={labelStyle}>Priorité</label>
                    <select
                        name="priorite"
                        value={formData.priorite || 'NORMAL'}
                        onChange={handleChange}
                        style={inputStyle}
                    >
                        <option value="NORMAL">Normal</option>
                        <option value="IMPORTANT">Important</option>
                        <option value="TRES_IMPORTANT">Très Important</option>
                    </select>
                </div>
            </div>

            <div>
                <label style={labelStyle}>URL Google Sheet</label>
                <input
                    type="url"
                    name="urlGoogleSheet"
                    value={formData.urlGoogleSheet || ''}
                    onChange={handleChange}
                    style={inputStyle}
                    placeholder="https://docs.google.com/spreadsheets/..."
                />
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                    Lien vers le tableau de suivi Google Sheets
                </p>
            </div>

            <div>
                <label style={labelStyle}>URL Google Photos</label>
                <input
                    type="url"
                    name="urlGooglePhotos"
                    value={formData.urlGooglePhotos || ''}
                    onChange={handleChange}
                    style={inputStyle}
                    placeholder="https://photos.google.com/..."
                />
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                    Lien vers l'album Google Photos du bien
                </p>
            </div>
        </div>
    );
};

export default TrackingTab;

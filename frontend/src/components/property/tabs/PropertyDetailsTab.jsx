import React from 'react';

const PropertyDetailsTab = ({ propertyType, formData, onChange }) => {
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        onChange({ [name]: type === 'checkbox' ? checked : value });
    };

    const inputStyle = {
        width: '100%',
        padding: '0.75rem',
        background: 'rgba(255,255,255,0.05) !important',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px',
        color: 'white',
        fontSize: '1rem',
        WebkitBoxShadow: '0 0 0 1000px rgba(26, 26, 46, 0.95) inset !important',
        WebkitTextFillColor: 'white !important',
        caretColor: 'white'
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

    // APPARTEMENT Form
    if (propertyType === 'APPARTEMENT') {
        return (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
                <h3 style={{ color: '#cbd5e1' }}>Détails Appartement</h3>

                <div>
                    <label style={labelStyle}>Type d'appartement</label>
                    <input
                        type="text"
                        name="typeAppart"
                        value={formData.typeAppart || ''}
                        onChange={handleChange}
                        style={inputStyle}
                        placeholder="Ex: F3, Studio, Duplex..."
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={labelStyle}>Surface totale (m²)</label>
                        <input
                            type="number"
                            name="surfaceTotal"
                            value={formData.surfaceTotal || ''}
                            onChange={handleChange}
                            style={inputStyle}
                            placeholder="0"
                            min="0"
                            step="0.01"
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Surface salon (m²)</label>
                        <input
                            type="number"
                            name="surfaceSalon"
                            value={formData.surfaceSalon || ''}
                            onChange={handleChange}
                            style={inputStyle}
                            placeholder="0"
                            min="0"
                            step="0.01"
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Surface chambre (m²)</label>
                        <input
                            type="number"
                            name="surfaceChambre"
                            value={formData.surfaceChambre || ''}
                            onChange={handleChange}
                            style={inputStyle}
                            placeholder="0"
                            min="0"
                            step="0.01"
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={labelStyle}>Surface cuisine (m²)</label>
                        <input
                            type="number"
                            name="surfaceCuisine"
                            value={formData.surfaceCuisine || ''}
                            onChange={handleChange}
                            style={inputStyle}
                            placeholder="0"
                            min="0"
                            step="0.01"
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Surface SDB (m²)</label>
                        <input
                            type="number"
                            name="surfaceSDB"
                            value={formData.surfaceSDB || ''}
                            onChange={handleChange}
                            style={inputStyle}
                            placeholder="0"
                            min="0"
                            step="0.01"
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={labelStyle}>Étage</label>
                        <input
                            type="number"
                            name="etage"
                            value={formData.etage || ''}
                            onChange={handleChange}
                            style={inputStyle}
                            placeholder="0"
                            min="0"
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Finition</label>
                        <input
                            type="text"
                            name="finition"
                            value={formData.finition || ''}
                            onChange={handleChange}
                            style={inputStyle}
                            placeholder="Ex: Moderne, Classique..."
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Année de construction</label>
                        <input
                            type="number"
                            name="anneeConstruction"
                            value={formData.anneeConstruction || ''}
                            onChange={handleChange}
                            style={inputStyle}
                            placeholder="2024"
                            min="1900"
                            max="2100"
                        />
                    </div>
                </div>

                <h4 style={{ color: '#94a3b8', marginTop: '1rem' }}>Équipements</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <label style={checkboxContainerStyle}>
                        <input
                            type="checkbox"
                            name="ascenseur"
                            checked={formData.ascenseur || false}
                            onChange={handleChange}
                        />
                        <span>Ascenseur</span>
                    </label>
                    <label style={checkboxContainerStyle}>
                        <input
                            type="checkbox"
                            name="climatisation"
                            checked={formData.climatisation || false}
                            onChange={handleChange}
                        />
                        <span>Climatisation</span>
                    </label>
                    <label style={checkboxContainerStyle}>
                        <input
                            type="checkbox"
                            name="cuisineEquipee"
                            checked={formData.cuisineEquipee || false}
                            onChange={handleChange}
                        />
                        <span>Cuisine équipée</span>
                    </label>
                    <label style={checkboxContainerStyle}>
                        <input
                            type="checkbox"
                            name="meuble"
                            checked={formData.meuble || false}
                            onChange={handleChange}
                        />
                        <span>Meublé</span>
                    </label>
                    <label style={checkboxContainerStyle}>
                        <input
                            type="checkbox"
                            name="parking"
                            checked={formData.parking || false}
                            onChange={handleChange}
                        />
                        <span>Parking</span>
                    </label>
                    <label style={checkboxContainerStyle}>
                        <input
                            type="checkbox"
                            name="gardinage"
                            checked={formData.gardinage || false}
                            onChange={handleChange}
                        />
                        <span>Gardiennage</span>
                    </label>
                </div>

                <div>
                    <label style={labelStyle}>Type de chauffage</label>
                    <select
                        name="chauffage"
                        value={formData.chauffage || ''}
                        onChange={handleChange}
                        style={inputStyle}
                    >
                        <option value="">-- Aucun --</option>
                        <option value="CENTRAL">Central</option>
                        <option value="BAINS">Bains</option>
                        <option value="AUTRE">Autre</option>
                    </select>
                </div>

                <h4 style={{ color: '#94a3b8', marginTop: '1rem' }}>Proximité</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <label style={checkboxContainerStyle}>
                        <input
                            type="checkbox"
                            name="proximiteEcole"
                            checked={formData.proximiteEcole || false}
                            onChange={handleChange}
                        />
                        <span>École</span>
                    </label>
                    <label style={checkboxContainerStyle}>
                        <input
                            type="checkbox"
                            name="proximitePlage"
                            checked={formData.proximitePlage || false}
                            onChange={handleChange}
                        />
                        <span>Plage</span>
                    </label>
                    <label style={checkboxContainerStyle}>
                        <input
                            type="checkbox"
                            name="proximiteAeroport"
                            checked={formData.proximiteAeroport || false}
                            onChange={handleChange}
                        />
                        <span>Aéroport</span>
                    </label>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={labelStyle}>Transport</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                            {['BUS', 'TRAMWAY', 'METRO', 'TRAIN'].map((transport) => (
                                <label key={transport} style={checkboxContainerStyle}>
                                    <input
                                        type="checkbox"
                                        value={transport}
                                        checked={
                                            Array.isArray(formData.proximiteTransport)
                                                ? formData.proximiteTransport.includes(transport)
                                                : formData.proximiteTransport === transport
                                        }
                                        onChange={(e) => {
                                            const { value, checked } = e.target;
                                            let currentTransport = formData.proximiteTransport || [];
                                            if (!Array.isArray(currentTransport)) {
                                                currentTransport = currentTransport ? [currentTransport] : [];
                                            }
                                            
                                            let newTransport;
                                            if (checked) {
                                                newTransport = [...currentTransport, value];
                                            } else {
                                                newTransport = currentTransport.filter(t => t !== value);
                                            }
                                            onChange({ proximiteTransport: newTransport });
                                        }}
                                    />
                                    <span style={{ textTransform: 'capitalize' }}>{transport.toLowerCase()}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // TERRAIN Form
    if (propertyType === 'TERRAIN') {
        return (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
                <h3 style={{ color: '#cbd5e1' }}>Détails Terrain</h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={labelStyle}>Surface (m²) *</label>
                        <input
                            type="number"
                            name="surface"
                            value={formData.surface || ''}
                            onChange={handleChange}
                            style={inputStyle}
                            placeholder="0"
                            min="0"
                            step="0.01"
                            required
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Vocation</label>
                        <input
                            type="text"
                            name="vocation"
                            value={formData.vocation || ''}
                            onChange={handleChange}
                            style={inputStyle}
                            placeholder="Ex: Résidentiel, Commercial..."
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={labelStyle}>Longueur (m)</label>
                        <input
                            type="number"
                            name="longueur"
                            value={formData.longueur || ''}
                            onChange={handleChange}
                            style={inputStyle}
                            placeholder="0"
                            min="0"
                            step="0.01"
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Largeur (m)</label>
                        <input
                            type="number"
                            name="largeur"
                            value={formData.largeur || ''}
                            onChange={handleChange}
                            style={inputStyle}
                            placeholder="0"
                            min="0"
                            step="0.01"
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Nombre de façades</label>
                        <input
                            type="number"
                            name="facades"
                            value={formData.facades || ''}
                            onChange={handleChange}
                            style={inputStyle}
                            placeholder="0"
                            min="0"
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <label style={checkboxContainerStyle}>
                        <input
                            type="checkbox"
                            name="viabilise"
                            checked={formData.viabilise || false}
                            onChange={handleChange}
                        />
                        <span>Viabilisé</span>
                    </label>
                    <div>
                        <label style={labelStyle}>Statut juridique</label>
                        <input
                            type="text"
                            name="statutJuridique"
                            value={formData.statutJuridique || ''}
                            onChange={handleChange}
                            style={inputStyle}
                            placeholder="Ex: Acte, Livret foncier..."
                        />
                    </div>
                </div>
            </div>
        );
    }

    // VILLA Form (includes terrain fields + villa-specific)
    if (propertyType === 'VILLA') {
        return (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
                <h3 style={{ color: '#cbd5e1' }}>Détails Villa</h3>

                <h4 style={{ color: '#94a3b8' }}>Terrain</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={labelStyle}>Surface terrain (m²) *</label>
                        <input
                            type="number"
                            name="surface"
                            value={formData.surface || ''}
                            onChange={handleChange}
                            style={inputStyle}
                            placeholder="0"
                            min="0"
                            step="0.01"
                            required
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Vocation</label>
                        <input
                            type="text"
                            name="vocation"
                            value={formData.vocation || ''}
                            onChange={handleChange}
                            style={inputStyle}
                            placeholder="Ex: Résidentiel..."
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={labelStyle}>Longueur (m)</label>
                        <input
                            type="number"
                            name="longueur"
                            value={formData.longueur || ''}
                            onChange={handleChange}
                            style={inputStyle}
                            placeholder="0"
                            min="0"
                            step="0.01"
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Largeur (m)</label>
                        <input
                            type="number"
                            name="largeur"
                            value={formData.largeur || ''}
                            onChange={handleChange}
                            style={inputStyle}
                            placeholder="0"
                            min="0"
                            step="0.01"
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Nombre de façades</label>
                        <input
                            type="number"
                            name="facades"
                            value={formData.facades || ''}
                            onChange={handleChange}
                            style={inputStyle}
                            placeholder="0"
                            min="0"
                        />
                    </div>
                </div>

                <label style={checkboxContainerStyle}>
                    <input
                        type="checkbox"
                        name="viabilise"
                        checked={formData.viabilise || false}
                        onChange={handleChange}
                    />
                    <span>Viabilisé</span>
                </label>

                <h4 style={{ color: '#94a3b8', marginTop: '1rem' }}>Construction</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={labelStyle}>Surface bâtie (m²)</label>
                        <input
                            type="number"
                            name="surfaceBatie"
                            value={formData.surfaceBatie || ''}
                            onChange={handleChange}
                            style={inputStyle}
                            placeholder="0"
                            min="0"
                            step="0.01"
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Nombre d'étages</label>
                        <input
                            type="number"
                            name="etages"
                            value={formData.etages || ''}
                            onChange={handleChange}
                            style={inputStyle}
                            placeholder="0"
                            min="0"
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Nombre de pièces</label>
                        <input
                            type="number"
                            name="pieces"
                            value={formData.pieces || ''}
                            onChange={handleChange}
                            style={inputStyle}
                            placeholder="0"
                            min="0"
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={labelStyle}>État</label>
                        <select
                            name="etat"
                            value={formData.etat || ''}
                            onChange={handleChange}
                            style={inputStyle}
                        >
                            <option value="">-- Sélectionner --</option>
                            <option value="RECENTE">Récente</option>
                            <option value="A_DEMOLIR">À démolir</option>
                            <option value="A_REFAIRE">À refaire</option>
                        </select>
                    </div>
                    <div>
                        <label style={labelStyle}>Composition</label>
                        <input
                            type="text"
                            name="composition"
                            value={formData.composition || ''}
                            onChange={handleChange}
                            style={inputStyle}
                            placeholder="Ex: Duplex, Appartements..."
                        />
                    </div>
                </div>

                <h4 style={{ color: '#94a3b8', marginTop: '1rem' }}>Équipements</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <label style={checkboxContainerStyle}>
                        <input
                            type="checkbox"
                            name="jardin"
                            checked={formData.jardin || false}
                            onChange={handleChange}
                        />
                        <span>Jardin</span>
                    </label>
                    <label style={checkboxContainerStyle}>
                        <input
                            type="checkbox"
                            name="garage"
                            checked={formData.garage || false}
                            onChange={handleChange}
                        />
                        <span>Garage</span>
                    </label>
                    <label style={checkboxContainerStyle}>
                        <input
                            type="checkbox"
                            name="piscine"
                            checked={formData.piscine || false}
                            onChange={handleChange}
                        />
                        <span>Piscine</span>
                    </label>
                </div>
            </div>
        );
    }

    // LOCAL Form
    if (propertyType === 'LOCAL') {
        return (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
                <h3 style={{ color: '#cbd5e1' }}>Détails Local</h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={labelStyle}>Surface (m²) *</label>
                        <input
                            type="number"
                            name="surface"
                            value={formData.surface || ''}
                            onChange={handleChange}
                            style={inputStyle}
                            placeholder="0"
                            min="0"
                            step="0.01"
                            required
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Type d'activité</label>
                        <select
                            name="typeActivite"
                            value={formData.typeActivite || ''}
                            onChange={handleChange}
                            style={inputStyle}
                        >
                            <option value="">-- Sélectionner --</option>
                            <option value="BUREAU">Bureau</option>
                            <option value="OPEN_SPACE">Open Space</option>
                            <option value="RDC">RDC</option>
                            <option value="AUTRE">Autre</option>
                        </select>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={labelStyle}>Hauteur (m)</label>
                        <input
                            type="number"
                            name="hauteur"
                            value={formData.hauteur || ''}
                            onChange={handleChange}
                            style={inputStyle}
                            placeholder="0"
                            min="0"
                            step="0.01"
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Nombre de façades</label>
                        <input
                            type="number"
                            name="facades"
                            value={formData.facades || ''}
                            onChange={handleChange}
                            style={inputStyle}
                            placeholder="0"
                            min="0"
                        />
                    </div>
                </div>
            </div>
        );
    }

    // IMMEUBLE Form (includes villa fields + immeuble-specific)
    if (propertyType === 'IMMEUBLE') {
        return (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
                <h3 style={{ color: '#cbd5e1' }}>Détails Immeuble</h3>

                <h4 style={{ color: '#94a3b8' }}>Terrain</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={labelStyle}>Surface terrain (m²) *</label>
                        <input
                            type="number"
                            name="surface"
                            value={formData.surface || ''}
                            onChange={handleChange}
                            style={inputStyle}
                            placeholder="0"
                            min="0"
                            step="0.01"
                            required
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Vocation</label>
                        <input
                            type="text"
                            name="vocation"
                            value={formData.vocation || ''}
                            onChange={handleChange}
                            style={inputStyle}
                            placeholder="Ex: Résidentiel, Commercial..."
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={labelStyle}>Longueur (m)</label>
                        <input
                            type="number"
                            name="longueur"
                            value={formData.longueur || ''}
                            onChange={handleChange}
                            style={inputStyle}
                            placeholder="0"
                            min="0"
                            step="0.01"
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Largeur (m)</label>
                        <input
                            type="number"
                            name="largeur"
                            value={formData.largeur || ''}
                            onChange={handleChange}
                            style={inputStyle}
                            placeholder="0"
                            min="0"
                            step="0.01"
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Nombre de façades</label>
                        <input
                            type="number"
                            name="facades"
                            value={formData.facades || ''}
                            onChange={handleChange}
                            style={inputStyle}
                            placeholder="0"
                            min="0"
                        />
                    </div>
                </div>

                <label style={checkboxContainerStyle}>
                    <input
                        type="checkbox"
                        name="viabilise"
                        checked={formData.viabilise || false}
                        onChange={handleChange}
                    />
                    <span>Viabilisé</span>
                </label>

                <h4 style={{ color: '#94a3b8', marginTop: '1rem' }}>Construction</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={labelStyle}>Surface bâtie (m²)</label>
                        <input
                            type="number"
                            name="surfaceBatie"
                            value={formData.surfaceBatie || ''}
                            onChange={handleChange}
                            style={inputStyle}
                            placeholder="0"
                            min="0"
                            step="0.01"
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Nombre d'étages</label>
                        <input
                            type="number"
                            name="etages"
                            value={formData.etages || ''}
                            onChange={handleChange}
                            style={inputStyle}
                            placeholder="0"
                            min="0"
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Nombre de pièces</label>
                        <input
                            type="number"
                            name="pieces"
                            value={formData.pieces || ''}
                            onChange={handleChange}
                            style={inputStyle}
                            placeholder="0"
                            min="0"
                        />
                    </div>
                </div>

                <div>
                    <label style={labelStyle}>État</label>
                    <select
                        name="etat"
                        value={formData.etat || ''}
                        onChange={handleChange}
                        style={inputStyle}
                    >
                        <option value="">-- Sélectionner --</option>
                        <option value="RECENTE">Récente</option>
                        <option value="A_DEMOLIR">À démolir</option>
                        <option value="A_REFAIRE">À refaire</option>
                    </select>
                </div>

                <h4 style={{ color: '#94a3b8', marginTop: '1rem' }}>Équipements</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <label style={checkboxContainerStyle}>
                        <input
                            type="checkbox"
                            name="jardin"
                            checked={formData.jardin || false}
                            onChange={handleChange}
                        />
                        <span>Jardin</span>
                    </label>
                    <label style={checkboxContainerStyle}>
                        <input
                            type="checkbox"
                            name="garage"
                            checked={formData.garage || false}
                            onChange={handleChange}
                        />
                        <span>Garage</span>
                    </label>
                    <label style={checkboxContainerStyle}>
                        <input
                            type="checkbox"
                            name="piscine"
                            checked={formData.piscine || false}
                            onChange={handleChange}
                        />
                        <span>Piscine</span>
                    </label>
                </div>

                <h4 style={{ color: '#94a3b8', marginTop: '1rem' }}>Spécifique Immeuble</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={labelStyle}>Nombre d'appartements</label>
                        <input
                            type="number"
                            name="nbAppartements"
                            value={formData.nbAppartements || ''}
                            onChange={handleChange}
                            style={inputStyle}
                            placeholder="0"
                            min="0"
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Surface au sol (m²)</label>
                        <input
                            type="number"
                            name="surfaceSol"
                            value={formData.surfaceSol || ''}
                            onChange={handleChange}
                            style={inputStyle}
                            placeholder="0"
                            min="0"
                            step="0.01"
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
            <p>Sélectionnez un type de bien pour afficher les détails</p>
        </div>
    );
};

export default PropertyDetailsTab;

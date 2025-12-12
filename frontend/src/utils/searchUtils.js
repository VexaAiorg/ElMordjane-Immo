/**
 * Search utility for properties
 * Performs a deep search across all property fields
 */
export const searchProperty = (property, query) => {
    if (!query) return true;
    const lowerQuery = query.toLowerCase().trim();
    if (!lowerQuery) return true;

    // Helper to check if a value matches
    const matches = (value) => {
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(lowerQuery);
    };

    // 1. Basic Fields
    if (matches(property.titre)) return true;
    if (matches(property.description)) return true;
    if (matches(property.adresse)) return true;
    if (matches(property.ville)) return true;
    if (matches(property.wilaya)) return true;
    if (matches(property.codePostal)) return true;
    if (matches(property.type)) return true;
    if (matches(property.statut)) return true;
    if (matches(property.transaction)) return true;
    
    // 2. Prices
    if (matches(property.prixVente)) return true;
    if (matches(property.prixLocation)) return true;

    // 3. Owner (Proprietaire)
    if (property.proprietaire) {
        if (matches(property.proprietaire.nom)) return true;
        if (matches(property.proprietaire.prenom)) return true;
        if (matches(property.proprietaire.email)) return true;
        if (matches(property.proprietaire.telephone)) return true;
        if (matches(property.proprietaire.adresse)) return true;
    }

    // 4. Details (Specific to type)
    const details = [
        property.detailAppartement,
        property.detailVilla,
        property.detailTerrain,
        property.detailLocal,
        property.detailImmeuble
    ];

    for (const detail of details) {
        if (detail) {
            // Iterate over all keys in the detail object
            for (const key in detail) {
                if (Object.prototype.hasOwnProperty.call(detail, key)) {
                     // Exclude IDs and timestamps if desired, but searching them is usually harmless
                     if (key === 'id' || key === 'bienImmobilierId') continue;
                     if (matches(detail[key])) return true;
                }
            }
        }
    }
    
    // 5. Specifications
    if (property.specifications) {
         if (typeof property.specifications === 'object') {
             // Recursive search in object
             const searchObj = (obj) => {
                 for (const key in obj) {
                     if (obj[key] === null || obj[key] === undefined) continue;
                     
                     if (typeof obj[key] === 'object') {
                         if (searchObj(obj[key])) return true;
                     } else {
                         if (matches(obj[key])) return true;
                     }
                 }
                 return false;
             };
             if (searchObj(property.specifications)) return true;
         } else {
             if (matches(property.specifications)) return true;
         }
    }

    // 6. Suivi (Tracking)
    if (property.suivi) {
        if (matches(property.suivi.priorite)) return true;
        if (matches(property.suivi.etat)) return true;
        if (matches(property.suivi.commentaire)) return true;
    }

    return false;
};

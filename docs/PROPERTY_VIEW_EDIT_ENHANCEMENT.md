# Property View & Edit Enhancement Documentation

## Overview

This document outlines the comprehensive changes needed to enhance the "View Property" and "Edit Property" features in the ElMordjane Real Estate Dashboard.

---

## Current State Analysis

### Current View Modal (`PropertyDetailsModal`)
- Shows basic property information
- Displays owner info, tracking status
- Shows documents under single "Documents Juridiques" section
- Shows photos/files under "Galerie & Fichiers"
- **Issues**: All documents are grouped together without proper categorization

### Current Edit Modal (`PropertyEditModal`)
- Only edits basic property fields (titre, description, type, statut, transaction, prix, adresse)
- Basic file upload for new photos/documents
- **Issues**: 
  - Cannot edit owner information
  - Cannot edit property-specific details (DetailVilla, DetailAppartement, etc.)
  - Cannot edit tracking/suivi information
  - Cannot manage existing documents (delete, change visibility)
  - Cannot edit papiers (document checklist) status

---

## Proposed Document Categories

Based on the application structure, documents should be categorized as:

### 1. **Documents Juridiques** (Page 4 - Legal Documents)
- Source: `property.papiers` + matching `property.piecesJointes` where `categorie` matches `papier.nom`
- Visibility: Always `INTERNE`
- Examples: Acte, Livret Foncier, Extrait Cadastral, Permis, CC4, CC12, etc.
- Display: Show checklist status (DISPONIBLE/MANQUANT/EN_COURS) with linked file if uploaded

### 2. **Fichiers du Bien** (Page 5 - Property Files - PUBLIABLE)
- Source: `property.piecesJointes` where `visibilite === 'PUBLIABLE'` and NO `categorie`
- Default Visibility: `PUBLIABLE`
- These are the main property photos/documents meant for public/client viewing
- Subsections:
  - Photos Publiables
  - Documents Publiables
  - Localisations

### 3. **Pièces Jointes Internes** (Page 6 - Internal Attachments - INTERNE)
- Source: `property.piecesJointes` where `visibilite === 'INTERNE'` and NO `categorie`
- Default Visibility: `INTERNE`
- These are internal documents not meant for clients
- Subsections:
  - Photos Internes
  - Documents Internes
  - Localisations

---

## Enhanced View Modal Structure

```
┌─────────────────────────────────────────────────────────────┐
│  [Property Title]                              [Status Badge]│
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📋 INFORMATIONS GÉNÉRALES                                   │
│  ├── Type: VILLA                                             │
│  ├── Transaction: VENTE                                      │
│  ├── Prix: 500,000,000 DA                                    │
│  └── Date d'ajout: 30 novembre 2025                          │
│                                                              │
│  🏠 DÉTAILS VILLA                                            │
│  ├── Surface: 50 m²                                          │
│  ├── Vocation: acte                                          │
│  ├── Longueur: 50 | Largeur: 50                              │
│  ├── Facades: 50                                             │
│  ├── Viabilisé: Oui                                          │
│  ├── Surface Bâtie: 50 m²                                    │
│  ├── Étages: 5                                               │
│  ├── Pièces: 5                                               │
│  ├── État: A_DEMOLIR                                         │
│  ├── Jardin: Oui | Garage: Non | Piscine: Oui                │
│  └── Composition: -                                          │
│                                                              │
│  📍 LOCALISATION                                             │
│  └── bab ezzouar                                             │
│                                                              │
│  👤 PROPRIÉTAIRE                                             │
│  ├── Nom complet: ahmed ali                                  │
│  ├── Téléphone: 0555483952                                   │
│  └── Email: ali@gmail.com                                    │
│                                                              │
│  📊 SUIVI & MANDAT                                           │
│  ├── Visité: Non                                             │
│  ├── Priorité: NORMAL                                        │
│  └── Mandat: Non                                             │
│                                                              │
│  ═══════════════════════════════════════════════════════════ │
│                                                              │
│  📁 DOCUMENTS JURIDIQUES (from Page 4)                       │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ ✓ Acte (Livret Foncier)          [DISPONIBLE] [Ouvrir]  │ │
│  │   📎 Fichier: campsite-workshop.pdf                     │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │ ✗ Extrait Cadastral               [MANQUANT]            │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │ ✗ Permis                          [MANQUANT]            │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │ ✓ Avancement des Travaux         [DISPONIBLE] [Ouvrir]  │ │
│  │   📎 Fichier: TPI Compte.docx                           │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  🌐 FICHIERS DU BIEN (Publiables - Page 5)                   │
│  ├── Photos (3)                                              │
│  │   [img1] [img2] [img3]                                    │
│  ├── Documents (1)                                           │
│  │   📄 contrat.pdf                              [Ouvrir]    │
│  └── Localisations (1)                                       │
│       🗺️ Google Maps Link                       [Ouvrir]    │
│                                                              │
│  🔒 PIÈCES JOINTES INTERNES (Page 6)                         │
│  ├── Photos (2)                                              │
│  │   [img1] [img2]                                           │
│  ├── Documents (3)                                           │
│  │   📄 notes_internes.pdf                       [Ouvrir]    │
│  │   📄 evaluation.docx                          [Ouvrir]    │
│  └── Localisations (0)                                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Enhanced Edit Modal Structure

The Edit Modal should have **tabs** or **accordion sections** for each category:

### Tab 1: Informations de Base
- Titre (text)
- Description (textarea)
- Type (select - but changing type is complex, may want to disable)
- Statut (select: DISPONIBLE, VENDU, LOUE)
- Transaction (select: VENTE, LOCATION)
- Prix Vente / Prix Location (number)
- Adresse (text)

### Tab 2: Propriétaire
- Nom (text)
- Prénom (text)
- Téléphone (text)
- Email (text)
- Adresse (text)
- Type Identité (select)
- Numéro Identité (text)
- Qualité (select)
- Prix Type / Nature / Source (selects)
- Paiement Vente / Location (selects)

### Tab 3: Détails du Bien
Dynamic form based on property type:
- **APPARTEMENT**: typeAppart, surfaces, etage, finition, anneeConstruction, amenities
- **TERRAIN**: surface, vocation, dimensions, facades, viabilise
- **VILLA**: terrain fields + surfaceBatie, etages, pieces, etat, composition, jardin/garage/piscine
- **LOCAL**: surface, typeActivite, hauteur, facades
- **IMMEUBLE**: villa fields + nbAppartements, surfaceSol

### Tab 4: Documents Juridiques
- List all papiers with current status
- Allow changing status (DISPONIBLE/MANQUANT/EN_COURS)
- Show uploaded file with option to delete/replace
- Upload new file for each document type

### Tab 5: Suivi
- Est Visité (toggle)
- Priorité (select: TRES_IMPORTANT, IMPORTANT, NORMAL)
- A Mandat (toggle)
- URL Google Sheet (text)
- URL Google Photos (text)

### Tab 6: Fichiers du Bien (PUBLIABLE)
- Existing photos with delete option
- Existing documents with delete option
- Add new photos
- Add new documents
- Existing localisations with delete option
- Add new localisation URL

### Tab 7: Pièces Jointes (INTERNE)
- Same structure as Tab 6 but for internal files
- Can toggle visibility between PUBLIABLE/INTERNE

---

## Data Flow for Edit

### Load Property for Edit:
```javascript
const response = await getPropertyById(propertyId);
// response.data contains:
{
  id, titre, description, type, statut, transaction,
  prixVente, prixLocation, adresse, dateCreation,
  proprietaire: { id, nom, prenom, telephone, email, adresse, ... },
  detailAppartement: { ... } | null,
  detailVilla: { ... } | null,
  detailTerrain: { ... } | null,
  detailLocal: { ... } | null,
  detailImmeuble: { ... } | null,
  papiers: [{ id, nom, statut, categorie }],
  piecesJointes: [{ id, type, visibilite, url, nom, categorie }],
  suivi: { id, estVisite, priorite, aMandat, urlGoogleSheet, urlGooglePhotos }
}
```

### Save Property Changes:
```javascript
const propertyData = {
  bienImmobilier: { titre, description, type, statut, transaction, prixVente, prixLocation, adresse },
  proprietaire: { id, nom, prenom, telephone, email, ... },
  detailVilla: { ... }, // Based on type
  suivi: { estVisite, priorite, aMandat, urlGoogleSheet, urlGooglePhotos },
  papiers: [{ id, nom, statut }], // Updated statuses
  piecesJointes: [
    // Existing ones to keep (with potential visibility changes)
    { id: 1, visibilite: 'PUBLIABLE' },
    // IDs to delete would be handled separately
  ],
  piecesJointesToDelete: [3, 5, 7], // IDs of attachments to delete
};

// New files
const newDocuments = [...]; // File objects
const newPhotos = [...]; // File objects

await updateProperty(propertyId, propertyData, newDocuments, newPhotos);
```

---

## Backend Changes Required

### 1. Update `propertyController.ts` - `updateProperty` function

Current limitations:
- Only updates basic property info
- Doesn't properly update owner details
- Doesn't update papiers statuses
- Doesn't delete piecesJointes

Required changes:
```typescript
// In updateProperty transaction:

// 1. Update basic property info ✓ (exists)

// 2. Update owner info
if (data.proprietaire?.id) {
  await tx.proprietaire.update({
    where: { id: data.proprietaire.id },
    data: { nom, prenom, telephone, email, adresse, ... }
  });
}

// 3. Update property-specific details (upsert) ✓ (exists)

// 4. Update papiers statuses
if (data.papiers) {
  for (const papier of data.papiers) {
    if (papier.id) {
      await tx.papier.update({
        where: { id: papier.id },
        data: { statut: papier.statut }
      });
    }
  }
}

// 5. Update suivi ✓ (exists)

// 6. Delete piecesJointes
if (data.piecesJointesToDelete?.length > 0) {
  // Delete physical files first
  for (const pieceId of data.piecesJointesToDelete) {
    const piece = await tx.pieceJointe.findUnique({ where: { id: pieceId } });
    if (piece?.url?.startsWith('/uploads/')) {
      // Delete file from disk
    }
    await tx.pieceJointe.delete({ where: { id: pieceId } });
  }
}

// 7. Update visibility of existing piecesJointes
if (data.piecesJointes) {
  for (const piece of data.piecesJointes) {
    if (piece.id && piece.visibilite) {
      await tx.pieceJointe.update({
        where: { id: piece.id },
        data: { visibilite: piece.visibilite }
      });
    }
  }
}

// 8. Add new files ✓ (exists)
```

---

## Frontend Components to Create/Modify

### 1. Enhanced `PropertyDetailsModal` Component
- Better document categorization
- Visual separation between document types
- Collapsible sections

### 2. New `PropertyEditModal` Component (Complete Rewrite)
- Tab-based navigation
- Form validation
- File management (upload, delete, visibility toggle)
- Dirty state tracking
- Confirmation before closing with unsaved changes

### 3. Helper Components
- `EditableSection` - Collapsible form section
- `DocumentManager` - Manage documents with upload/delete
- `PhotoGalleryEditor` - Grid of photos with delete option
- `PropertyDetailsForm` - Dynamic form based on property type

---

## Implementation Order

1. **Phase 1: Enhance View Modal**
   - Reorganize document display into categories
   - Add collapsible sections
   - Better visual hierarchy

2. **Phase 2: Backend Updates**
   - Enhance updateProperty controller
   - Add delete pieceJointe endpoint
   - Add update papier status endpoint

3. **Phase 3: Edit Modal - Basic Info**
   - Create tabbed interface
   - Implement basic info editing
   - Implement owner info editing

4. **Phase 4: Edit Modal - Details**
   - Dynamic property details form
   - Suivi/tracking editing

5. **Phase 5: Edit Modal - Documents**
   - Document checklist management
   - File upload/delete for juridical docs
   - Property files management
   - Internal attachments management

6. **Phase 6: Testing & Polish**
   - Form validation
   - Error handling
   - Loading states
   - Success/error notifications

---

## File Structure

```
frontend/src/
├── components/
│   ├── property/
│   │   ├── PropertyDetailsModal.jsx      # Enhanced view modal
│   │   ├── PropertyEditModal.jsx         # New comprehensive edit modal
│   │   ├── PropertyEditTabs/
│   │   │   ├── BasicInfoTab.jsx
│   │   │   ├── OwnerInfoTab.jsx
│   │   │   ├── PropertyDetailsTab.jsx
│   │   │   ├── DocumentsTab.jsx
│   │   │   ├── TrackingTab.jsx
│   │   │   ├── PublicFilesTab.jsx
│   │   │   └── InternalFilesTab.jsx
│   │   ├── DocumentCard.jsx
│   │   ├── PhotoGalleryEditor.jsx
│   │   └── FileUploadZone.jsx
│   └── ...
├── pages/dashboard/
│   └── AllProperties.jsx                 # Updated to use new modals
└── ...

backend/src/
├── controllers/
│   └── propertyController.ts             # Enhanced updateProperty
├── routes/
│   └── propertyRoutes.ts                 # Add new endpoints if needed
└── ...
```

---

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/properties` | Get all properties (list view) |
| GET | `/api/properties/:id` | Get single property with all relations |
| POST | `/api/properties` | Create property (wizard) |
| PUT | `/api/properties/:id` | Update property (edit modal) |
| DELETE | `/api/properties/:id` | Delete property |
| DELETE | `/api/properties/:id/attachments/:attachmentId` | Delete single attachment (NEW) |
| PATCH | `/api/properties/:id/papiers/:papierId` | Update papier status (NEW) |

---

## Notes

1. **Type Change Consideration**: Changing property type (e.g., VILLA to APPARTEMENT) is complex because it requires creating new detail records and potentially deleting old ones. Consider disabling type change or adding a warning.

2. **File Deletion**: When deleting attachments, ensure physical files are also removed from the server to prevent orphaned files.

3. **Validation**: Implement proper validation on both frontend and backend to ensure data integrity.

4. **Permissions**: Currently only ADMIN role can edit. Consider role-based permissions for future.

5. **Audit Trail**: Consider logging who made changes and when for compliance purposes.

# ElMordjane Real Estate Dashboard - Conception du Schéma Prisma

Ce document décrit la conception du schéma de base de données pour le tableau de bord administrateur ElMordjane, entièrement en français.

## Vue d'ensemble

Le système est centré sur l'entité **BienImmobilier**.
Il inclut un module de **Suivi** pour le workflow interne (inspection, priorité, mandat).
Il gère également les **PiècesJointes** (documents, photos, localisations) avec contrôle de visibilité.

## Entités Principales

### 1. BienImmobilier (Property)
L'entité principale représentant un produit.
- **Attributs Essentiels**: Date, Type, Détail, Papier, Propriétaire, Suivi.
- **Autres Attributs**: attestaion (vente ou allocation),Titre, Description, Prix(vente ou allocation)Localisation.
- **Relations**: 
  - `proprietaire`: Lien vers le Propriétaire.
  - `suivi`: Traitement interne.
  - `piecesJointes`: Photos, Documents, Localisations.
  - `details`: Détails techniques spécifiques pour chaque type (Villa, Appartement, etc.).
### 1.Date entre le bien dans le systeme
### 2. type of bien immobilier 
### 6. Suivi (Tracking)
État du traitement interne du bien.
- **Visité**: Visité / Non visité.
- **classement**: Très Important, Important, Normal.
- **Mandat**: Délivré (Oui/Non).
- **Externe**: Liens vers Google Sheets / Google Photos. // not yet  , do not include it in schema
- **piece joint**: Documents, Photos("publiable","localisation"), Localisation.
- **Fichiers et médias liés au bien:**
- **Types**: Document, Photo, Localisation.
- **Visibilité**: Publiable, Interne.

### 4. Papier (Documents Légaux)
Documents administratifs et juridiques liés au bien (Numérisés).
- **Appartement**: Acte, Livret Foncier, Copie de Fiche, Négatif, CC4, LPP (Affectation, Attestation de remise de clé)
- **Terrain**: Acte (Livret Foncier, Extrait Cadastral, Permis, Certificat d'Urbanisme), Acte Indivision, Papier Timbre, Négatif, CC12.
- **Villa**: tous papiers de terrin (4.2), Avancement des Travaux,permis de construire
- **Locaux**:  Appartement, Désistement OPGI.
- **Immeuble**: tous papiers de villa (4.3), EDD(État Descriptif de Division)
### 5. Proprietaire (Owner infos)
Informations sur le client propriétaire.
- **Coordonnées**: Nom, Prénom, Adresse.
- **Identité**: CNI / PC / PP (Numéro).
- **Qualité**: Agissant en qualité de (Propriétaire, Héritier, Procureur).
- **Prix**:
  - **Type**: Demande / Offert.
  - **Nature**: Ferme / Fixe / Négociable.
  - **Source**: À mon niveau / Ailleurs.
- **Paiement**:
  - **Vente**: Crédit / Cache.
  - **Location**: Annuel / Semestriel / Journalier. 
### 3. Détails par Type de Bien (Details)

#### 3.1 Appartement
- **Type**: Studio, F2, F3, F4, F5, F6.
- **Surface**: Totale, Détail par pièce (Salon, Chambre, SDB, Cuisine).
- **Étage**: Numéro.
- **Finition**: Type.
- **Date de Construction**: Année.
- **Équipements**: Ascenseur, Chauffage (Central, Bains, Autre), Climatisation, Cuisine Équipée.
- **Meublé**: Oui/Non.
- **Extérieur**: Parking, Gardinage.
- **Proximité**: Écoles, Transports (Type), Plage, Aéroport.

#### 3.2 Terrain
- **Vocation**: Résidentiel, Commercial, Promotionnel (Vente ou Partenariat).
- **Dimensions**: Superficie, Longueur, Largeur.
- **Façades**: Nombre (1, 2, 3...).
- **Viabilisation**: Oui/Non.

#### 3.3 Villa
- **Inclus**: Tous les détails de *Terrain* (3.2).
- **État**: Récente, À démolir, À refaire.
- **Composition**: Système Duplex, Appartements (Voir détails *Appartement*), Autre.

#### 3.4 Local
- **Type**: Appartement (Usage bureau), Open Space, Local RDC, Autre.

#### 3.5 Immeuble
- **Inclus**: Tous les détails de *Villa* (3.3).




## Représentation du Schéma Prisma

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// Énumérations

enum TypeBien {
  APPARTEMENT
  TERRAIN
  VILLA
  LOCAL
  IMMEUBLE
}

enum StatutBien {
  DISPONIBLE
  VENDU
  LOUE
  SUSPENDU
}

enum TypeTransaction {
  VENTE
  LOCATION
}

enum Priorite {
  TRES_IMPORTANT
  IMPORTANT
  NORMAL
}

enum TypePieceJointe {
  DOCUMENT
  PHOTO
  LOCALISATION
}

enum Visibilite {
  PUBLIABLE
  INTERNE
}

enum TypeMandat {
  EXCLUSIF
  SIMPLE
  SEMI_EXCLUSIF
}

// Modèles

model Utilisateur {
  id            Int      @id @default(autoincrement())
  email         String   @unique
  motDePasse    String
  role          String   @default("ADMIN")
  dateCreation  DateTime @default(now())
}

model Proprietaire {
  id             Int              @id @default(autoincrement())
  nom            String
  prenom         String
  telephone      String
  email          String?
  adresse        String?
  cni            String?
  biens          BienImmobilier[]
  dateCreation   DateTime         @default(now())
}

model BienImmobilier {
  id              Int             @id @default(autoincrement())
  titre           String
  description     String?
  type            TypeBien
  statut          StatutBien      @default(DISPONIBLE)
  transaction     TypeTransaction @default(VENTE)
  
  prixVente       Float?          // Pour la vente
  prixLocation    Float?          // Pour la location
  
  adresse         String?         // Localisation textuelle
  dateCreation    DateTime        @default(now())
  dateMiseAJour   DateTime        @updatedAt

  // Relations
  proprietaireId  Int
  proprietaire    Proprietaire    @relation(fields: [proprietaireId], references: [id])
  
  suivi           Suivi?          // Le Suivi Interne
  papiers         Papier[]        // Documents administratifs (Acte, Livret, etc.)
  piecesJointes   PieceJointe[]   // Photos, Docs, Localisations
  
  // Visites Clients (Distinct du suivi interne)
  visites         Visite[]

  // Détails Spécifiques (Optionnel 1-pour-1)
  detailAppartement DetailAppartement?
  detailVilla       DetailVilla?
  detailTerrain     DetailTerrain?
  detailLocal       DetailLocal?
  detailImmeuble    DetailImmeuble?
}

model Suivi {
  id              Int            @id @default(autoincrement())
  bienId          Int            @unique
  bien            BienImmobilier @relation(fields: [bienId], references: [id], onDelete: Cascade)
  
  estVisite       Boolean        @default(false) // Visité / Non visité
  priorite        Priorite       @default(NORMAL) // Classement
  aMandat         Boolean        @default(false) // Délivrance de mandat (Oui/Non)
  
  // Intégration Externe
  urlGoogleSheet  String?
  urlGooglePhotos String?
}

model Papier {
  id           Int      @id @default(autoincrement())
  nom          String   // Ex: "Acte", "Livret Foncier", "CC4", etc.
  typeBien     String?  // Appartement, Terrain, Villa... (Optionnel, pour filtrage)
  statut       String?  // Disponible, En cours, Manquant
  
  bienId       Int
  bien         BienImmobilier @relation(fields: [bienId], references: [id], onDelete: Cascade)
  dateCreation DateTime @default(now())
}

model PieceJointe {
  id          Int             @id @default(autoincrement())
  type        TypePieceJointe // Document, Photo, Localisation
  visibilite  Visibilite      @default(INTERNE) // Publiable / Interne
  url         String
  nom         String?
  
  bienId      Int
  bien        BienImmobilier  @relation(fields: [bienId], references: [id], onDelete: Cascade)
  dateCreation DateTime       @default(now())
}

// Historique des visites clients
model Visite {
  id          Int            @id @default(autoincrement())
  date        DateTime
  nomClient   String
  telClient   String?
  avis        String?        // Feedback / Résultat
  statut      String         // Programmée, Effectuée, Annulée
  bienId      Int
  bien        BienImmobilier @relation(fields: [bienId], references: [id], onDelete: Cascade)
}

// Détails Spécifiques des Biens

model DetailAppartement {
  id            Int            @id @default(autoincrement())
  bienId        Int            @unique
  bien          BienImmobilier @relation(fields: [bienId], references: [id], onDelete: Cascade)
  
  typeAppart    String         // F2, F3...
  etage         Int
  surface       Float
  ascenseur     Boolean        @default(false)
  parking       Boolean        @default(false)
  finition      String?
  facades       Int?
}

model DetailVilla {
  id            Int            @id @default(autoincrement())
  bienId        Int            @unique
  bien          BienImmobilier @relation(fields: [bienId], references: [id], onDelete: Cascade)
  
  surface       Float
  surfaceBatie  Float?
  etages        Int            // R+1, R+2...
  pieces        Int?
  jardin        Boolean        @default(false)
  garage        Boolean        @default(false)
  piscine       Boolean        @default(false)
}

model DetailTerrain {
  id            Int            @id @default(autoincrement())
  bienId        Int            @unique
  bien          BienImmobilier @relation(fields: [bienId], references: [id], onDelete: Cascade)
  
  surface       Float
  typeTerrain   String         // Urbain, Agricole...
  facades       Int?
  viabilise     Boolean        @default(false)
  statutJuridique String?      // Acte, Livret...
}

model DetailLocal {
  id            Int            @id @default(autoincrement())
  bienId        Int            @unique
  bien          BienImmobilier @relation(fields: [bienId], references: [id], onDelete: Cascade)
  
  surface       Float
  facades       Int?
  hauteur       Float?
  typeActivite  String?
}

model DetailImmeuble {
  id            Int            @id @default(autoincrement())
  bienId        Int            @unique
  bien          BienImmobilier @relation(fields: [bienId], references: [id], onDelete: Cascade)
  
  etages        Int
  nbAppartements Int
  surfaceSol    Float
}
```

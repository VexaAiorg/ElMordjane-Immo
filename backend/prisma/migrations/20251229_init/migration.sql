-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'COLLABORATEUR');

-- CreateEnum
CREATE TYPE "TypeBien" AS ENUM ('APPARTEMENT', 'TERRAIN', 'VILLA', 'LOCAL', 'IMMEUBLE');

-- CreateEnum
CREATE TYPE "StatutBien" AS ENUM ('DISPONIBLE', 'VENDU', 'LOUE');

-- CreateEnum
CREATE TYPE "TypeTransaction" AS ENUM ('VENTE', 'LOCATION');

-- CreateEnum
CREATE TYPE "Priorite" AS ENUM ('TRES_IMPORTANT', 'IMPORTANT', 'NORMAL');

-- CreateEnum
CREATE TYPE "TypePieceJointe" AS ENUM ('DOCUMENT', 'PHOTO', 'LOCALISATION');

-- CreateEnum
CREATE TYPE "Visibilite" AS ENUM ('PUBLIABLE', 'INTERNE');

-- CreateEnum
CREATE TYPE "TypeMandat" AS ENUM ('EXCLUSIF', 'SIMPLE', 'SEMI_EXCLUSIF');

-- CreateEnum
CREATE TYPE "TypeIdentite" AS ENUM ('CNI', 'PC', 'PP');

-- CreateEnum
CREATE TYPE "QualiteProprietaire" AS ENUM ('PROPRIETAIRE', 'HERITIER', 'PROCUREUR');

-- CreateEnum
CREATE TYPE "PrixType" AS ENUM ('DEMANDE', 'OFFERT');

-- CreateEnum
CREATE TYPE "PrixNature" AS ENUM ('FERME', 'FIXE', 'NEGOCIABLE');

-- CreateEnum
CREATE TYPE "PrixSource" AS ENUM ('A_MON_NIVEAU', 'AILLEURS');

-- CreateEnum
CREATE TYPE "PaiementVente" AS ENUM ('CREDIT', 'CACHE');

-- CreateEnum
CREATE TYPE "PaiementLocation" AS ENUM ('ANNUEL', 'SEMESTRIEL', 'JOURNALIER');

-- CreateEnum
CREATE TYPE "PapierStatut" AS ENUM ('DISPONIBLE', 'MANQUANT', 'EN_COURS');

-- CreateEnum
CREATE TYPE "EtatVilla" AS ENUM ('RECENTE', 'A_DEMOLIR', 'A_REFAIRE');

-- CreateEnum
CREATE TYPE "TypeLocal" AS ENUM ('BUREAU', 'OPEN_SPACE', 'RDC', 'AUTRE');

-- CreateEnum
CREATE TYPE "TypeChauffage" AS ENUM ('CENTRAL', 'BAINS', 'AUTRE');

-- CreateEnum
CREATE TYPE "TypeTransport" AS ENUM ('BUS', 'TRAMWAY', 'METRO', 'TRAIN');

-- CreateTable
CREATE TABLE "Utilisateur" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "motDePasse" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'ADMIN',
    "nom" TEXT,
    "prenom" TEXT,
    "photoProfil" TEXT,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Utilisateur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proprietaire" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "email" TEXT,
    "adresse" TEXT,
    "typeIdentite" "TypeIdentite",
    "numIdentite" TEXT,
    "qualite" "QualiteProprietaire",
    "prixType" "PrixType",
    "prixNature" "PrixNature",
    "prixSource" "PrixSource",
    "paiementVente" "PaiementVente",
    "paiementLocation" "PaiementLocation",
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Proprietaire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BienImmobilier" (
    "id" SERIAL NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "type" "TypeBien" NOT NULL,
    "statut" "StatutBien" NOT NULL DEFAULT 'DISPONIBLE',
    "transaction" "TypeTransaction" NOT NULL DEFAULT 'VENTE',
    "prixVente" DOUBLE PRECISION,
    "prixLocation" DOUBLE PRECISION,
    "adresse" TEXT,
    "archive" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateMiseAJour" TIMESTAMP(3) NOT NULL,
    "proprietaireId" INTEGER NOT NULL,
    "createdById" INTEGER,
    "utilisateurId" INTEGER,

    CONSTRAINT "BienImmobilier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Suivi" (
    "id" SERIAL NOT NULL,
    "bienId" INTEGER NOT NULL,
    "estVisite" BOOLEAN NOT NULL DEFAULT false,
    "priorite" "Priorite" NOT NULL DEFAULT 'NORMAL',
    "aMandat" BOOLEAN NOT NULL DEFAULT false,
    "urlGoogleSheet" TEXT,
    "urlGooglePhotos" TEXT,

    CONSTRAINT "Suivi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Papier" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "categorie" TEXT,
    "statut" "PapierStatut",
    "bienId" INTEGER NOT NULL,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Papier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PieceJointe" (
    "id" SERIAL NOT NULL,
    "type" "TypePieceJointe" NOT NULL,
    "visibilite" "Visibilite" NOT NULL DEFAULT 'INTERNE',
    "url" TEXT NOT NULL,
    "nom" TEXT,
    "categorie" TEXT,
    "bienId" INTEGER NOT NULL,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PieceJointe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visite" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "nomClient" TEXT NOT NULL,
    "telClient" TEXT,
    "avis" TEXT,
    "statut" TEXT NOT NULL,
    "bienId" INTEGER NOT NULL,

    CONSTRAINT "Visite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetailAppartement" (
    "id" SERIAL NOT NULL,
    "bienId" INTEGER NOT NULL,
    "typeAppart" TEXT,
    "surfaceTotal" DOUBLE PRECISION,
    "surfaceSalon" DOUBLE PRECISION,
    "surfaceChambre" DOUBLE PRECISION,
    "surfaceCuisine" DOUBLE PRECISION,
    "surfaceSDB" DOUBLE PRECISION,
    "etage" INTEGER,
    "finition" TEXT,
    "anneeConstruction" INTEGER,
    "ascenseur" BOOLEAN NOT NULL DEFAULT false,
    "chauffage" "TypeChauffage",
    "climatisation" BOOLEAN NOT NULL DEFAULT false,
    "cuisineEquipee" BOOLEAN NOT NULL DEFAULT false,
    "meuble" BOOLEAN NOT NULL DEFAULT false,
    "parking" BOOLEAN NOT NULL DEFAULT false,
    "gardinage" BOOLEAN NOT NULL DEFAULT false,
    "proximiteEcole" BOOLEAN NOT NULL DEFAULT false,
    "proximiteTransport" "TypeTransport"[],
    "proximitePlage" BOOLEAN NOT NULL DEFAULT false,
    "proximiteAeroport" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DetailAppartement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetailTerrain" (
    "id" SERIAL NOT NULL,
    "bienId" INTEGER NOT NULL,
    "surface" DOUBLE PRECISION NOT NULL,
    "vocation" TEXT,
    "longueur" DOUBLE PRECISION,
    "largeur" DOUBLE PRECISION,
    "facades" INTEGER,
    "viabilise" BOOLEAN NOT NULL DEFAULT false,
    "statutJuridique" TEXT,

    CONSTRAINT "DetailTerrain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetailVilla" (
    "id" SERIAL NOT NULL,
    "bienId" INTEGER NOT NULL,
    "surface" DOUBLE PRECISION NOT NULL,
    "vocation" TEXT,
    "longueur" DOUBLE PRECISION,
    "largeur" DOUBLE PRECISION,
    "facades" INTEGER,
    "viabilise" BOOLEAN NOT NULL DEFAULT false,
    "surfaceBatie" DOUBLE PRECISION,
    "etages" INTEGER,
    "pieces" INTEGER,
    "etat" "EtatVilla",
    "composition" TEXT,
    "jardin" BOOLEAN NOT NULL DEFAULT false,
    "garage" BOOLEAN NOT NULL DEFAULT false,
    "piscine" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DetailVilla_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetailLocal" (
    "id" SERIAL NOT NULL,
    "bienId" INTEGER NOT NULL,
    "surface" DOUBLE PRECISION NOT NULL,
    "typeActivite" "TypeLocal",
    "hauteur" DOUBLE PRECISION,
    "facades" INTEGER,

    CONSTRAINT "DetailLocal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetailImmeuble" (
    "id" SERIAL NOT NULL,
    "bienId" INTEGER NOT NULL,
    "surface" DOUBLE PRECISION NOT NULL,
    "vocation" TEXT,
    "longueur" DOUBLE PRECISION,
    "largeur" DOUBLE PRECISION,
    "facades" INTEGER,
    "viabilise" BOOLEAN NOT NULL DEFAULT false,
    "surfaceBatie" DOUBLE PRECISION,
    "etages" INTEGER,
    "pieces" INTEGER,
    "etat" "EtatVilla",
    "jardin" BOOLEAN NOT NULL DEFAULT false,
    "garage" BOOLEAN NOT NULL DEFAULT false,
    "piscine" BOOLEAN NOT NULL DEFAULT false,
    "nbAppartements" INTEGER,
    "surfaceSol" DOUBLE PRECISION,

    CONSTRAINT "DetailImmeuble_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_email_key" ON "Utilisateur"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Suivi_bienId_key" ON "Suivi"("bienId");

-- CreateIndex
CREATE UNIQUE INDEX "DetailAppartement_bienId_key" ON "DetailAppartement"("bienId");

-- CreateIndex
CREATE UNIQUE INDEX "DetailTerrain_bienId_key" ON "DetailTerrain"("bienId");

-- CreateIndex
CREATE UNIQUE INDEX "DetailVilla_bienId_key" ON "DetailVilla"("bienId");

-- CreateIndex
CREATE UNIQUE INDEX "DetailLocal_bienId_key" ON "DetailLocal"("bienId");

-- CreateIndex
CREATE UNIQUE INDEX "DetailImmeuble_bienId_key" ON "DetailImmeuble"("bienId");

-- AddForeignKey
ALTER TABLE "BienImmobilier" ADD CONSTRAINT "BienImmobilier_proprietaireId_fkey" FOREIGN KEY ("proprietaireId") REFERENCES "Proprietaire"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BienImmobilier" ADD CONSTRAINT "BienImmobilier_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BienImmobilier" ADD CONSTRAINT "BienImmobilier_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Suivi" ADD CONSTRAINT "Suivi_bienId_fkey" FOREIGN KEY ("bienId") REFERENCES "BienImmobilier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Papier" ADD CONSTRAINT "Papier_bienId_fkey" FOREIGN KEY ("bienId") REFERENCES "BienImmobilier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PieceJointe" ADD CONSTRAINT "PieceJointe_bienId_fkey" FOREIGN KEY ("bienId") REFERENCES "BienImmobilier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visite" ADD CONSTRAINT "Visite_bienId_fkey" FOREIGN KEY ("bienId") REFERENCES "BienImmobilier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailAppartement" ADD CONSTRAINT "DetailAppartement_bienId_fkey" FOREIGN KEY ("bienId") REFERENCES "BienImmobilier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailTerrain" ADD CONSTRAINT "DetailTerrain_bienId_fkey" FOREIGN KEY ("bienId") REFERENCES "BienImmobilier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailVilla" ADD CONSTRAINT "DetailVilla_bienId_fkey" FOREIGN KEY ("bienId") REFERENCES "BienImmobilier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailLocal" ADD CONSTRAINT "DetailLocal_bienId_fkey" FOREIGN KEY ("bienId") REFERENCES "BienImmobilier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailImmeuble" ADD CONSTRAINT "DetailImmeuble_bienId_fkey" FOREIGN KEY ("bienId") REFERENCES "BienImmobilier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

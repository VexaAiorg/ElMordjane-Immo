# ElMordjane-Immo - Plateforme de gestion immobilière

Une solution full-stack solide pour piloter l'administration des biens, le suivi du portefeuille et la diffusion des annonces. Conçue pour la performance et l'évolutivité.

## 🚀 Ce que la plateforme apporte (vision métier)

- **Espace de travail sécurisé** : rôles distincts admin/collaborateur avec droits maîtrisés, vérification JWT et mises à jour de profil/mot de passe.
- **Cycle de vie complet des biens** : saisie multi-type (appartement, villa, terrain, local, immeuble), statuts, archivage/restauration, historique du créateur et corbeille avec purge automatique.
- **Propriétaire et conformité réunis** : ajout ou sélection de propriétaires, checklists juridiques, pièces obligatoires, mandat et suivi intégrés.
- **Annonces centrées média** : upload/optimisation des photos, documents et liens de localisation avec visibilité publiable ou interne et suppression maîtrisée.
- **Recherche rapide à grande échelle** : recherche profonde et filtres (type, date, statut) pour cibler par critères, détails, propriétaires ou signaux de suivi.
- **Pilotage des collaborateurs** : vues admin sur les portefeuilles et productions, suivi des biens créés par collaborateur.
- **Gestion des demandes clients** : capture et suivi des demandes (demandes entrantes) de bout en bout.
- **Rétention et sécurité** : corbeille, restauration avant suppression définitive et nettoyage planifié des éléments obsolètes.
- **PDF prêts client en un clic** : exports brandés par bien ou en lot pour des dossiers partageables.
- **UX moderne et fluide** : navigation réactive, vues liste/grille, wizard multi-étapes pour réduire l'effort de saisie.

## 📌 Fonctionnalités clés (détaillées)

- **Gestion complète des biens** : création/édition multi-formats avec détails techniques selon le type, suivi (priorité, visite, mandat) et pièces jointes.
- **Médias et documents** : optimisation automatique des images, limites de taille pour les documents, visibilité interne/publiable, suppression disque + base.
- **Recherche et filtrage** : recherche textuelle profonde sur titres, descriptions, propriétaires et caractéristiques, filtres par type et tri par date.
- **Pilotage équipe** : création/mise à jour/suppression de collaborateurs (admin only), vue des biens par collaborateur, séparation admin vs collab sur les archives.
- **Demandes clients** : CRUD complet des demandes avec horodatage et tri récent.
- **Export PDF** : génération de dossiers PDF prêts à partager (un bien ou lot), intégrant médias, détails, prix et suivi.
- **Sécurité et rémanence** : authentification JWT, mise à jour profil/mot de passe, corbeille, restauration, purge planifiée des fichiers et données obsolètes.

## 🖼️ Aperçu en images

| Tableau de bord (vue globale) | Fiche bien (liste/grid) | Export/Actions |
| --- | --- | --- |
| ![Tableau de bord](assets/Screenshot%20From%202026-01-05%2016-07-15.png) | ![Carte bien](assets/Screenshot%20From%202026-01-05%2016-07-25.png) | ![Actions PDF et filtres](assets/Screenshot%20From%202026-01-05%2016-07-35.png) |
| ![Filtres et tri](assets/Screenshot%20From%202026-01-05%2016-07-38.png) | ![Statuts et suivi](assets/Screenshot%20From%202026-01-05%2016-07-44.png) | ![Vue liste/grille](assets/Screenshot%20From%202026-01-05%2016-07-51.png) |
| ![Suivi et mandat](assets/Screenshot%20From%202026-01-05%2016-08-02.png) | ![Détails bien](assets/Screenshot%20From%202026-01-05%2016-08-20.png) | ![Corbeille/archives](assets/Screenshot%20From%202026-01-05%2016-08-44.png) |

## 🛠️ Pile technique

### Frontend
- **Framework** : [React](https://react.dev/) avec [Vite](https://vitejs.dev/)
- **UI & animations** : [Framer Motion](https://www.framer.com/motion/), [Lucide React](https://lucide.dev/)
- **Etat & formulaires** : React Router, React Hook Form, Zod (validation), Axios.

### Backend
- **Runtime** : [Node.js](https://nodejs.org/)
- **Framework** : [Express.js](https://expressjs.com/)
- **Base de données** : [PostgreSQL](https://www.postgresql.org/)
- **ORM** : [Prisma](https://www.prisma.io/)
- **Sécurité** : BCrypt, Helmet, CORS, JSON Web Tokens.

### DevOps
- **Conteneurisation** : Docker & Docker Compose.

## 📦 Démarrage rapide

### Prérequis
- [Docker](https://www.docker.com/) et [Docker Compose](https://docs.docker.com/compose/) installés.
- [Node.js](https://nodejs.org/) (optionnel pour un développement local hors Docker).

### Installation

1. **Cloner le dépôt**
   ```bash
   git clone https://github.com/yourusername/ElMordjane-Immo.git
   cd ElMordjane-Immo
   ```

2. **Configurer l'environnement**
   Le projet inclut un `docker-compose.yml`. Assurez-vous que les ports `3000` (backend), `80` (frontend) et `5433` (base de données) sont libres.

3. **Lancer la plateforme**
   ```bash
   docker-compose up -d --build
   ```

4. **Accéder à l'application**
   - **Frontend** : http://localhost:80
   - **API backend** : http://localhost:3000
   - **Base de données** : port `5433`

## 🔮 Feuille de route

- [ ] **Diffusion automatique** : publication des annonces vers les réseaux sociaux.
- [ ] **Analytique avancée** : tableau de bord de vues et interactions.
- [ ] **Portail public** : interface de recherche dédiée aux visiteurs.
- [ ] **Notifications** : emails et alertes in-app sur les événements clés.

## 📄 Licence
Projet sous licence MIT.

Développé par Sauzxa avec ❤️

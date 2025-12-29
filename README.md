# ElMordjane-Immo - Real Estate Management Platform

A robust, full-stack real estate management solution designed to streamline property administration, inventory tracking, and listing management. Built with a modern architecture for scalability and performance.

## 🚀 Features

- **Role-Based Authentication**: Secure access control for Administrators and Collaborators using JWT.
- **Property Management**: Comprehensive CRUD operations for various property types (Appartements, Villas, Terrains, Locals, Immeubles).
- **Advanced Search & Filtering**: Powerful filtering options to quickly locate properties based on criteria like price, location, and type.
- **PDF Export**: Generate professional PDF listings for properties with a single click.
- **Image Management**: Seamless photo uploading and management for property visuals.
- **Responsive Design**: A fluid, modern user interface built with React and Framer Motion for smooth interactions.

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React](https://react.dev/) with [Vite](https://vitejs.dev/)
- **Styling & UI**: [Framer Motion](https://www.framer.com/motion/) for animations, [Lucide React](https://lucide.dev/) for icons.
- **State & Logic**: React Router, React Hook Form, Zod (Validation), Axios.

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Security**: BCrypt, Helmet, CORS, JSON Web Tokens.

### DevOps
- **Containerization**: Docker & Docker Compose.

## 📦 Getting Started

### Prerequisites
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) installed on your machine.
- [Node.js](https://nodejs.org/) (optional, for local development outside Docker).

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ElMordjane-Immo.git
   cd ElMordjane-Immo
   ```

2. **Environment Configuration**
   The project comes with a pre-configured `docker-compose.yml`. Ensure ports `3000` (Backend), `80` (Frontend), and `5433` (Database) are free.

3. **Start the Application**
   Run the following command to build and start all services:
   ```bash
   docker-compose up -d --build
   ```

4. **Access the Application**
   - **Frontend**: [http://localhost:80](http://localhost:80)
   - **Backend API**: [http://localhost:3000](http://localhost:3000)
   - **Database**: Port `5433`

## 🔮 Roadmap

- [ ] **Auto-Posting**: Automated distribution of listings to social media platforms.
- [ ] **Advanced Analytics**: Dashboard for tracking property views and interaction metrics.
- [ ] **Public Portal**: Enhanced search interface for public users.
- [ ] **Notifications**: Email and system notifications for key events.

## 📄 License

This project is licensed under the MIT License.

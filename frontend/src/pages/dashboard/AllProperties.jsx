import React from 'react';
import { Search, Filter, Calendar } from 'lucide-react';
import PageTransition from '../../components/PageTransition';

const AllProperties = () => {
    return (
        <PageTransition>
            <div className="page-container">
                <header className="page-header">
                    <div>
                        <h1 className="page-title">Tous les Biens</h1>
                        <p className="page-subtitle">Gérez et suivez tous les biens immobiliers</p>
                    </div>
                </header>

                <div className="filters-bar">
                    <div className="search-wrapper">
                        <Search size={18} className="search-icon" />
                        <input type="text" placeholder="Rechercher un bien..." className="search-input" />
                    </div>

                    <div className="filter-dropdown">
                        <Filter size={18} />
                        <span>Type de bien</span>
                    </div>

                    <div className="filter-dropdown">
                        <Calendar size={18} />
                        <span>Date d'ajout</span>
                    </div>
                </div>

                <div className="stats-grid">
                    <div className="stat-card blue">
                        <div className="stat-value">24</div>
                        <div className="stat-label">Total Biens</div>
                    </div>
                    <div className="stat-card green">
                        <div className="stat-value">12</div>
                        <div className="stat-label">Disponibles</div>
                    </div>
                    <div className="stat-card orange">
                        <div className="stat-value">8</div>
                        <div className="stat-label">En Négociation</div>
                    </div>
                    <div className="stat-card purple">
                        <div className="stat-value">4</div>
                        <div className="stat-label">Vendus/Loués</div>
                    </div>
                </div>

                <div className="content-table-container">
                    <table className="glass-table">
                        <thead>
                            <tr>
                                <th>Bien</th>
                                <th>Type</th>
                                <th>Prix</th>
                                <th>Statut</th>
                                <th>Date d'ajout</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <div className="table-item-info">
                                        <span className="item-name">Villa Moderne</span>
                                        <span className="item-sub">Oran, Algérie</span>
                                    </div>
                                </td>
                                <td>Villa</td>
                                <td>45.000.000 DA</td>
                                <td><span className="status-badge available">Disponible</span></td>
                                <td>23 Nov 2025</td>
                                <td>...</td>
                            </tr>
                            <tr>
                                <td>
                                    <div className="table-item-info">
                                        <span className="item-name">Appartement F4</span>
                                        <span className="item-sub">Alger Centre</span>
                                    </div>
                                </td>
                                <td>Appartement</td>
                                <td>22.000.000 DA</td>
                                <td><span className="status-badge pending">En cours</span></td>
                                <td>20 Nov 2025</td>
                                <td>...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </PageTransition>
    );
};

export default AllProperties;

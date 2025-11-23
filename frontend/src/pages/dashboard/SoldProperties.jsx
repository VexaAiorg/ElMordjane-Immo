import React from 'react';
import PageTransition from '../../components/PageTransition';

const SoldProperties = () => {
    return (
        <PageTransition>
            <div className="page-container">
                <header className="page-header">
                    <div>
                        <h1 className="page-title">Ventes</h1>
                        <p className="page-subtitle">Historique des biens vendus</p>
                    </div>
                </header>

                <div className="content-card">
                    <div className="empty-state">
                        <h3>Aucune vente pour le moment</h3>
                        <p>Les biens vendus apparaîtront ici.</p>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default SoldProperties;

import React from 'react';
import PageTransition from '../../components/PageTransition';

const RentedProperties = () => {
    return (
        <PageTransition>
            <div className="page-container">
                <header className="page-header">
                    <div>
                        <h1 className="page-title">Locations</h1>
                        <p className="page-subtitle">Gestion des biens en location</p>
                    </div>
                </header>

                <div className="content-card">
                    <div className="empty-state">
                        <h3>Aucune location active</h3>
                        <p>Les biens loués apparaîtront ici.</p>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default RentedProperties;

import React from 'react';
import PageTransition from '../../components/PageTransition';

const Archives = () => {
    return (
        <PageTransition>
            <div className="page-container">
                <header className="page-header">
                    <div>
                        <h1 className="page-title">Archives</h1>
                        <p className="page-subtitle">Historique complet des transactions</p>
                    </div>
                </header>

                <div className="content-card">
                    <div className="empty-state">
                        <h3>Archives vides</h3>
                        <p>L'historique des transactions archivées apparaîtra ici.</p>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default Archives;

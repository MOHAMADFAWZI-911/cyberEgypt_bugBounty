import React, { useState, useEffect } from 'react';
import { get } from '../api';
import CompanyStats from './CompanyStats';
import CompanyReports from './CompanyReports';
import CompanyAssets from './CompanyAssets';
import CompanyProviders from './CompanyProviders';
import UserProfile from './UserProfile';

export default function CompanyDashboard({ user, onOpenReport, onNavigate }) {
    const [view, setView] = useState({ name: 'dashboard', payload: null });
    const [reports, setReports] = useState([]);

    useEffect(() => {
        async function loadReports() {
            setReports((await get('/reports?company_id=1')) || []);
        }
        loadReports();
    }, []);

    const renderContent = () => {
        switch (view.name) {
            case 'dashboard':
                return <CompanyStats reports={reports} />;
            case 'reports':
                return <CompanyReports reports={reports} onOpenReport={onOpenReport} />;
            case 'providers':
                return <CompanyProviders onNavigate={onNavigate} loggedInUser={user} />;
            case 'assets':
                return <CompanyAssets />;
            case 'providerProfile':
                return <UserProfile user={view.payload} loggedInUser={user} onBack={() => setView({ name: 'providers' })} />;
            default:
                return <CompanyStats reports={reports} />;
        }
    };

    return (
        <div className="company-dashboard-container">
            <nav className="company-nav-bar">
                <button
                    onClick={() => setView({ name: 'dashboard' })}
                    className={view.name === 'dashboard' ? 'active' : ''}
                >
                    Dashboard
                </button>
                <button
                    onClick={() => setView({ name: 'reports' })}
                    className={view.name === 'reports' ? 'active' : ''}
                >
                    Reports
                </button>
                <button
                    onClick={() => setView({ name: 'providers' })}
                    className={view.name === 'providers' ? 'active' : ''}
                >
                    Providers
                </button>
                <button
                    onClick={() => setView({ name: 'assets' })}
                    className={view.name === 'assets' ? 'active' : ''}
                >
                    Assets
                </button>
            </nav>
            <div className="company-dashboard-content">
                {renderContent()}
            </div>
        </div>
    );
}

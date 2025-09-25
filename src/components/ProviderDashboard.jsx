import React, { useState } from 'react';
import UserProfile from './UserProfile';
import ProviderRequests from './ProviderRequests';
import ProviderStats from './ProviderStats';

const ProviderDashboard = ({ user, onOpenReport }) => {
    const [view, setView] = useState('stats');

    const renderContent = () => {
        switch (view) {
            case 'stats':
                return <ProviderStats user={user} />;
            case 'newRequests':
                return <ProviderRequests user={user} onOpenReport={onOpenReport} viewType="new" />;
            case 'inProgress':
                return <ProviderRequests user={user} onOpenReport={onOpenReport} viewType="inProgress" />;
            case 'completed':
                return <ProviderRequests user={user} onOpenReport={onOpenReport} viewType="completed" />;
            case 'counter':
                return <ProviderRequests user={user} onOpenReport={onOpenReport} viewType="counter" />;
            case 'profile':
                return <UserProfile user={user} loggedInUser={user} />;
            default:
                return <ProviderStats user={user} />;
        }
    };

    return (
        <div className="provider-dashboard">
            <div className="dashboard-header">
                <nav className="nav-bar">
                    <button onClick={() => setView('stats')} className={view === 'stats' ? 'active' : ''}>
                        Dashboard
                    </button>
                    <button onClick={() => setView('newRequests')} className={view === 'newRequests' ? 'active' : ''}>
                        New Requests
                    </button>
                    <button onClick={() => setView('inProgress')} className={view === 'inProgress' ? 'active' : ''}>
                        In-Progress
                    </button>
                    <button onClick={() => setView('completed')} className={view === 'completed' ? 'active' : ''}>
                        Completed
                    </button>
                    <button onClick={() => setView('profile')} className={view === 'profile' ? 'active' : ''}>
                        My Profile
                    </button>
                </nav>
            </div>
            <div className="dashboard-content">
                {renderContent()}
            </div>
        </div>
    );
};

export default ProviderDashboard;
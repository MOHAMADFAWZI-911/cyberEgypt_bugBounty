import React, { useState, useEffect } from 'react';
import { get } from '../api';
import ResearcherStats from './ResearcherStats';
import ResearcherReports from './ResearcherReports';
import CompanyDiscovery from './CompanyDiscovery';
import UserProfile from './UserProfile';
import ResearcherCourses from './ResearcherCourses';
import CompanyProgram from './CompanyProgram'; // تم تصحيح مسار الاستيراد هنا

export default function ResearcherDashboard({ user, onOpenReport, onNavigate }) {
    const [view, setView] = useState({ name: 'dashboard', payload: null });
    const [reports, setReports] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        async function loadData() {
            setReports((await get(`/reports?reporter_id=${user.id}`)) || []);
            setCompanies((await get('/companies')) || []);
        }
        loadData();
    }, [user.id, refreshTrigger]);

    const handleOpenCompany = (company) => {
        setView({ name: 'companyProgram', payload: company });
    };

    const handleReportSubmitted = () => {
        setRefreshTrigger(prev => prev + 1);
        setView({ name: 'reports' });
    };

    const renderContent = () => {
        switch (view.name) {
            case 'dashboard':
                return <ResearcherStats reports={reports} />;
            case 'reports':
                return <ResearcherReports reports={reports} onOpenReport={onOpenReport} />;
            case 'discovery':
                return <CompanyDiscovery companies={companies} onOpenCompany={handleOpenCompany} />;
            case 'profile':
                return <UserProfile user={user} loggedInUser={user} />;
            case 'courses':
                return <ResearcherCourses />;
            case 'companyProgram':
                return <CompanyProgram companyId={view.payload.id} user={user} onBack={() => setView({ name: 'discovery' })} onReportSubmitted={handleReportSubmitted} />;
            default:
                return <ResearcherStats reports={reports} />;
        }
    };

    return (
        <div className="researcher-dashboard-container">
            <nav className="researcher-nav-bar">
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
                    onClick={() => setView({ name: 'discovery' })}
                    className={view.name === 'discovery' ? 'active' : ''}
                >
                    Company Discovery
                </button>
                <button
                    onClick={() => setView({ name: 'profile' })}
                    className={view.name === 'profile' ? 'active' : ''}
                >
                    Profile
                </button>
                <button
                    onClick={() => setView({ name: 'courses' })}
                    className={view.name === 'courses' ? 'active' : ''}
                >
                    Courses
                </button>
            </nav>
            <div className="researcher-dashboard-content">
                {renderContent()}
            </div>
        </div>
    );
}
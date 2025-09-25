import React, { useState, useEffect } from 'react';
import { get, post } from '../api';

const ResearcherReports = ({ reports, onOpenReport }) => {
    const [viewType, setViewType] = useState('my_reports');
    const [publicReports, setPublicReports] = useState([]);
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        async function loadPublicReports() {
            // جلب التقارير التي تم إغلاقها ومتاحة للعرض العام
            const pr = (await get('/reports?status=Closed&public=true')) || [];
            setPublicReports(pr);
        }
        if (viewType === 'public_disclosures') {
            loadPublicReports();
        }
    }, [viewType]);

    const filterReports = (reportList) => {
        if (statusFilter === 'all') {
            return reportList;
        }
        return reportList.filter(r => r.status.toLowerCase() === statusFilter.toLowerCase());
    };

    const renderReports = (reportList) => (
        <ul className="space-y-4">
            {filterReports(reportList).length > 0 ? (
                filterReports(reportList).map(r => (
                    <li key={r.id} className="p-4 border rounded-lg bg-white shadow-sm flex justify-between items-center">
                        <div>
                            <div className="font-semibold text-lg">{r.title}</div>
                            <div className="text-sm text-slate-500 mt-1">
                                Severity: {r.severity} - Status: <span className={`status-badge status-${r.status.toLowerCase()}`}>{r.status}</span>
                            </div>
                        </div>
                        <button className="btn btn-view" onClick={() => onOpenReport(r)}>View Details</button>
                    </li>
                ))
            ) : (
                <li className="text-center text-slate-500">
                    {viewType === 'my_reports' ? "You have not submitted any reports yet." : "No public reports available."}
                </li>
            )}
        </ul>
    );

    return (
        <div className="researcher-reports-page">
            <h2 className="text-2xl font-bold mb-4">My Reports</h2>
            <div className="report-filter-nav mb-4">
                <button
                    onClick={() => setViewType('my_reports')}
                    className={viewType === 'my_reports' ? 'active' : ''}
                >
                    My Reports
                </button>
                <button
                    onClick={() => setViewType('public_disclosures')}
                    className={viewType === 'public_disclosures' ? 'active' : ''}
                >
                    Public Disclosures
                </button>
            </div>
            {viewType === 'my_reports' && (
                <div className="filter-buttons mb-4 space-x-2">
                    <button
                        className={`btn ${statusFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setStatusFilter('all')}
                    >
                        All
                    </button>
                    <button
                        className={`btn ${statusFilter === 'new' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setStatusFilter('new')}
                    >
                        New
                    </button>
                    <button
                        className={`btn ${statusFilter === 'assigned' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setStatusFilter('assigned')}
                    >
                        Assigned
                    </button>
                    <button
                        className={`btn ${statusFilter === 'accepted' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setStatusFilter('accepted')}
                    >
                        Accepted
                    </button>
                    <button
                        className={`btn ${statusFilter === 'closed' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setStatusFilter('closed')}
                    >
                        Closed
                    </button>
                    <button
                        className={`btn ${statusFilter === 'paid' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setStatusFilter('paid')}
                    >
                        Paid
                    </button>
                </div>
            )}
            {viewType === 'my_reports' ? renderReports(reports) : renderReports(publicReports)}
        </div>
    );
};

export default ResearcherReports;

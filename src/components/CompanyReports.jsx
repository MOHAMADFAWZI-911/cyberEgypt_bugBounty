import React, { useState, useEffect } from 'react';
import { patch, get, post } from '../api';

const CompanyReports = ({ reports, onOpenReport }) => {
    const [viewType, setViewType] = useState('all');
    const [providers, setProviders] = useState([]);
    const [assignments, setAssignments] = useState([]);

    async function loadData() {
        const allUsers = (await get('/users')) || [];
        const providerUsers = allUsers.filter(user => user.role === 'provider');
        setProviders(providerUsers);

        const allAssignments = (await get('/assignments')) || [];
        const companyAssignments = allAssignments.filter(a => a.company_id === 1);
        setAssignments(companyAssignments);
    }
    useEffect(() => {
        loadData();
    }, []);

    const handleAssignProvider = async (report) => {
        const providersList = providers.map(p => `ID: ${p.id}, Name: ${p.name}`).join("\n");
        const providerId = window.prompt(`Please enter the ID of the provider to assign this report to:\n\n${providersList}`);

        if (!providerId) {
            window.alert('Assignment cancelled.');
            return;
        }

        const selectedProvider = providers.find(p => p.id === parseInt(providerId));
        if (!selectedProvider) {
            window.alert('Invalid provider ID. Please try again.');
            return;
        }

        await post('/assignments', {
            report_id: report.id,
            provider_id: selectedProvider.id,
            status: 'Assigned',
            assigned_at: new Date().toISOString(),
            negotiation_status: 'pending_provider_offer'
        });

        await patch(`/reports/${report.id}`, {
            assigned_service_provider_id: selectedProvider.id,
            status: 'Assigned',
            timeline: [
                ...(report.timeline || []),
                {
                    action: 'assigned',
                    comment: `Assigned to provider ${selectedProvider.name} (ID: ${selectedProvider.id})`,
                    timestamp: new Date().toISOString(),
                },
            ],
        });

        window.alert(`Report successfully assigned to ${selectedProvider.name}.`);
    };

    const handleAcceptReport = async (report) => {
        await patch(`/reports/${report.id}`, {
            status: 'Accepted',
            timeline: [
                ...(report.timeline || []),
                {
                    action: 'accepted',
                    comment: 'Accepted by company',
                    timestamp: new Date().toISOString(),
                },
            ],
        });
        window.alert('Report accepted!');
    };

    const handleAcceptOffer = async (assignmentId, reportId, providerOffer) => {
        await patch(`/assignments/${assignmentId}`, { negotiation_status: 'agreed' });
        await patch(`/reports/${reportId}`, {
            status: 'Accepted',
            bounty_paid: providerOffer,
            timeline: [
                ...(reports.find(r => r.id === reportId)?.timeline || []),
                { action: 'accepted', comment: `Agreed to provider offer of $${providerOffer}`, timestamp: new Date().toISOString() },
            ],
        });
        window.alert('Offer accepted and report status updated!');
    };

    const handleCounterOffer = async (assignmentId, reportId) => {
        const counterOffer = window.prompt('Enter your counter offer price:');
        if (!counterOffer || isNaN(counterOffer)) {
            window.alert('Invalid price.');
            return;
        }
        await patch(`/assignments/${assignmentId}`, {
            negotiation_status: 'company_counter_offer',
            company_counter_offer: parseFloat(counterOffer)
        });
        window.alert('Counter offer sent!');
    };

    const filterReports = () => {
        switch (viewType) {
            case 'open':
                return reports.filter(r => ['Submitted', 'Assigned', 'Accepted', 'Triaged', 'In Progress', 'Awaiting Fix'].includes(r.status));
            case 'closed':
                return reports.filter(r => ['Closed', 'Resolved', 'False Positive', 'Duplicate'].includes(r.status));
            case 'duplicate':
                return reports.filter(r => r.status === 'Duplicate');
            case 'falsePositive':
                return reports.filter(r => r.status === 'False Positive');
            default:
                return reports;
        }
    };

    const filteredReports = filterReports();

    return (
        <div className="company-reports-page">
            <h2 className="text-2xl font-bold mb-4">Reports</h2>
            <div className="report-filter-nav mb-4">
                <button
                    onClick={() => setViewType('all')}
                    className={viewType === 'all' ? 'active' : ''}
                >
                    All Reports
                </button>
                <button
                    onClick={() => setViewType('open')}
                    className={viewType === 'open' ? 'active' : ''}
                >
                    Open
                </button>
                <button
                    onClick={() => setViewType('closed')}
                    className={viewType === 'closed' ? 'active' : ''}
                >
                    Closed
                </button>
                <button
                    onClick={() => setViewType('duplicate')}
                    className={viewType === 'duplicate' ? 'active' : ''}
                >
                    Duplicates
                </button>
                <button
                    onClick={() => setViewType('falsePositive')}
                    className={viewType === 'falsePositive' ? 'active' : ''}
                >
                    False Positives
                </button>
            </div>
            <div className="space-y-4">
                {filteredReports.length > 0 ? (
                    filteredReports.map((r) => {
                        const assignment = assignments.find(a => a.report_id === r.id);
                        return (
                            <div
                                key={r.id}
                                className="p-4 border rounded-lg bg-white shadow-sm"
                            >
                                <div className="font-semibold text-lg">{r.title}</div>
                                <div className="text-sm text-slate-500 mt-1">
                                    Severity: {r.severity} - Status: <span className={`status-badge status-${r.status.toLowerCase()}`}>{r.status}</span>
                                </div>
                                {assignment && assignment.negotiation_status === 'pending_company_response' && (
                                    <div className="text-sm text-blue-500 font-bold mt-1">
                                        Provider Offer: ${assignment.provider_offer}
                                    </div>
                                )}
                                {assignment && assignment.negotiation_status === 'company_counter_offer' && (
                                    <div className="text-sm text-blue-500 font-bold mt-1">
                                        Your Counter Offer: ${assignment.company_counter_offer}
                                    </div>
                                )}
                                <div className="flex space-x-2 mt-3">
                                    <button
                                        className="btn btn-view"
                                        onClick={() => onOpenReport && onOpenReport(r)}
                                    >
                                        View Details
                                    </button>
                                    {r.status === 'Submitted' && (
                                        <>
                                            <button
                                                className="btn btn-assign"
                                                onClick={() => handleAssignProvider(r)}
                                            >
                                                Assign Provider
                                            </button>
                                            <button
                                                className="btn btn-accept"
                                                onClick={() => handleAcceptReport(r)}
                                            >
                                                Accept Report
                                            </button>
                                        </>
                                    )}
                                    {assignment?.negotiation_status === 'pending_company_response' && (
                                        <>
                                            <button
                                                className="btn btn-accept"
                                                onClick={() => handleAcceptOffer(assignment.id, r.id, assignment.provider_offer)}
                                            >
                                                Accept Offer
                                            </button>
                                            <button
                                                className="btn btn-assign"
                                                onClick={() => handleCounterOffer(assignment.id, r.id)}
                                            >
                                                Make Counter
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-center text-slate-500">
                        No reports found in this category.
                    </p>
                )}
            </div>
        </div>
    );
};

export default CompanyReports;

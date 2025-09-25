import React, { useState, useEffect } from 'react';
import { get, patch } from '../api';

const ProviderRequests = ({ user, onOpenReport, viewType }) => {
    const [assignments, setAssignments] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [providerPrice, setProviderPrice] = useState(0);

    async function loadAssignments() {
        const allAssignments = (await get(`/assignments?provider_id=${user.id}`)) || [];
        const assignmentsWithReports = await Promise.all(
            allAssignments.map(async (assignment) => {
                const report = await get(`/reports/${assignment.report_id}`);
                const company = await get(`/companies/${report.company_id}`);
                return { ...assignment, report, company: company?.name };
            })
        );
        setAssignments(assignmentsWithReports);
    }

    useEffect(() => {
        loadAssignments();
    }, [user]);

    const handleOffer = async (assignmentId) => {
        if (!providerPrice || providerPrice <= 0) {
            window.alert('Please enter a valid price.');
            return;
        }

        await patch(`/assignments/${assignmentId}`, {
            negotiation_status: 'pending_company_response',
            provider_offer: providerPrice,
        });

        await loadAssignments();
        window.alert('Your offer has been submitted for review.');
    };

    const handleAccept = async (assignmentId, reportId) => {
        await patch(`/assignments/${assignmentId}`, { status: 'Accepted', negotiation_status: 'agreed' });
        await patch(`/reports/${reportId}`, {
            status: 'In Progress',
            timeline: [
                { action: 'assigned', comment: 'Assigned to provider', timestamp: new Date().toISOString() },
                { action: 'accepted', comment: 'Accepted by provider', timestamp: new Date().toISOString() },
            ],
        });
        await loadAssignments();
        window.alert('Request accepted successfully!');
    };

    const handleComplete = async (assignmentId, reportId) => {
        await patch(`/assignments/${assignmentId}`, { status: 'Completed' });
        await patch(`/reports/${reportId}`, {
            status: 'Closed',
            timeline: [
                { action: 'completed', comment: 'Work completed by provider', timestamp: new Date().toISOString() },
            ],
        });
        await loadAssignments();
        window.alert('Request marked as completed!');
    };

    const filterAssignments = assignments.filter(
        (a) => {
            if (viewType === 'new' && a.status === 'Assigned' && a.negotiation_status !== 'company_counter_offer') return true;
            if (viewType === 'inProgress' && a.status === 'In Progress') return true;
            if (viewType === 'completed' && a.status === 'Completed') return true;
            if (viewType === 'counter' && a.negotiation_status === 'company_counter_offer') return true;
            return false;
        }
    );

    const renderAssignments = (list) => (
        <ul className="space-y-4">
            {list.length > 0 ? (
                list.map((assignment) => (
                    <li key={assignment.id} className="p-4 border rounded-lg bg-white shadow-sm flex justify-between items-center transition-transform transform hover:scale-[1.01]">
                        <div>
                            <div className="font-semibold text-lg">{assignment.report?.title}</div>
                            <div className="text-sm text-gray-500">From: {assignment.company}</div>
                            {assignment.negotiation_status === 'company_counter_offer' && (
                                <div className="text-sm text-green-500 font-bold mt-1">Company Counter Offer: ${assignment.company_counter_offer}</div>
                            )}
                        </div>
                        <div className="flex space-x-2">
                            <button onClick={() => onOpenReport(assignment.report)} className="btn btn-view">
                                View Report
                            </button>
                            {assignment.status === 'Assigned' && assignment.negotiation_status !== 'company_counter_offer' && (
                                <>
                                    <input
                                        type="number"
                                        placeholder="Your price"
                                        className="p-2 border rounded"
                                        value={providerPrice}
                                        onChange={(e) => setProviderPrice(e.target.value)}
                                    />
                                    <button onClick={() => handleOffer(assignment.id)} className="btn btn-primary">
                                        Submit Offer
                                    </button>
                                </>
                            )}
                            {assignment.negotiation_status === 'company_counter_offer' && (
                                <button onClick={() => handleAccept(assignment.id, assignment.report.id)} className="btn btn-accept">
                                    Accept Offer
                                </button>
                            )}
                            {assignment.status === 'In Progress' && (
                                <button onClick={() => handleComplete(assignment.id, assignment.report.id)} className="btn btn-primary">
                                    Complete
                                </button>
                            )}
                        </div>
                    </li>
                ))
            ) : (
                <p className="text-center text-slate-500">No requests in this category.</p>
            )}
        </ul>
    );

    return (
        <div className="provider-requests-page">
            <h2 className="text-2xl font-bold mb-4">Service Requests</h2>
            <div className="filter-buttons mb-4">
            </div>
            {renderAssignments(filterAssignments)}
        </div>
    );
};

export default ProviderRequests;

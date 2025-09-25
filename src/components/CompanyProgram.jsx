import React, { useState, useEffect } from 'react';
import { get, post } from '../api';

const CompanyProgram = ({ companyId, user, onBack, onReportSubmitted }) => {
    const [company, setCompany] = useState(null);
    const [assets, setAssets] = useState([]);
    const [reportForm, setReportForm] = useState({
        title: '',
        severity: 'Low',
        description: '',
        steps_to_reproduce: '',
        cvss_score: ''
    });

    async function loadData() {
        const companyData = await get(`/companies/${companyId}`);
        const companyAssets = (await get(`/assets?company_id=${companyId}`)) || [];
        setCompany(companyData);
        setAssets(companyAssets);
    }

    useEffect(() => {
        loadData();
    }, [companyId]);

    const handleReportSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            project_id: assets[0]?.id || null,
            company_id: companyId,
            reporter_id: user.id,
            title: reportForm.title,
            description: reportForm.description,
            steps_to_reproduce: reportForm.steps_to_reproduce,
            severity: reportForm.severity,
            status: 'Submitted',
            created_at: new Date().toISOString(),
            cvss_score: reportForm.cvss_score,
            poc_attachment_urls: ['/uploads/mock_poc.png'],
            timeline: [{
                user_id: user.id,
                action: 'created',
                comment: 'Initial report',
                timestamp: new Date().toISOString(),
            }]
        };
        await post('/reports', payload);
        window.alert('Report submitted successfully!');
        setReportForm({
            title: '',
            severity: 'Low',
            description: '',
            steps_to_reproduce: '',
            cvss_score: ''
        });
        onReportSubmitted();
    };

    if (!company) {
        return <div>Loading...</div>;
    }

    return (
        <div className="company-program-page p-4 bg-white shadow rounded">
            <button className="text-sm text-slate-600 hover:underline mb-4" onClick={onBack}>← Back to Discovery</button>
            <h2 className="text-2xl font-bold mb-2">Program: {company.name}</h2>
            <p className="text-slate-600 mb-6">{company.description}</p>
            
            <h3 className="text-xl font-semibold mb-4">Assets (Scope)</h3>
            <ul className="space-y-2 mb-8">
                {assets.length > 0 ? (
                    assets.map(a => (
                        <li key={a.id} className="p-3 border rounded-lg bg-slate-50">
                            <div className="font-medium">{a.name} <span className="text-sm text-gray-500">({a.type})</span></div>
                            <div className="text-xs text-gray-400 mt-1">Bounty: {a.bounty_type} {a.amount_min ? `($${a.amount_min}-${a.amount_max})` : ''} {a.points_value ? `(${a.points_value} pts)` : ''}</div>
                        </li>
                    ))
                ) : (
                    <p className="text-sm text-slate-500">No assets defined yet.</p>
                )}
            </ul>
            
            <hr />

            <h3 className="text-xl font-semibold mt-8 mb-4">Submit a New Report</h3>
            <form onSubmit={handleReportSubmit} className="space-y-4">
                <div>
                    <label className="block text-gray-700 font-medium">Title</label>
                    <input
                        type="text"
                        className="w-full p-2 border rounded mt-1"
                        value={reportForm.title}
                        onChange={e => setReportForm({ ...reportForm, title: e.target.value })}
                        required
                    />
                </div>
                <div>
                    <label className="block text-gray-700 font-medium">Severity</label>
                    <select
                        className="w-full p-2 border rounded mt-1"
                        value={reportForm.severity}
                        onChange={e => setReportForm({ ...reportForm, severity: e.target.value })}
                    >
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                        <option>Critical</option>
                    </select>
                </div>
                <div>
                    <label className="block text-gray-700 font-medium">CVSS Score (0.0-10.0)</label>
                    <input
                        type="number"
                        step="0.1"
                        min="0.0"
                        max="10.0"
                        className="w-full p-2 border rounded mt-1"
                        value={reportForm.cvss_score}
                        onChange={e => setReportForm({ ...reportForm, cvss_score: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-gray-700 font-medium">Description</label>
                    <textarea
                        className="w-full p-2 border rounded mt-1"
                        rows="4"
                        value={reportForm.description}
                        onChange={e => setReportForm({ ...reportForm, description: e.target.value })}
                        required
                    ></textarea>
                </div>
                <div>
                    <label className="block text-gray-700 font-medium">Steps to Reproduce</label>
                    <textarea
                        className="w-full p-2 border rounded mt-1"
                        rows="4"
                        value={reportForm.steps_to_reproduce}
                        onChange={e => setReportForm({ ...reportForm, steps_to_reproduce: e.target.value })}
                        required
                    ></textarea>
                </div>
                <button
                    type="submit"
                    className="bg-primary text-white px-4 py-2 rounded hover:bg-accent transition-colors"
                >
                    Submit Report
                </button>
            </form>
        </div>
    );
};

export default CompanyProgram;

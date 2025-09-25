import React, { useState, useEffect } from 'react';
import { get } from '../api';

const CompanyStats = ({ reports }) => {
    const [stats, setStats] = useState({
        totalReports: 0,
        openReports: 0,
        completedReports: 0,
        totalBountiesPaid: 0,
        activeResearchers: 0
    });

    useEffect(() => {
        async function loadStats() {
            const totalReports = reports.length;
            const completedReports = reports.filter(r => r.status === 'Closed' || r.status === 'Paid').length;
            const openReports = totalReports - completedReports;
            const totalBountiesPaid = reports.reduce((sum, r) => sum + (r.bounty_paid || 0), 0);

            // حساب عدد الباحثين النشطين
            const allReports = (await get('/reports')) || [];
            const activeResearchers = new Set(allReports.map(r => r.reporter_id)).size;

            setStats({
                totalReports,
                openReports,
                completedReports,
                totalBountiesPaid,
                activeResearchers
            });
        }
        if (reports.length > 0) {
            loadStats();
        }
    }, [reports]);

    return (
        <div className="company-stats-page p-4 bg-white shadow rounded">
            <h2 className="text-2xl font-bold mb-4">Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="stat-card p-4 border rounded-lg bg-slate-50">
                    <h3 className="text-lg font-medium">Total Reports</h3>
                    <p className="text-xl font-bold">{stats.totalReports}</p>
                </div>
                <div className="stat-card p-4 border rounded-lg bg-slate-50">
                    <h3 className="text-lg font-medium">Open Reports</h3>
                    <p className="text-xl font-bold">{stats.openReports}</p>
                </div>
                <div className="stat-card p-4 border rounded-lg bg-slate-50">
                    <h3 className="text-lg font-medium">Completed Reports</h3>
                    <p className="text-xl font-bold">{stats.completedReports}</p>
                </div>
                <div className="stat-card p-4 border rounded-lg bg-slate-50">
                    <h3 className="text-lg font-medium">Total Bounties Paid</h3>
                    <p className="text-xl font-bold">${stats.totalBountiesPaid}</p>
                </div>
                <div className="stat-card p-4 border rounded-lg bg-slate-50">
                    <h3 className="text-lg font-medium">Active Researchers</h3>
                    <p className="text-xl font-bold">{stats.activeResearchers}</p>
                </div>
            </div>
        </div>
    );
};

export default CompanyStats;

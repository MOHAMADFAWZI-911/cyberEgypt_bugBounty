import React, { useState, useEffect } from 'react';
import { get } from '../api';

const ResearcherStats = ({ user, reports }) => {
    const [stats, setStats] = useState({
        acceptedReports: 0,
        totalReports: 0,
        totalBounties: 0,
        totalPoints: 0,
    });

    useEffect(() => {
        if (reports && reports.length > 0) {
            const acceptedReports = reports.filter(r => r.status === 'Accepted' || r.status === 'Closed' || r.status === 'Resolved').length;
            const totalReports = reports.length;
            const totalBounties = reports.reduce((sum, r) => sum + (r.bounty_paid || 0), 0);
            const totalPoints = reports.reduce((sum, r) => sum + (r.points_paid || 0), 0);

            setStats({
                acceptedReports,
                totalReports,
                totalBounties,
                totalPoints,
            });
        }
    }, [reports]);

    // نظام تصنيف بسيط بناءً على عدد التقارير المقبولة
    const getResearcherRank = (acceptedCount) => {
        if (acceptedCount >= 10) return "Expert";
        if (acceptedCount >= 5) return "Professional";
        if (acceptedCount >= 1) return "Novice";
        return "Beginner";
    };

    const rank = getResearcherRank(stats.acceptedReports);

    return (
        <div className="researcher-stats-page p-4 bg-white shadow rounded">
            <h2 className="text-2xl font-bold mb-4">Researcher Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="stat-card p-4 border rounded-lg bg-slate-50">
                    <h3 className="text-lg font-medium">My Rank</h3>
                    <p className="text-xl font-bold">{rank}</p>
                </div>
                <div className="stat-card p-4 border rounded-lg bg-slate-50">
                    <h3 className="text-lg font-medium">Accepted Reports</h3>
                    <p className="text-xl font-bold">{stats.acceptedReports}</p>
                </div>
                <div className="stat-card p-4 border rounded-lg bg-slate-50">
                    <h3 className="text-lg font-medium">Total Reports</h3>
                    <p className="text-xl font-bold">{stats.totalReports}</p>
                </div>
                <div className="stat-card p-4 border rounded-lg bg-slate-50">
                    <h3 className="text-lg font-medium">Total Bounties</h3>
                    <p className="text-xl font-bold">${stats.totalBounties}</p>
                </div>
                <div className="stat-card p-4 border rounded-lg bg-slate-50">
                    <h3 className="text-lg font-medium">Total Points</h3>
                    <p className="text-xl font-bold">{stats.totalPoints}</p>
                </div>
            </div>
        </div>
    );
};

export default ResearcherStats;

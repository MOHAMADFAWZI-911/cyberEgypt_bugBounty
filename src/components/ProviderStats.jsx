import React, { useState, useEffect } from 'react';
import { get } from '../api';

const ProviderStats = ({ user }) => {
    const [stats, setStats] = useState({
        totalEarnings: 0,
        projectsCompleted: 0,
        rating: 0
    });

    useEffect(() => {
        async function loadStats() {
            // جلب جميع المهام والتقارير
            const assignments = await get(`/assignments?provider_id=${user.id}`) || [];
            const reports = await get(`/reports`);

            // حساب المشاريع المكتملة
            const completedAssignments = assignments.filter(a => a.status === 'Completed');
            const projectsCompleted = completedAssignments.length;

            // حساب الأرباح الكلية
            let totalEarnings = 0;
            let totalRated = 0;
            let totalRating = 0;

            for (const assignment of completedAssignments) {
                const report = reports.find(r => r.id === assignment.report_id);
                if (report?.bounty_paid) {
                    totalEarnings += report.bounty_paid;
                }
                if (report?.rating) {
                    totalRated++;
                    totalRating += report.rating;
                }
            }

            // حساب التقييم
            const rating = totalRated > 0 ? (totalRating / totalRated).toFixed(1) : 'N/A';

            setStats({
                totalEarnings,
                projectsCompleted,
                rating
            });
        }
        loadStats();
    }, [user]);

    return (
        <div className="provider-stats p-4 bg-white shadow rounded">
            <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="stat-card p-4 border rounded-lg bg-slate-50">
                    <h3 className="text-lg font-medium">Total Earnings</h3>
                    <p className="text-xl font-bold">${stats.totalEarnings}</p>
                </div>
                <div className="stat-card p-4 border rounded-lg bg-slate-50">
                    <h3 className="text-lg font-medium">Projects Completed</h3>
                    <p className="text-xl font-bold">{stats.projectsCompleted}</p>
                </div>
                <div className="stat-card p-4 border rounded-lg bg-slate-50">
                    <h3 className="text-lg font-medium">My Rating</h3>
                    <p className="text-xl font-bold">{stats.rating}/5</p>
                </div>
            </div>
        </div>
    );
};

export default ProviderStats;

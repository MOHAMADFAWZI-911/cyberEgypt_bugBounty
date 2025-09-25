import React, { useState, useEffect } from 'react';
import { get } from '../api';

const CompanyDiscovery = ({ onOpenCompany }) => { // تم إضافة prop جديد هنا
    const [companies, setCompanies] = useState([]);
    const [assets, setAssets] = useState([]);
    const [filter, setFilter] = useState('all');

    async function loadData() {
        const allCompanies = (await get('/companies')) || [];
        const allAssets = (await get('/assets')) || [];
        setCompanies(allCompanies);
        setAssets(allAssets);
    }

    useEffect(() => {
        loadData();
    }, []);

    const filterCompanies = () => {
        if (filter === 'all') {
            return companies;
        } else {
            return companies.filter(company => {
                const companyAssets = assets.filter(asset => asset.company_id === company.id);
                return companyAssets.some(asset => {
                    if (filter === 'cash' && asset.bounty_type === 'cash') return true;
                    if (filter === 'points' && asset.bounty_type === 'points') return true;
                    if (filter === 'none' && asset.bounty_type === 'none') return true;
                    return false;
                });
            });
        }
    };

    const filteredCompanies = filterCompanies();

    return (
        <div className="company-discovery-page p-4 bg-white shadow rounded">
            <h2 className="text-2xl font-bold mb-4">Discover Bug Bounty Programs</h2>
            <div className="filter-buttons mb-4 space-x-2">
                <button
                    className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setFilter('all')}
                >
                    All Programs
                </button>
                <button
                    className={`btn ${filter === 'cash' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setFilter('cash')}
                >
                    Cash
                </button>
                <button
                    className={`btn ${filter === 'points' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setFilter('points')}
                >
                    Points
                </button>
                <button
                    className={`btn ${filter === 'none' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setFilter('none')}
                >
                    No Bounty
                </button>
            </div>
            <ul className="space-y-4">
                {filteredCompanies.length > 0 ? (
                    filteredCompanies.map(c => (
                        <li key={c.id} className="p-4 border rounded-lg bg-white shadow-sm flex justify-between items-center">
                            <div>
                                <div className="font-semibold text-lg">{c.name}</div>
                                <div className="text-sm text-gray-500">
                                    <span className="font-medium">Assets:</span> {assets.filter(a => a.company_id === c.id).length}
                                </div>
                            </div>
                            <button className="btn bg-primary text-white px-3 py-1 rounded hover:bg-accent transition-colors"
                                    onClick={() => onOpenCompany(c)}> {/* تم إضافة الـ onClick هنا */}
                                View Program
                            </button>
                        </li>
                    ))
                ) : (
                    <p className="text-center text-slate-500">No companies found for this filter.</p>
                )}
            </ul>
        </div>
    );
};

export default CompanyDiscovery;

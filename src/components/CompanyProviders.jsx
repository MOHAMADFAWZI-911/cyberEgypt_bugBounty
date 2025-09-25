// ...Imports
import React, { useState, useEffect } from 'react';
import { get } from '../api';

const CompanyProviders = ({ onNavigate, loggedInUser }) => { // إضافة loggedInUser
    const [providers, setProviders] = useState([]);

    useEffect(() => {
        async function loadProviders() {
            const allUsers = (await get('/users')) || [];
            const providerUsers = allUsers.filter(user => user.role === 'provider');
            setProviders(providerUsers);
        }
        loadProviders();
    }, []);

    return (
        <div className="company-providers-page p-4 bg-white shadow rounded">
            <h2 className="text-2xl font-bold mb-4">Service Providers</h2>
            <p className="text-sm text-gray-600 mb-6">
                Here you can find a list of all registered service providers.
            </p>
            <ul className="space-y-4">
                {providers.length > 0 ? (
                    providers.map(provider => (
                        <li key={provider.id} className="p-4 border rounded-lg bg-white shadow-sm flex justify-between items-center">
                            <div>
                                <div className="font-semibold text-lg">{provider.name}</div>
                                <div className="text-sm text-gray-500">
                                    Reputation: <span className="font-bold text-green-600">{provider.reputation_score || 'N/A'}</span>
                                    {' '} | Specializations: {provider.specializations && provider.specializations.length > 0 ? provider.specializations.join(', ') : 'N/A'}
                                </div>
                            </div>
                            <button className="btn bg-primary text-white px-3 py-1 rounded hover:bg-accent transition-colors" onClick={() => onNavigate({ name: 'providerProfile', payload: provider })}>View Profile</button>
                        </li>
                    ))
                ) : (
                    <p className="text-center text-slate-500">
                        No service providers have registered yet.
                    </p>
                )}
            </ul>
        </div>
    );
};

export default CompanyProviders;

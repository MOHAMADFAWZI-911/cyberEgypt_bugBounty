import React, { useEffect, useState } from 'react';
import { get } from '../api';

export default function CompaniesList({ onOpenCompany }) {
  const [companies, setCompanies] = useState([]);
  const [assets, setAssets] = useState([]);
  const [q, setQ] = useState('');
  const [filterType, setFilterType] = useState('any');
  const [filterBounty, setFilterBounty] = useState('any');

  useEffect(()=>{
    async function load() {
      const c = await get('/companies');
      const a = await get('/assets');
      setCompanies(c || []);
      setAssets(a || []);
    }
    load();
  }, []);

  const filtered = companies.filter(comp => {
    if (q && !comp.name.toLowerCase().includes(q.toLowerCase())) return false;
    const compAssets = assets.filter(a=>a.company_id===comp.id);
    if (filterType !== 'any' && !compAssets.some(a=>a.type===filterType)) return false;
    if (filterBounty !== 'any' && !compAssets.some(a=>a.bounty_type===filterBounty)) return false;
    return true;
  });

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-3">
        <div className="bg-white shadow rounded p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold">Companies & Programs</h3>
            <div className="flex space-x-2">
              <input className="p-2 border rounded" placeholder="Search companies..." value={q} onChange={e=>setQ(e.target.value)} />
              <select className="p-2 border rounded" value={filterType} onChange={e=>setFilterType(e.target.value)}>
                <option value="any">Any type</option>
                <option value="web">Web</option>
                <option value="api">API</option>
                <option value="mobile">Mobile</option>
                <option value="executable">Downloadable</option>
              </select>
              <select className="p-2 border rounded" value={filterBounty} onChange={e=>setFilterBounty(e.target.value)}>
                <option value="any">Any bounty</option>
                <option value="cash">Cash</option>
                <option value="points">Points</option>
                <option value="none">No bounty</option>
              </select>
            </div>
          </div>

          <ul className="mt-3 space-y-2">
            {filtered.map(comp => (
              <li key={comp.id} className="p-3 border rounded flex justify-between items-center">
                <div>
                  <div className="font-medium">{comp.name}</div>
                  <div className="text-sm text-slate-500">{comp.description}</div>
                  <div className="text-xs text-slate-400 mt-1">Assets:</div>
                  <ul className="ml-3 text-sm">
                    {assets.filter(a=>a.company_id===comp.id).map(a=> (
                      <li key={a.id}>{a.name} — {a.type} — {a.bounty_type}{a.bounty_type==='cash'?` (${a.currency} ${a.amount_min}-${a.amount_max})`:''}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <button className="text-sm px-2 py-1 border rounded" onClick={()=>onOpenCompany && onOpenCompany(comp)}>View Program</button>
                </div>
              </li>
            ))}
            {filtered.length === 0 && <li className="text-sm text-slate-500 p-3">No companies match your search/filters.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}

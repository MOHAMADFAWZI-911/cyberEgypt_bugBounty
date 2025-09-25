import React, { useEffect, useState } from 'react';
import { get } from '../api';

export default function Stats({ companyId }) {
  const [counts, setCounts] = useState({ reports:0, open:0, closed:0, assets:0, providersAssigned:0 });

  async function load() {
    const reports = await get('/reports');
    const assets = await get('/assets');
    const assignments = await get('/assignments');
    const companyReports = companyId ? reports.filter(r=>r.company_id===companyId) : reports;
    const open = companyReports.filter(r=> r.status && !['Paid','Provider Completed','Accepted','Triaged','False Positive'].includes(r.status)).length;
    const closed = companyReports.length - open;
    setCounts({ reports: companyReports.length, open, closed, assets: assets.filter(a=> !companyId || a.company_id===companyId).length, providersAssigned: assignments.filter(a=> !companyId || a.company_id===companyId).length });
  }

  useEffect(()=>{ load(); }, [companyId]);

  return (
    <div className="bg-white shadow rounded p-4 mb-4">
      <h4 className="font-semibold mb-2">Program Stats</h4>
      <div className="grid grid-cols-4 gap-4">
        <div className="p-3 bg-slate-50 rounded">Reports<br/><span className="font-bold">{counts.reports}</span></div>
        <div className="p-3 bg-slate-50 rounded">Open<br/><span className="font-bold">{counts.open}</span></div>
        <div className="p-3 bg-slate-50 rounded">Closed<br/><span className="font-bold">{counts.closed}</span></div>
        <div className="p-3 bg-slate-50 rounded">Assets<br/><span className="font-bold">{counts.assets}</span></div>
      </div>
    </div>
  );
}

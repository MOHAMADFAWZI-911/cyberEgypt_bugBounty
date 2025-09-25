import React, { useEffect, useState } from 'react';
import { get, patch } from '../api';

export default function ReportDetail({ reportId, user, onBack }) {
  const [report, setReport] = useState(null);
  const [companyRewards, setCompanyRewards] = useState([]);
  const [assetRewards, setAssetRewards] = useState([]);
  const [assets, setAssets] = useState([]);
  const [triageComment, setTriageComment] = useState('');
  const [newComment, setNewComment] = useState('');
  const [users, setUsers] = useState([]); // لإظهار أسماء المستخدمين في التعليقات

  async function load() {
    if (!reportId) return;
    const r = await get(`/reports/${reportId}`);
    setReport(r);
    const cr = (await get(`/reward_options?company_id=${r.company_id}`)) || [];
    setCompanyRewards(cr);
    const a = (await get(`/assets?company_id=${r.company_id}`)) || [];
    setAssets(a);
    const ar = (await get('/reward_options')) || [];
    setAssetRewards(ar.filter(x => x.asset_id));
    const allUsers = (await get('/users')) || [];
    setUsers(allUsers);
  }
  useEffect(() => { load(); }, [reportId]);

  const getUserName = (userId) => {
    const foundUser = users.find(u => u.id === userId);
    return foundUser ? foundUser.name : 'Unknown User';
  };

  async function allocateReward() {
    if (!report) return;
    await patch(`/reports/${report.id}`, { status: 'Paid', timeline: [...(report.timeline || []), { user_id: user.id, action: 'paid', comment: 'Reward paid (demo)', timestamp: new Date().toISOString() }] });
    load();
  }

  async function markFalsePositive() {
    if (!report) return;
    await patch(`/reports/${report.id}`, { status: 'False Positive', timeline: [...(report.timeline || []), { user_id: user.id, action: 'triage', comment: triageComment || 'Marked as False Positive', timestamp: new Date().toISOString() }] });
    setTriageComment('');
    load();
  }

  async function markValid() {
    if (!report) return;
    await patch(`/reports/${report.id}`, { status: 'Triaged', timeline: [...(report.timeline || []), { user_id: user.id, action: 'triage', comment: triageComment || 'Validated as true issue', timestamp: new Date().toISOString() }] });
    setTriageComment('');
    load();
  }

  async function addComment(e) {
    e.preventDefault();
    if (!newComment.trim()) return;
    const commentPayload = {
      user_id: user.id,
      action: 'comment',
      comment: newComment,
      timestamp: new Date().toISOString(),
    };
    await patch(`/reports/${report.id}`, { timeline: [...(report.timeline || []), commentPayload] });
    setNewComment('');
    load();
  }

  if (!report) return <div>Loading...</div>;

  return (
    <div className="p-4 bg-white shadow rounded">
      <div className="mb-4">
        <button className="text-sm text-slate-600 hover:underline" onClick={onBack}>← Back</button>
        <h2 className="text-2xl font-bold mt-2">{report.title}</h2>
        <div className="text-sm text-slate-500">
          Severity: {report.severity}
          {report.cvss_score && <span> - CVSS: {report.cvss_score}</span>}
          - Status: {report.status}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2">
          <div className="bg-slate-50 p-4 rounded">
            <h4 className="font-semibold">Description</h4>
            <p className="mt-2 whitespace-pre-wrap text-sm">{report.description}</p>
            <h4 className="font-semibold mt-4">Steps to reproduce</h4>
            <pre className="mt-2 bg-slate-100 p-3 rounded text-sm whitespace-pre-wrap">{report.steps_to_reproduce}</pre>
            {report.poc_attachment_urls && report.poc_attachment_urls.length > 0 && (
                <div className="mt-4">
                    <h4 className="font-semibold">Proof of Concept</h4>
                    <ul className="list-disc list-inside mt-2 text-sm">
                        {report.poc_attachment_urls.map((url, index) => (
                            <li key={index}><a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{url.split('/').pop()}</a></li>
                        ))}
                    </ul>
                </div>
            )}
          </div>

          {/* قسم التعليقات الجديد */}
          <div className="mt-6 bg-slate-50 p-4 rounded">
            <h4 className="font-semibold mb-2">Comments</h4>
            <ul className="space-y-2">
              {(report.timeline || []).filter(t => t.action === 'comment' || t.action === 'created').map((t, i) => (
                <li key={i} className="text-sm border rounded p-2 bg-white">
                  <div className="font-bold">{getUserName(t.user_id)} <span className="text-xs font-normal text-slate-400">({new Date(t.timestamp).toLocaleString()})</span></div>
                  <div className="mt-1">{t.comment}</div>
                </li>
              ))}
            </ul>
            <form onSubmit={addComment} className="mt-4">
              <textarea
                className="w-full p-2 border rounded"
                rows={3}
                placeholder="Add a new comment..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
              />
              <button type="submit" className="bg-primary text-white px-3 py-1 rounded mt-2 hover:bg-accent transition-colors">
                Add Comment
              </button>
            </form>
          </div>
        </div>

        <div>
          <div className="bg-slate-50 p-4 rounded">
            <h4 className="font-semibold">Timeline</h4>
            <ul className="mt-2 space-y-2">
              {(report.timeline || []).map((t, i) => (
                <li key={i} className="text-sm border rounded p-2 bg-white">
                  <div className="text-xs text-slate-400">{new Date(t.timestamp).toLocaleString()}</div>
                  <div className="font-medium">
                    {t.action}
                    {t.action !== 'comment' && t.comment && ` — ${t.comment}`}
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-4">
              <h5 className="font-semibold">Available Rewards</h5>
              <div className="text-sm text-slate-500">Company-level:</div>
              <ul className="mt-2 space-y-2">
                {companyRewards.map(cr => <li key={cr.id} className="text-sm border rounded p-2 bg-white">{cr.type} {cr.currency || ''} {cr.points_value ? cr.points_value + ' pts' : ''}</li>)}
              </ul>
              <div className="text-sm text-slate-500 mt-3">Asset-level:</div>
              <ul className="mt-2 space-y-2">
                {assetRewards.map(ar => <li key={ar.id} className="text-sm border rounded p-2 bg-white">asset:{ar.asset_id} — {ar.type} {ar.currency || ''} {ar.points_value ? ar.points_value + ' pts' : ''}</li>)}
              </ul>
            </div>

            <div className="mt-4 space-y-2">
              {user.role === 'company' && <button className="bg-primary text-white px-3 py-1 rounded hover:bg-accent transition-colors" onClick={allocateReward}>Mark Reward Paid (Demo)</button>}
              {(user.role === 'company' || user.role === 'provider') && (
                <div className="mt-3">
                  <label className="text-sm">Triage comment</label>
                  <textarea className="w-full p-2 border rounded mt-1" rows={3} value={triageComment} onChange={e => setTriageComment(e.target.value)} placeholder="Optional note about triage decision" />
                  <div className="flex space-x-2 mt-2">
                    <button className="bg-amber-100 px-3 py-1 rounded hover:opacity-80" onClick={markValid}>Mark Valid</button>
                    <button className="bg-red-100 px-3 py-1 rounded hover:opacity-80" onClick={markFalsePositive}>Mark False Positive</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { get, post, patch, remove } from '../api'; // قم بتحديث الاستيراد هنا

function AssetRow({ a, onDelete, onEdit }) {
    return (
        <div className="p-4 border rounded-lg bg-white shadow-sm flex justify-between items-center transition-transform transform hover:scale-[1.01]">
            <div className="flex items-center space-x-4">
                <span className={`asset-icon ${a.type}`}></span>
                <div>
                    <div className="font-semibold text-lg flex items-center gap-2">
                        {a.name} <span className="text-sm text-gray-500">({a.type})</span>
                        {a.in_scope ? (
                            <span className="badge-in-scope">In Scope</span>
                        ) : (
                            <span className="badge-out-scope">Out of Scope</span>
                        )}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                        Bounty: {a.bounty_type}{' '}
                        {a.currency ? `- ${a.currency}` : ''}{' '}
                        {a.amount_min ? `(${a.amount_min}-${a.amount_max})` : ''}
                        {a.points_value ? `(${a.points_value} points)` : ''}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                        {a.notes}
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <button
                    className="btn btn-primary"
                    onClick={() => onEdit(a)}
                >
                    Edit
                </button>
                <button
                    className="btn btn-delete"
                    onClick={() => onDelete(a.id)}
                >
                    Delete
                </button>
            </div>
        </div>
    );
}

const CompanyAssets = () => {
    const [assets, setAssets] = useState([]);
    const [assetForm, setAssetForm] = useState({
        name: '',
        type: 'web',
        in_scope: true,
        bounty_type: 'cash',
        currency: 'USD',
        amount_min: 100,
        amount_max: 500,
        points_value: 100,
        notes: '',
        endpoints: [],
        allowed_methods: [],
        testing_window: '24/7',
    });
    const [editingAsset, setEditingAsset] = useState(null);

    async function loadAssets() {
        setAssets((await get('/assets?company_id=1')) || []);
    }

    useEffect(() => {
        loadAssets();
    }, []);

    // تم تعديل هذه الدالة للتعامل مع الإضافة والتعديل
    async function handleFormSubmit(e) {
        e.preventDefault();
        
        const payload = {
            company_id: 1,
            ...assetForm,
            created_at: new Date().toISOString(),
        };

        if (editingAsset) {
            // منطق التعديل: نستخدم PATCH ونرسل ID الأصل
            await patch(`/assets/${editingAsset.id}`, payload);
        } else {
            // منطق الإضافة: نستخدم POST
            await post('/assets', payload);
        }

        // إعادة ضبط النموذج بعد الإضافة أو التعديل
        setAssetForm({
            name: '',
            type: 'web',
            in_scope: true,
            bounty_type: 'cash',
            currency: 'USD',
            amount_min: 100,
            amount_max: 500,
            points_value: 100,
            notes: '',
            endpoints: [],
            allowed_methods: [],
            testing_window: '24/7',
        });
        setEditingAsset(null); // إعادة ضبط حالة التعديل
        loadAssets(); // إعادة تحميل الأصول
    }

    // تم تعديل هذه الدالة لاستخدام الدالة الجديدة
    async function deleteAsset(id) {
        await remove(`/assets/${id}`); // استخدم الدالة remove
        loadAssets();
    }

    function onEditAsset(asset) {
        setEditingAsset(asset);
        setAssetForm(asset);
    }

    return (
        <div className="company-assets-page">
            <h2 className="text-2xl font-bold mb-4">Assets (Scope)</h2>
            <div className="space-y-4">
                {assets.map((a) => (
                    <AssetRow
                        key={a.id}
                        a={a}
                        onDelete={deleteAsset}
                        onEdit={onEditAsset}
                    />
                ))}
                {assets.length === 0 && (
                    <div className="text-center text-slate-500">
                        No assets defined yet.
                    </div>
                )}
            </div>

            {/* Add/Edit Asset Form */}
            <form onSubmit={handleFormSubmit} className="mt-8 space-y-2">
                <h5 className="font-semibold">{editingAsset ? 'Edit Asset' : 'Add New Asset'}</h5>
                <input
                    className="w-full p-2 border rounded"
                    placeholder="Asset (domain or identifier)"
                    value={assetForm.name}
                    onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })}
                    required
                />
                <select
                    className="w-full p-2 border rounded"
                    value={assetForm.type}
                    onChange={(e) => setAssetForm({ ...assetForm, type: e.target.value })}
                >
                    <option value="web">Web</option>
                    <option value="api">API</option>
                    <option value="mobile">Mobile</option>
                    <option value="executable">Downloadable</option>
                </select>
                <div className="flex items-center space-x-2">
                    <label className="text-sm">In scope</label>
                    <input
                        type="checkbox"
                        checked={assetForm.in_scope}
                        onChange={(e) => setAssetForm({ ...assetForm, in_scope: e.target.checked })}
                    />
                </div>
                <select
                    className="w-full p-2 border rounded"
                    value={assetForm.bounty_type}
                    onChange={(e) => setAssetForm({ ...assetForm, bounty_type: e.target.value })}
                >
                    <option value="cash">Cash</option>
                    <option value="points">Points</option>
                    <option value="none">No bounty</option>
                </select>

                {assetForm.bounty_type === 'cash' && (
                    <div className="flex space-x-2">
                        <input
                            className="w-1/2 p-2 border rounded"
                            placeholder="Currency"
                            value={assetForm.currency}
                            onChange={(e) => setAssetForm({ ...assetForm, currency: e.target.value })}
                            required
                        />
                        <input
                            className="w-1/2 p-2 border rounded"
                            type="number"
                            placeholder="Min"
                            value={assetForm.amount_min || ''}
                            onChange={(e) => setAssetForm({ ...assetForm, amount_min: parseFloat(e.target.value) || 0 })}
                            required
                        />
                        <input
                            className="w-1/2 p-2 border rounded"
                            type="number"
                            placeholder="Max"
                            value={assetForm.amount_max || ''}
                            onChange={(e) => setAssetForm({ ...assetForm, amount_max: parseFloat(e.target.value) || 0 })}
                            required
                        />
                    </div>
                )}

                {assetForm.bounty_type === 'points' && (
                    <input
                        className="w-full p-2 border rounded"
                        type="number"
                        placeholder="Points value"
                        value={assetForm.points_value || ''}
                        onChange={(e) => setAssetForm({ ...assetForm, points_value: parseInt(e.target.value) || 0 })}
                        required
                    />
                )}

                <input
                    className="w-full p-2 border rounded"
                    placeholder="Notes"
                    value={assetForm.notes}
                    onChange={(e) => setAssetForm({ ...assetForm, notes: e.target.value })}
                />
                <input
                    className="w-full p-2 border rounded"
                    placeholder="Endpoints (comma separated)"
                    value={assetForm.endpoints?.join(',') || ''}
                    onChange={(e) => setAssetForm({ ...assetForm, endpoints: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
                />
                <input
                    className="w-full p-2 border rounded"
                    placeholder="Allowed methods (comma)"
                    value={assetForm.allowed_methods?.join(',') || ''}
                    onChange={(e) => setAssetForm({ ...assetForm, allowed_methods: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
                />
                <input
                    className="w-full p-2 border rounded"
                    placeholder="Testing window (e.g. 09:00-17:00 or 24/7)"
                    value={assetForm.testing_window}
                    onChange={(e) => setAssetForm({ ...assetForm, testing_window: e.target.value })}
                />
                <button type="submit" className="mt-2 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200">
                    {editingAsset ? 'Update Asset' : 'Add Asset'}
                </button>
            </form>
        </div>
    );
};

export default CompanyAssets;

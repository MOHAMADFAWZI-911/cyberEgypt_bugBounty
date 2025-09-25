import React, { useState, useEffect } from 'react';
import { get, patch } from '../api';

const UserProfile = ({ user, loggedInUser, onBack }) => {
    const [profileData, setProfileData] = useState({
        ...user,
        linkedin_url: user.linkedin_url || '',
        github_url: user.github_url || '',
        payment_info: user.payment_info || { type: 'paypal', email: '' },
        bio: user.bio || '',
        specializations: user.specializations || [],
        reputation_score: user.reputation_score || 0
    });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);

    const isMyProfile = loggedInUser?.id === user.id;

    const fetchProfileData = async () => {
        try {
            const data = await get(`/users/${user.id}`);
            setProfileData({
                ...data,
                linkedin_url: data.linkedin_url || '',
                github_url: data.github_url || '',
                payment_info: data.payment_info || { type: 'paypal', email: '' },
                bio: data.bio || '',
                specializations: data.specializations || [],
                reputation_score: data.reputation_score || 0
            });
        } catch (error) {
            console.error('Failed to fetch profile data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfileData();
    }, [user.id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSpecializationsChange = (e) => {
        const value = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
        setProfileData(prev => ({
            ...prev,
            specializations: value
        }));
    };

    const handlePaymentChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            payment_info: { ...prev.payment_info, [name]: value }
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await patch(`/users/${user.id}`, profileData);
            await fetchProfileData();
            setIsEditing(false);
            window.alert('Profile updated successfully!');
        } catch (error) {
            window.alert('Failed to update profile.');
            console.error(error);
        }
    };

    if (loading) {
        return <div className="p-4">Loading profile...</div>;
    }

    const renderProfileView = () => (
        <div className="space-y-4">
            <div className="form-group">
                <label className="block text-gray-700 font-semibold">Name</label>
                <div className="text-lg text-slate-800">{profileData.name}</div>
            </div>
            <div className="form-group">
                <label className="block text-gray-700 font-semibold">Bio</label>
                <div className="text-lg text-slate-800">{profileData.bio || 'N/A'}</div>
            </div>
            {profileData.role === 'provider' && (
                <div className="form-group">
                    <label className="block text-gray-700 font-semibold">Reputation Score</label>
                    <div className="text-lg font-bold text-green-600">{profileData.reputation_score}/100</div>
                </div>
            )}
            <div className="form-group">
                <label className="block text-gray-700 font-semibold">Specializations</label>
                <div className="text-lg text-slate-800">{profileData.specializations.length > 0 ? profileData.specializations.join(', ') : 'N/A'}</div>
            </div>
            <div className="form-group">
                <label className="block text-gray-700 font-semibold">LinkedIn Profile URL</label>
                <div className="text-lg text-blue-600 hover:underline">
                    <a href={profileData.linkedin_url} target="_blank" rel="noopener noreferrer">{profileData.linkedin_url || 'N/A'}</a>
                </div>
            </div>
            <div className="form-group">
                <label className="block text-gray-700 font-semibold">GitHub Profile URL</label>
                <div className="text-lg text-blue-600 hover:underline">
                    <a href={profileData.github_url} target="_blank" rel="noopener noreferrer">{profileData.github_url || 'N/A'}</a>
                </div>
            </div>
            {isMyProfile && (
                <div className="form-group">
                    <label className="block text-gray-700 font-semibold">Payment Information</label>
                    <div className="text-lg text-slate-800">
                        Type: {profileData.payment_info.type}
                        <br />
                        Email/Account: {profileData.payment_info.email || 'N/A'}
                    </div>
                </div>
            )}
        </div>
    );

    const renderEditForm = () => (
        <form onSubmit={handleSave} className="space-y-4">
            <div className="form-group">
                <label className="block text-gray-700">Name</label>
                <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                />
            </div>
            <div className="form-group">
                <label className="block text-gray-700">Bio</label>
                <textarea
                    name="bio"
                    value={profileData.bio}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    rows="3"
                ></textarea>
            </div>
            <div className="form-group">
                <label className="block text-gray-700">Specializations (comma separated)</label>
                <input
                    type="text"
                    name="specializations"
                    value={profileData.specializations.join(', ')}
                    onChange={handleSpecializationsChange}
                    className="w-full p-2 border rounded"
                />
            </div>
            <div className="form-group">
                <label className="block text-gray-700">LinkedIn Profile URL</label>
                <input
                    type="url"
                    name="linkedin_url"
                    value={profileData.linkedin_url}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                />
            </div>
            <div className="form-group">
                <label className="block text-gray-700">GitHub Profile URL</label>
                <input
                    type="url"
                    name="github_url"
                    value={profileData.github_url}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                />
            </div>
            <div className="form-group">
                <label className="block text-gray-700">Payment Information</label>
                <select
                    name="type"
                    value={profileData.payment_info.type}
                    onChange={handlePaymentChange}
                    className="w-full p-2 border rounded mb-2"
                >
                    <option value="paypal">PayPal</option>
                    <option value="bank">Bank Transfer</option>
                </select>
                <input
                    type="text"
                    name="email"
                    placeholder="PayPal Email or Bank Account Info"
                    value={profileData.payment_info.email}
                    onChange={handlePaymentChange}
                    className="w-full p-2 border rounded"
                />
            </div>
            <div className="flex space-x-2">
                <button
                    type="submit"
                    className="btn btn-primary"
                >
                    Save Changes
                </button>
            </div>
        </form>
    );

    return (
        <div className="user-profile-page p-4 bg-white shadow rounded">
            <h2 className="text-2xl font-bold mb-4">{isMyProfile ? 'My Profile' : 'User Profile'}</h2>
            {!isMyProfile && onBack && (
                <button type="button" onClick={onBack} className="btn btn-secondary mb-4">
                    Back
                </button>
            )}
            {!isEditing ? renderProfileView() : renderEditForm()}
            {!isEditing && isMyProfile && (
                <div className="flex space-x-2 mt-4">
                    <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="btn btn-primary"
                    >
                        Edit Profile
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserProfile;

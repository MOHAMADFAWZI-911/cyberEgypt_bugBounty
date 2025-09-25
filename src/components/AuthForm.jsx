import React, { useEffect, useState } from 'react';
import { get, post } from '../api';

async function hashPassword(password) {
  // Use SubtleCrypto if available to compute SHA-256 and return hex string
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const enc = new TextEncoder();
    const data = enc.encode(password);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }
  // Fallback simple JS SHA-256 (not implemented here) - but most modern browsers support SubtleCrypto
  // As fallback, send plain password (NOT recommended) - but we try to avoid it.
  return password;
}

export default function AuthForm({ onLogin }) {
  const [mode, setMode] = useState('login'); // or register
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'researcher' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(()=>{ get('/users').then(setUsers).catch(()=>{}); }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const all = await get('/users');
      const hashed = await hashPassword(form.password);
      const found = all.find(u => u.email === form.email && (u.password === hashed || u.password === form.password));
      if (!found) {
        setError('Login failed — check email/password');
        setLoading(false);
        return;
      }
      onLogin(found);
    } catch (err) {
      setError('Login error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password || !form.name) return setError('All fields required');
    setLoading(true);
    try {
      const all = await get('/users');
      const exists = all.find(u => u.email === form.email);
      if (exists) {
        setError('Email already registered');
        setLoading(false);
        return;
      }
      const hashed = await hashPassword(form.password);
      const payload = { name: form.name, email: form.email, password: hashed, role: form.role };
      const created = await post('/users', payload);
      onLogin(created);
    } catch (err) {
      setError('Registration error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full bg-white shadow rounded p-6">
        <h2 className="text-xl font-bold mb-4">{mode === 'login' ? 'Login' : 'Register'}</h2>

        {error && <div className="mb-3 text-red-600">{error}</div>}

        {mode === 'login' ? (
          <form onSubmit={handleLogin}>
            <input className="w-full p-2 border rounded mb-2" placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
            <input className="w-full p-2 border rounded mb-2" placeholder="Password" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} />
            <div className="flex justify-between items-center mt-3">
              <button className="bg-primary text-white px-3 py-1 rounded">{loading ? 'Please wait...' : 'Login'}</button>
              <button type="button" className="text-sm text-slate-600" onClick={()=>{setMode('register'); setError('')}}>Create account</button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <input className="w-full p-2 border rounded mb-2" placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
            <input className="w-full p-2 border rounded mb-2" placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
            <input className="w-full p-2 border rounded mb-2" placeholder="Password" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} />
            <select className="w-full p-2 border rounded mb-2" value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
              <option value="researcher">Researcher</option>
              <option value="company">Company</option>
              <option value="provider">Service Provider</option>
            </select>
            <div className="flex justify-between items-center mt-3">
              <button className="bg-primary text-white px-3 py-1 rounded">{loading ? 'Please wait...' : 'Register'}</button>
              <button type="button" className="text-sm text-slate-600" onClick={()=>{setMode('login'); setError('')}}>Back to login</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

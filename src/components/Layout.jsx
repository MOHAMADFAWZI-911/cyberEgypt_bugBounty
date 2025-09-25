import React from 'react';

export default function Layout({ user, children, onLogout, onNavigate }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="text-2xl font-bold text-primary">CyberEgypt</div>
          </div>

          <div className="flex items-center space-x-3">
            <button className="text-sm px-3 py-1 rounded hover:bg-slate-100" onClick={()=>onNavigate({name:'dashboard'})}>Dashboard</button>
            <div className="text-sm text-slate-600">{user.name} — <span className="font-medium">{user.role}</span></div>
            <button className="ml-2 bg-primary text-white px-3 py-1 rounded hover:opacity-90" onClick={onLogout}>Logout</button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-4">
        {children}
      </main>
    </div>
  );
}

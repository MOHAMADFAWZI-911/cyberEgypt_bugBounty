import React, { useEffect, useState } from 'react';
import AuthForm from './components/AuthForm';
import Layout from './components/Layout';
import ResearcherDashboard from './components/ResearcherDashboard';
import CompaniesList from './components/CompaniesList';
import CompanyDashboard from './components/CompanyDashboard';
import ProviderDashboard from './components/ProviderDashboard';
import ReportDetail from './components/ReportDetail';
import Welcome from './components/Welcome';
import UserProfile from './components/UserProfile';

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState({ name: 'welcome', payload: null });

  useEffect(() => {
    const stored = sessionStorage.getItem('bb_user');
    if (stored) {
      setUser(JSON.parse(stored));
      setView({ name: 'dashboard', payload: null });
    }
  }, []);

  function onLogin(u) {
    sessionStorage.setItem('bb_user', JSON.stringify(u));
    setUser(u);
    setView({ name: 'dashboard', payload: null });
  }
  function onLogout() {
    sessionStorage.removeItem('bb_user');
    setUser(null);
    setView({ name: 'welcome', payload: null });
  }

  if (!user) {
    return view.name === 'welcome' ? <Welcome onLoginClick={() => setView({ name: 'auth' })} /> : <AuthForm onLogin={onLogin} />;
  }

  return (
    <Layout user={user} onLogout={onLogout} onNavigate={(v) => setView(v)}>
      {view.name === 'dashboard' && user.role === 'researcher' && <ResearcherDashboard user={user} onOpenReport={(r) => setView({ name: 'report', payload: r })} />}
      {view.name === 'dashboard' && user.role === 'company' && <CompanyDashboard user={user} onOpenReport={(r) => setView({ name: 'report', payload: r })} onNavigate={setView} />}
      {view.name === 'dashboard' && user.role === 'provider' && <ProviderDashboard user={user} onOpenReport={(r) => setView({ name: 'report', payload: r })} />}
      {view.name === 'company' && <CompanyDashboard user={user} onOpenReport={(r) => setView({ name: 'report', payload: r })} />}
      {view.name === 'report' && <ReportDetail reportId={view.payload?.id} user={user} onBack={() => setView({ name: 'dashboard', payload: null })} />}
      {view.name === 'providerProfile' && <UserProfile user={view.payload} loggedInUser={user} onBack={() => setView({ name: 'providers' })} />}
    </Layout>
  );
}

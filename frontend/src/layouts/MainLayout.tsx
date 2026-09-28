import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { GlobalSearchModal } from '../components/GlobalSearchModal';
import { wsClient } from '../services/websocket';
import { useAuth } from '../contexts/AuthContext';
import { useI18n, LangCode } from '../contexts/I18nContext';

export const MainLayout: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { lang, setLang } = useI18n();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    wsClient.connect();
  }, []);

  const handleLogout = () => {
    wsClient.disconnect();
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden select-none">
      {/* Sidebar */}
      <Sidebar user={user} onLogout={handleLogout} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header
          onOpenSearch={() => setIsSearchOpen(true)}
          selectedLang={lang}
          onSelectLang={(l) => setLang(l as LangCode)}
          user={user}
          onLogout={handleLogout}
        />

        <main className="flex-1 overflow-y-auto bg-slate-950 p-6">
          <Outlet context={{ selectedLang: lang }} />
        </main>
      </div>

      {/* Modals */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </div>
  );
};

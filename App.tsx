
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Events from './pages/Events';
import Services from './pages/Services';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import BookingPage from './pages/BookingPage';
import Profile from './pages/Profile';
import SocialHub from './pages/SocialHub';
import More from './pages/More';
import ProviderDashboard from './pages/ProviderDashboard';
import AIChat from './components/AIChat';
import IOSInstallPrompt from './components/IOSInstallPrompt';
import Editable from './components/Editable';
import SectionBuilder from './components/SectionBuilder';
import { User, UserRole, HomeSection } from './types';
import { db } from './services/database';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { ShieldAlert, Edit3, Eye, Layout } from 'lucide-react';

const DynamicPage: React.FC = () => {
    const { pageId } = useParams();
    const { language } = useSettings();
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="bg-white/10 backdrop-blur-md rounded-[2.5rem] p-12 text-center border border-white/20 shadow-xl">
                <div className="w-20 h-20 bg-dahab-teal text-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg rotate-3">
                    <Layout size={40} />
                </div>
                <h1 className="text-4xl font-bold mb-4">
                    <Editable id={`dynamic-title-${pageId}-${language}`} defaultContent="New Custom Page" />
                </h1>
                <div className="max-w-2xl mx-auto text-xl opacity-90 leading-relaxed">
                    <Editable id={`dynamic-desc-${pageId}-${language}`} defaultContent="This page was created by an administrator. Enter edit mode to build your custom content here." />
                </div>
            </div>
        </div>
    );
};

// Wrapper component to handle the builder on all pages
const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isEditing, settings, updatePageLayout } = useSettings();
    const location = useLocation();
    const path = location.pathname;

    const pageSections = settings.pageLayouts?.[path] || [];

    return (
        <>
            {children}
            <SectionBuilder 
                path={path} 
                sections={pageSections} 
                onUpdate={(newSections) => updatePageLayout(path, newSections)} 
            />
        </>
    );
};

const AppContent: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const { settings, isEditing, toggleEditing } = useSettings();
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  const isDarkBackground = settings.backgroundStyle.includes('#0f172a') || settings.backgroundStyle.includes('#000000');
  const textColorClass = isDarkBackground ? 'text-gray-100' : 'text-gray-800';

  useEffect(() => {
    const savedUser = localStorage.getItem('dahab_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  useEffect(() => {
    const userId = user?.id;
    const isPendingProvider = user?.role === UserRole.PROVIDER && (user?.providerStatus === 'pending' || user?.providerStatus === 'payment_review');

    if (userId && isPendingProvider) {
      const interval = setInterval(async () => {
        try {
          const updatedUser = await db.getUser(userId);
          if (updatedUser && updatedUser.providerStatus !== user?.providerStatus) {
            setUser(updatedUser);
            localStorage.setItem('dahab_user', JSON.stringify(updatedUser));
          }
        } catch (error) {
          console.error("Polling error", error);
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [user?.id, user?.role, user?.providerStatus]);

  const handleLogin = (user: User) => {
    setUser(user);
    localStorage.setItem('dahab_user', JSON.stringify(user));
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('dahab_user', JSON.stringify(updatedUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('dahab_user');
  };

  const handleToggleSave = async (eventId: string) => {
    if (!user) {
      alert("Please login to save events.");
      return;
    }
    const isSaved = user.savedEventIds?.includes(eventId);
    const newSavedIds = isSaved 
      ? user.savedEventIds.filter(id => id !== eventId)
      : [...(user.savedEventIds || []), eventId];
    const updatedUser = { ...user, savedEventIds: newSavedIds };
    setUser(updatedUser);
    localStorage.setItem('dahab_user', JSON.stringify(updatedUser));
    await db.toggleSavedEvent(user.id, eventId);
  };

  return (
    <HashRouter>
      <div 
        className={`min-h-screen pb-20 ${textColorClass} transition-all duration-500 ease-in-out`}
        style={{
          backgroundImage: settings.backgroundStyle,
          backgroundAttachment: 'fixed',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          paddingTop: 'calc(6rem + env(safe-area-inset-top))'
        }}
      >
        <Navbar 
          userRole={user?.role || null} 
          onLogout={handleLogout} 
          installPrompt={installPrompt}
          onInstall={handleInstallClick}
        />

        {user?.role === UserRole.PROVIDER && user?.providerStatus === 'pending' && (
          <div className="bg-yellow-500 text-white px-4 py-2 text-center text-sm font-bold shadow-md flex items-center justify-center gap-2">
            <ShieldAlert size={16} />
            <span>Your provider account is pending admin verification.</span>
          </div>
        )}
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Routes>
            <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
            <Route path="/events" element={<PageWrapper><Events user={user} onToggleSave={handleToggleSave} /></PageWrapper>} />
            <Route path="/services" element={<PageWrapper><Services user={user} /></PageWrapper>} />
            <Route path="/community" element={<PageWrapper><SocialHub user={user} /></PageWrapper>} />
            <Route path="/more" element={<PageWrapper><More /></PageWrapper>} />
            <Route path="/p/:pageId" element={<PageWrapper><DynamicPage /></PageWrapper>} />

            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/book/:type/:id" element={user ? <BookingPage user={user} /> : <Navigate to="/login" />} />
            <Route 
              path="/profile" 
              element={
                <Profile 
                  user={user || {id:'', name:'Guest', role:UserRole.USER, savedEventIds:[]} as User} 
                  onToggleSave={handleToggleSave} 
                  onLogout={handleLogout} 
                  onUpdateUser={handleUpdateUser}
                />
              } 
            />
            <Route path="/provider-dashboard" element={user?.role === UserRole.PROVIDER ? <ProviderDashboard onLogout={handleLogout} /> : <Navigate to="/login" />} />
            <Route path="/admin" element={user?.role === UserRole.ADMIN ? <AdminDashboard onLogout={handleLogout} /> : <Navigate to="/login" />} />
          </Routes>
        </main>

        <AIChat />
        <IOSInstallPrompt />

        {user?.role === UserRole.ADMIN && (
          <button 
            onClick={toggleEditing}
            className={`fixed bottom-24 left-4 md:left-10 p-4 rounded-full shadow-xl z-50 transition-all transform hover:scale-105 ${isEditing ? 'bg-orange-500 text-white' : 'bg-gray-900 text-white'}`}
            title={isEditing ? "Exit Edit Mode" : "Enter Edit Mode"}
          >
            {isEditing ? <Eye size={24} /> : <Edit3 size={24} />}
          </button>
        )}
      </div>
    </HashRouter>
  );
};

const App: React.FC = () => {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
};

export default App;

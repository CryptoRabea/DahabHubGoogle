import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import { User, UserRole } from './types';
import { db } from './services/mockDatabase';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { ShieldAlert } from 'lucide-react';

const AppContent: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const { settings } = useSettings();
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  // Check for session in localstorage on load
  useEffect(() => {
    const savedUser = localStorage.getItem('dahab_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Handle PWA Install Prompt
  useEffect(() => {
    const handler = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    // Show the install prompt
    installPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setInstallPrompt(null);
    }
  };

  // Poll for user status updates (for verification)
  useEffect(() => {
    if (user && user.role === UserRole.PROVIDER && user.providerStatus === 'pending') {
      const interval = setInterval(async () => {
        const updatedUser = await db.getUser(user.id);
        if (updatedUser && updatedUser.providerStatus !== user.providerStatus) {
          // Status changed! Update local state
          setUser(updatedUser);
          localStorage.setItem('dahab_user', JSON.stringify(updatedUser));
        }
      }, 5000); // Check every 5 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogin = (user: User) => {
    setUser(user);
    localStorage.setItem('dahab_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('dahab_user');
  };

  const handleToggleSave = async (eventId: string) => {
    if (!user) {
      // You might want to trigger a redirect to login here or show a toast
      alert("Please login to save events.");
      return;
    }
    
    // Optimistic update
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
        className="min-h-screen pb-20 md:pb-0 md:pt-20 pt-safe text-gray-800 transition-all duration-500 ease-in-out"
        style={{
          backgroundImage: settings.backgroundStyle,
          backgroundAttachment: 'fixed',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <Navbar 
          userRole={user?.role || null} 
          onLogout={handleLogout} 
          installPrompt={installPrompt}
          onInstall={handleInstallClick}
        />

        {/* Pending Verification Banner */}
        {user?.role === UserRole.PROVIDER && user?.providerStatus === 'pending' && (
          <div className="bg-yellow-500 text-white px-4 py-2 text-center text-sm font-bold shadow-md flex items-center justify-center gap-2">
            <ShieldAlert size={16} />
            <span>Your provider account is pending admin verification. You can browse as a user until approved.</span>
          </div>
        )}
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<Events user={user} onToggleSave={handleToggleSave} />} />
            <Route path="/services" element={<Services user={user} />} />
            <Route path="/community" element={<SocialHub user={user} />} />
            <Route path="/more" element={<More />} />
            
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/book/:type/:id" element={user ? <BookingPage user={user} /> : <Navigate to="/login" />} />
            
            <Route path="/profile" element={user ? <Profile user={user} onToggleSave={handleToggleSave} /> : <Navigate to="/login" />} />
            
            {/* Provider Dashboard Route */}
            <Route 
              path="/provider-dashboard" 
              element={
                user?.role === UserRole.PROVIDER 
                  ? <ProviderDashboard /> 
                  : <Navigate to="/login" />
              } 
            />

            {/* Admin Route Protection */}
            <Route 
              path="/admin" 
              element={
                user?.role === UserRole.ADMIN 
                  ? <AdminDashboard /> 
                  : <Navigate to="/login" />
              } 
            />
          </Routes>
        </main>

        <AIChat />
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
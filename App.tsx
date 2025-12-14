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
import AIChat from './components/AIChat';
import { User, UserRole } from './types';
import { db } from './services/mockDatabase';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  // Check for session in localstorage on load
  useEffect(() => {
    const savedUser = localStorage.getItem('dahab_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

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
      <div className="min-h-screen bg-slate-50 pb-20 md:pb-0 md:pt-20 text-gray-800">
        <Navbar userRole={user?.role || null} onLogout={handleLogout} />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<Events user={user} onToggleSave={handleToggleSave} />} />
            <Route path="/services" element={<Services user={user} />} />
            <Route path="/community" element={<SocialHub user={user} />} />
            
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/book/:type/:id" element={user ? <BookingPage user={user} /> : <Navigate to="/login" />} />
            
            <Route path="/profile" element={user ? <Profile user={user} onToggleSave={handleToggleSave} /> : <Navigate to="/login" />} />
            
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

export default App;
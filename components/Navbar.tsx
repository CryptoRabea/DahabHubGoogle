import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Car, User, LayoutDashboard, LogOut, Users } from 'lucide-react';
import { UserRole } from '../types';
import { useSettings } from '../contexts/SettingsContext';

interface NavbarProps {
  userRole: UserRole | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ userRole, onLogout }) => {
  const location = useLocation();
  const { settings } = useSettings();

  const isActive = (path: string) => location.pathname === path ? "text-dahab-teal font-bold" : "text-gray-500 hover:text-dahab-teal";

  // Bottom Nav for Mobile
  const MobileNav = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 py-3 px-6 flex justify-between items-center z-50 md:hidden pb-safe">
      <Link to="/" className={`flex flex-col items-center gap-1 ${isActive('/')}`}>
        <Home size={24} />
        <span className="text-xs">Home</span>
      </Link>
      <Link to="/events" className={`flex flex-col items-center gap-1 ${isActive('/events')}`}>
        <Calendar size={24} />
        <span className="text-xs">Events</span>
      </Link>
      <Link to="/community" className={`flex flex-col items-center gap-1 ${isActive('/community')}`}>
        <Users size={24} />
        <span className="text-xs">Community</span>
      </Link>
      {userRole === UserRole.ADMIN ? (
        <Link to="/admin" className={`flex flex-col items-center gap-1 ${isActive('/admin')}`}>
          <LayoutDashboard size={24} />
          <span className="text-xs">Admin</span>
        </Link>
      ) : (
        <Link to={userRole ? "/profile" : "/login"} className={`flex flex-col items-center gap-1 ${isActive(userRole ? '/profile' : '/login')}`}>
          <User size={24} />
          <span className="text-xs">{userRole ? 'Profile' : 'Login'}</span>
        </Link>
      )}
    </div>
  );

  // Top Nav for Desktop
  const DesktopNav = () => (
    <div className="hidden md:flex fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md shadow-sm z-50 px-8 py-4 justify-between items-center">
      <Link to="/" className="text-2xl font-bold text-dahab-teal tracking-tight flex items-center gap-3">
        {settings.logoUrl ? (
          <img src={settings.logoUrl} alt={settings.appName} className="h-10 w-auto object-contain" />
        ) : (
          <span className="bg-dahab-gold text-white p-1 rounded-lg">AD</span> 
        )}
        <span>{settings.appName}</span>
      </Link>
      
      <div className="flex gap-8 items-center">
        <Link to="/" className={`text-sm font-medium transition-colors ${isActive('/')}`}>Home</Link>
        <Link to="/events" className={`text-sm font-medium transition-colors ${isActive('/events')}`}>Events</Link>
        <Link to="/community" className={`text-sm font-medium transition-colors ${isActive('/community')}`}>Community Hub</Link>
        <Link to="/services" className={`text-sm font-medium transition-colors ${isActive('/services')}`}>Drivers & Services</Link>
        {userRole === UserRole.ADMIN && (
          <Link to="/admin" className={`text-sm font-medium transition-colors ${isActive('/admin')}`}>Admin Dashboard</Link>
        )}
      </div>

      <div className="flex gap-4">
        {userRole ? (
          <>
             <Link to="/profile" className={`flex items-center gap-2 font-medium ${isActive('/profile')}`}>
               <User size={18} /> Profile
             </Link>
            <button onClick={onLogout} className="flex items-center gap-2 text-red-500 hover:text-red-600 font-medium ml-4">
              <LogOut size={18} /> Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="bg-dahab-teal text-white px-5 py-2 rounded-full hover:bg-teal-700 transition shadow-md">
            Login
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <>
      <DesktopNav />
      <MobileNav />
    </>
  );
};

export default Navbar;
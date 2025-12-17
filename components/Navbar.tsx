
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Calendar, Car, User, LayoutDashboard, LogOut, Users, Menu, Briefcase, 
  Download, ShieldCheck, Settings, Plus, X, ArrowUp, ArrowDown, Trash2 
} from 'lucide-react';
import { UserRole, NavItem } from '../types';
import { useSettings } from '../contexts/SettingsContext';

interface NavbarProps {
  userRole: UserRole | null;
  onLogout: () => void;
  installPrompt: any;
  onInstall: () => void;
}

// Icon Mapping
const ICON_MAP: Record<string, any> = {
    'Home': Home,
    'Calendar': Calendar,
    'Car': Car,
    'Users': Users,
    'Menu': Menu,
    'User': User,
    'Briefcase': Briefcase,
    'ShieldCheck': ShieldCheck
};

const Navbar: React.FC<NavbarProps> = ({ userRole, onLogout, installPrompt, onInstall }) => {
  const location = useLocation();
  const { settings, isEditing, updateNavigation } = useSettings();
  const [logoError, setLogoError] = useState(false);
  const [isNavEditorOpen, setIsNavEditorOpen] = useState(false);

  // Filter visible items and sort
  const navItems = settings.navigation.filter(i => i.isVisible).sort((a, b) => a.order - b.order);

  const isActive = (path: string) => location.pathname === path ? "text-dahab-teal font-bold" : "text-gray-500 hover:text-dahab-teal";

  // Brand Logo Logic
  const BrandLogo = ({ className = "h-10" }: { className?: string }) => {
    if (settings.logoUrl && !logoError) {
      return (
        <img 
          src={settings.logoUrl} 
          alt={settings.appName} 
          className={`${className} w-auto object-contain`} 
          onError={() => setLogoError(true)}
        />
      );
    }
    return (
      <span className="font-bold text-xl text-dahab-teal tracking-tight">
        {settings.appName}
      </span>
    );
  };

  // --- Dynamic Nav Editor Logic ---
  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
      const newItems = [...settings.navigation];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      
      if (targetIndex >= 0 && targetIndex < newItems.length) {
          // Swap orders
          const tempOrder = newItems[index].order;
          newItems[index].order = newItems[targetIndex].order;
          newItems[targetIndex].order = tempOrder;
          
          // Re-sort array
          newItems.sort((a, b) => a.order - b.order);
          updateNavigation(newItems);
      }
  };

  const handleToggleVisibility = (id: string) => {
      const newItems = settings.navigation.map(item => 
          item.id === id ? { ...item, isVisible: !item.isVisible } : item
      );
      updateNavigation(newItems);
  };

  const handleAddItem = () => {
      const id = Math.random().toString(36).substr(2, 5);
      const newItems = [...settings.navigation, {
          id: `nav-${id}`,
          label: 'New Tab',
          path: '/',
          icon: 'Home',
          order: settings.navigation.length + 1,
          isVisible: true
      }];
      updateNavigation(newItems);
  };

  const handleDeleteItem = (id: string) => {
      if (window.confirm("Delete this tab?")) {
          const newItems = settings.navigation.filter(i => i.id !== id);
          updateNavigation(newItems);
      }
  };

  const handleUpdateItem = (id: string, field: keyof NavItem, value: any) => {
      const newItems = settings.navigation.map(item => 
          item.id === id ? { ...item, [field]: value } : item
      );
      updateNavigation(newItems);
  };
  // -------------------------------

  // Mobile Top Bar
  const MobileTopBar = () => (
    <div className="md:hidden fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md shadow-sm z-50 px-4 py-3 flex justify-between items-center pt-safe transition-all">
       <Link to="/" className="flex items-center gap-2">
          <BrandLogo className="h-8" />
       </Link>
       
       <div className="flex items-center gap-2">
         {/* Install Button */}
         {installPrompt && (
            <button onClick={onInstall} className="text-gray-900 bg-gray-100 p-2 rounded-full mr-1">
              <Download size={16} />
            </button>
         )}

         {/* Admin Edit Trigger */}
         {isEditing && (
             <button onClick={() => setIsNavEditorOpen(true)} className="p-2 bg-dahab-teal text-white rounded-full animate-pulse">
                 <Settings size={16} />
             </button>
         )}

         {/* Auth Actions */}
         {!userRole ? (
           <div className="flex gap-2">
             <Link to="/login" className="px-3 py-1.5 text-xs font-bold text-gray-600 border border-gray-200 rounded-full hover:bg-gray-50">Login</Link>
             <Link to="/login?mode=signup" className="px-3 py-1.5 text-xs font-bold bg-dahab-teal text-white rounded-full hover:bg-teal-700 shadow-sm">Sign Up</Link>
           </div>
         ) : (
           <div className="flex gap-2 items-center">
             <Link to="/profile" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-dahab-teal border border-gray-200">
               <User size={16} />
             </Link>
             <button onClick={onLogout} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition">
               <LogOut size={20} />
             </button>
           </div>
         )}
       </div>
    </div>
  );

  // Bottom Nav for Mobile - Dynamic
  const MobileBottomNav = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 py-3 px-6 flex justify-between items-center z-50 md:hidden pb-safe transition-all overflow-x-auto no-scrollbar">
      
      {navItems.map((item) => {
          const Icon = ICON_MAP[item.icon] || Home;
          return (
            <Link key={item.id} to={item.path} className={`flex flex-col items-center gap-1 min-w-[60px] ${isActive(item.path)}`}>
                <Icon size={24} />
                <span className="text-[10px] font-medium truncate w-full text-center">{item.label}</span>
            </Link>
          );
      })}

      {/* Dynamic Profile/Dashboard Tab (Always appended if user logged in) */}
      <Link 
        to={
          userRole === UserRole.ADMIN ? "/admin" : 
          userRole === UserRole.PROVIDER ? "/provider-dashboard" : 
          userRole ? "/profile" : "/login"
        } 
        className={`flex flex-col items-center gap-1 min-w-[60px] ${isActive(
          userRole === UserRole.ADMIN ? "/admin" : 
          userRole === UserRole.PROVIDER ? "/provider-dashboard" : 
          userRole ? "/profile" : "/login"
        )}`}
      >
        {userRole === UserRole.ADMIN ? <ShieldCheck size={24} /> :
         userRole === UserRole.PROVIDER ? <Briefcase size={24} /> :
         <User size={24} />
        }
        <span className="text-[10px] font-medium">
          {userRole === UserRole.ADMIN ? 'Admin' : 
           userRole === UserRole.PROVIDER ? 'Dash' : 
           userRole ? 'Profile' : 'Login'}
        </span>
      </Link>
    </div>
  );

  // Top Nav for Desktop - Dynamic
  const DesktopNav = () => (
    <div className="hidden md:flex fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md shadow-sm z-50 px-8 py-4 justify-between items-center pt-safe">
      <Link to="/" className="text-2xl font-bold text-dahab-teal tracking-tight flex items-center gap-3">
        <BrandLogo />
      </Link>
      
      <div className="flex gap-8 items-center">
        {navItems.map((item) => (
             <Link key={item.id} to={item.path} className={`text-sm font-medium transition-colors ${isActive(item.path)}`}>
                 {item.label}
             </Link>
        ))}
        
        {userRole === UserRole.PROVIDER && (
           <Link to="/provider-dashboard" className={`text-sm font-medium transition-colors ${isActive('/provider-dashboard')}`}>Provider Dashboard</Link>
        )}
        {userRole === UserRole.ADMIN && (
          <Link to="/admin" className={`text-sm font-medium transition-colors ${isActive('/admin')}`}>Admin Dashboard</Link>
        )}
        
        {isEditing && (
            <button onClick={() => setIsNavEditorOpen(true)} className="bg-dahab-teal text-white px-3 py-1 rounded text-xs font-bold hover:bg-teal-700">
                Edit Menu
            </button>
        )}
      </div>

      <div className="flex gap-4 items-center">
        {installPrompt && (
          <button 
            onClick={onInstall} 
            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-full hover:bg-gray-800 transition text-sm font-bold shadow-md"
          >
            <Download size={16} /> Install App
          </button>
        )}

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
          <div className="flex items-center gap-2">
            <Link to="/login" className="text-gray-600 hover:text-dahab-teal px-4 py-2 rounded-full font-bold transition">
              Login
            </Link>
            <Link to="/login?mode=signup" className="bg-dahab-teal text-white px-5 py-2 rounded-full hover:bg-teal-700 transition shadow-md font-bold">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <DesktopNav />
      <MobileTopBar />
      <MobileBottomNav />

      {/* Nav Editor Modal */}
      {isNavEditorOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                      <h3 className="font-bold text-lg text-gray-900">Customize Navigation</h3>
                      <button onClick={() => setIsNavEditorOpen(false)}><X size={20} className="text-gray-500" /></button>
                  </div>
                  <div className="p-4 overflow-y-auto space-y-3">
                      {settings.navigation.sort((a,b) => a.order - b.order).map((item, index) => (
                          <div key={item.id} className={`flex items-center gap-2 p-3 rounded-xl border ${item.isVisible ? 'bg-white border-gray-200' : 'bg-gray-50 border-dashed border-gray-300 opacity-60'}`}>
                              <div className="flex flex-col gap-1">
                                  <button onClick={() => handleMoveItem(index, 'up')} disabled={index === 0} className="text-gray-400 hover:text-dahab-teal disabled:opacity-30"><ArrowUp size={14} /></button>
                                  <button onClick={() => handleMoveItem(index, 'down')} disabled={index === settings.navigation.length - 1} className="text-gray-400 hover:text-dahab-teal disabled:opacity-30"><ArrowDown size={14} /></button>
                              </div>
                              <div className="flex-1 grid grid-cols-2 gap-2">
                                  <input 
                                    value={item.label} 
                                    onChange={(e) => handleUpdateItem(item.id, 'label', e.target.value)}
                                    className="border rounded px-2 py-1 text-sm text-gray-900" 
                                    placeholder="Label"
                                  />
                                   <input 
                                    value={item.path} 
                                    onChange={(e) => handleUpdateItem(item.id, 'path', e.target.value)}
                                    className="border rounded px-2 py-1 text-sm text-gray-900" 
                                    placeholder="/path"
                                  />
                                   <select 
                                     value={item.icon} 
                                     onChange={(e) => handleUpdateItem(item.id, 'icon', e.target.value)}
                                     className="border rounded px-2 py-1 text-sm text-gray-900"
                                   >
                                      {Object.keys(ICON_MAP).map(k => <option key={k} value={k}>{k}</option>)}
                                   </select>
                              </div>
                              <div className="flex items-center gap-1">
                                  <input 
                                    type="checkbox" 
                                    checked={item.isVisible} 
                                    onChange={() => handleToggleVisibility(item.id)}
                                    className="w-4 h-4"
                                  />
                                  <button onClick={() => handleDeleteItem(item.id)} className="p-2 text-red-400 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                              </div>
                          </div>
                      ))}
                      <button onClick={handleAddItem} className="w-full py-2 border-2 border-dashed border-dahab-teal text-dahab-teal font-bold rounded-xl hover:bg-teal-50 flex items-center justify-center gap-2">
                          <Plus size={16} /> Add New Tab
                      </button>
                  </div>
                  <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                      <button onClick={() => setIsNavEditorOpen(false)} className="px-6 py-2 bg-dahab-teal text-white rounded-lg font-bold">Done</button>
                  </div>
              </div>
          </div>
      )}
    </>
  );
};

export default Navbar;


import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Calendar, Car, User, LayoutDashboard, LogOut, Users, Menu, Briefcase, 
  Download, ShieldCheck, Settings, Plus, X, ArrowUp, ArrowDown, Trash2, Globe
} from 'lucide-react';
import { UserRole, NavItem } from '../types';
import { useSettings } from '../contexts/SettingsContext';
import Editable from './Editable';

interface NavbarProps {
  userRole: UserRole | null;
  onLogout: () => void;
  installPrompt: any;
  onInstall: () => void;
}

const ICON_MAP: Record<string, any> = {
    'Home': Home,
    'Calendar': Calendar,
    'Car': Car,
    'Users': Users,
    'Menu': Menu,
    'User': User,
    'Briefcase': Briefcase,
    'ShieldCheck': ShieldCheck,
    'Globe': Globe
};

const Navbar: React.FC<NavbarProps> = ({ userRole, onLogout, installPrompt, onInstall }) => {
  const location = useLocation();
  const { settings, isEditing, updateNavigation, language, setLanguage, t } = useSettings();
  const [logoError, setLogoError] = useState(false);
  const [isNavEditorOpen, setIsNavEditorOpen] = useState(false);

  const navItems = settings.navigation.filter(i => i.isVisible).sort((a, b) => a.order - b.order);

  const isActive = (path: string) => location.pathname === path ? "text-dahab-teal font-bold" : "text-gray-500 hover:text-dahab-teal";

  const LanguageToggle = () => (
    <button 
      onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
      className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-full transition-all border border-gray-200 group"
    >
      <Globe size={16} className="text-dahab-teal group-hover:rotate-12 transition-transform" />
      <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
        {language === 'en' ? 'عربي' : 'EN'}
      </span>
    </button>
  );

  const BrandLogo = ({ className = "h-10" }: { className?: string }) => {
    if (isEditing) {
      return (
        <div className={`flex items-center ${className} max-w-[120px] overflow-hidden`}>
           <Editable 
             id="global-logo" 
             type="image" 
             defaultContent={settings.logoUrl} 
             className="h-full w-auto object-contain"
           />
        </div>
      );
    }

    if (settings.logoUrl && !logoError) {
      return (
        <img 
          src={settings.logoUrl} 
          alt={settings.appName} 
          className={`${className} w-auto object-contain max-w-[150px]`} 
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

  const handleAddItem = async () => {
      const id = Math.random().toString(36).substr(2, 5);
      const newItems = [...settings.navigation, {
          id: `nav-${id}`,
          label: 'New Tab',
          path: `/p/${id}`, 
          icon: 'Globe',
          order: settings.navigation.length + 1,
          isVisible: true
      }];
      await updateNavigation(newItems);
      alert("New tab added to database!");
  };

  const MobileTopBar = () => (
    <div className="md:hidden fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md shadow-sm z-50 px-4 py-3 flex justify-between items-center pt-safe border-b border-gray-100">
       <div className="flex items-center gap-2 h-10 overflow-hidden">
          <BrandLogo className="h-8" />
       </div>
       
       <div className="flex items-center gap-2">
         <LanguageToggle />
         {userRole === UserRole.ADMIN && (
             <button onClick={handleAddItem} className="p-2 bg-dahab-teal text-white rounded-full shadow-lg">
                 <Plus size={16} />
             </button>
         )}
         {isEditing && (
             <button onClick={() => setIsNavEditorOpen(true)} className="p-2 bg-slate-900 text-white rounded-full">
                 <Settings size={16} />
             </button>
         )}
       </div>
    </div>
  );

  const MobileBottomNav = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 py-3 px-6 flex justify-between items-center z-50 md:hidden pb-safe overflow-x-auto no-scrollbar">
      {navItems.map((item) => {
          const Icon = ICON_MAP[item.icon] || Home;
          const translatedLabel = t(`nav.${item.label.toLowerCase()}`);
          return (
            <Link key={item.id} to={item.path} className={`flex flex-col items-center gap-1 min-w-[60px] ${isActive(item.path)}`}>
                <Icon size={24} />
                <span className="text-[10px] font-bold truncate w-full text-center">{translatedLabel !== `nav.${item.label.toLowerCase()}` ? translatedLabel : item.label}</span>
            </Link>
          );
      })}

      <Link 
        to={userRole === UserRole.ADMIN ? "/admin" : userRole === UserRole.PROVIDER ? "/provider-dashboard" : userRole ? "/profile" : "/login"} 
        className={`flex flex-col items-center gap-1 min-w-[60px] ${isActive(userRole === UserRole.ADMIN ? "/admin" : "/profile")}`}
      >
        {userRole === UserRole.ADMIN ? <ShieldCheck size={24} /> :
         userRole === UserRole.PROVIDER ? <Briefcase size={24} /> :
         <User size={24} />
        }
        <span className="text-[10px] font-bold">
          {userRole === UserRole.ADMIN ? t('nav.admin') : 
           userRole === UserRole.PROVIDER ? 'Dash' : 
           userRole ? t('nav.profile') : t('nav.login')}
        </span>
      </Link>
    </div>
  );

  const DesktopNav = () => (
    <div className="hidden md:flex fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md shadow-sm z-50 px-8 py-4 justify-between items-center pt-safe border-b border-gray-100">
      <div className="flex items-center gap-6 h-12">
        <BrandLogo className="h-10" />
        <div className="h-6 w-px bg-gray-200"></div>
        <LanguageToggle />
      </div>
      
      <div className="flex gap-8 items-center">
        {navItems.map((item) => {
             const translatedLabel = t(`nav.${item.label.toLowerCase()}`);
             return (
              <Link key={item.id} to={item.path} className={`text-sm font-bold transition-colors ${isActive(item.path)}`}>
                  {translatedLabel !== `nav.${item.label.toLowerCase()}` ? translatedLabel : item.label}
              </Link>
             );
        })}
        
        {userRole === UserRole.ADMIN && (
          <div className="flex items-center gap-2">
             <button onClick={handleAddItem} className="bg-dahab-teal text-white p-2 rounded-full hover:scale-110 transition shadow-md" title="Quick Add Tab">
                <Plus size={16} />
             </button>
             {isEditing && (
                <button onClick={() => setIsNavEditorOpen(true)} className="bg-slate-900 text-white px-3 py-1 rounded text-xs font-bold hover:bg-black transition">
                    Edit Menu
                </button>
             )}
          </div>
        )}
      </div>

      <div className="flex gap-4 items-center">
        {userRole ? (
          <div className="flex items-center gap-4">
             <Link to="/profile" className={`flex items-center gap-2 font-bold text-sm ${isActive('/profile')}`}>
               <User size={18} /> {t('nav.profile')}
             </Link>
            <button onClick={onLogout} className="text-red-500 hover:text-red-600 font-bold text-sm flex items-center gap-2">
              <LogOut size={18} /> {t('nav.logout')}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login" className="text-gray-600 hover:text-dahab-teal px-4 py-2 rounded-full font-bold transition text-sm">
              {t('nav.login')}
            </Link>
            <Link to="/login?mode=signup" className="bg-dahab-teal text-white px-5 py-2 rounded-full hover:bg-teal-700 transition shadow-md font-bold text-sm">
              {t('nav.signup')}
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

      {isNavEditorOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[80vh] text-gray-900">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                      <h3 className="font-extrabold text-xl text-gray-900">Menu Architect</h3>
                      <button onClick={() => setIsNavEditorOpen(false)}><X size={24} className="text-gray-400" /></button>
                  </div>
                  <div className="p-6 overflow-y-auto space-y-4">
                      {settings.navigation.sort((a,b) => a.order - b.order).map((item, index) => (
                          <div key={item.id} className={`flex items-center gap-3 p-4 rounded-2xl border ${item.isVisible ? 'bg-white border-gray-100 shadow-sm' : 'bg-gray-50 border-dashed border-gray-200 opacity-60 grayscale'}`}>
                              <div className="flex flex-col gap-1">
                                  <button onClick={() => {
                                      const newItems = [...settings.navigation];
                                      if(index > 0) {
                                          [newItems[index].order, newItems[index-1].order] = [newItems[index-1].order, newItems[index].order];
                                          updateNavigation(newItems);
                                      }
                                  }} className="text-gray-400 hover:text-dahab-teal"><ArrowUp size={16} /></button>
                                  <button onClick={() => {
                                      const newItems = [...settings.navigation];
                                      if(index < newItems.length - 1) {
                                          [newItems[index].order, newItems[index+1].order] = [newItems[index+1].order, newItems[index].order];
                                          updateNavigation(newItems);
                                      }
                                  }} className="text-gray-400 hover:text-dahab-teal"><ArrowDown size={16} /></button>
                              </div>
                              <div className="flex-1 space-y-2">
                                  <input 
                                    value={item.label} 
                                    onChange={(e) => {
                                        const newItems = settings.navigation.map(i => i.id === item.id ? {...i, label: e.target.value} : i);
                                        updateNavigation(newItems);
                                    }}
                                    className="bg-slate-50 border border-gray-200 rounded-lg px-3 py-1 text-sm font-bold w-full" 
                                  />
                                  <input 
                                    value={item.path} 
                                    onChange={(e) => {
                                        const newItems = settings.navigation.map(i => i.id === item.id ? {...i, path: e.target.value} : i);
                                        updateNavigation(newItems);
                                    }}
                                    className="bg-slate-50 border border-gray-200 rounded-lg px-3 py-1 text-xs font-mono w-full" 
                                  />
                              </div>
                              <div className="flex items-center gap-2">
                                  <button 
                                    onClick={() => {
                                        const newItems = settings.navigation.map(i => i.id === item.id ? {...i, isVisible: !i.isVisible} : i);
                                        updateNavigation(newItems);
                                    }}
                                    className={`p-2 rounded-lg transition ${item.isVisible ? 'text-dahab-teal bg-teal-50' : 'text-gray-400 bg-gray-100'}`}
                                  >
                                      {item.isVisible ? <ShieldCheck size={18}/> : <ShieldOff size={18}/>}
                                  </button>
                                  <button onClick={() => {
                                      if(window.confirm("Delete tab?")) {
                                          const newItems = settings.navigation.filter(i => i.id !== item.id);
                                          updateNavigation(newItems);
                                      }
                                  }} className="p-2 text-red-500 bg-red-50 rounded-lg hover:bg-red-500 hover:text-white transition">
                                      <Trash2 size={18} />
                                  </button>
                              </div>
                          </div>
                      ))}
                  </div>
                  <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
                      <button onClick={() => setIsNavEditorOpen(false)} className="px-8 py-3 bg-dahab-teal text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-xl shadow-teal-500/30">Finish</button>
                  </div>
              </div>
          </div>
      )}
    </>
  );
};

const ShieldOff = ({size}: {size:number}) => <ShieldCheck size={size} className="opacity-40" />;

export default Navbar;

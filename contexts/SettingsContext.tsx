
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppSettings, NavItem, HomeSection } from '../types';
import { db } from '../services/database';

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: AppSettings) => Promise<void>;
  loading: boolean;
  isEditing: boolean;
  toggleEditing: () => void;
  updateContent: (key: string, value: string) => Promise<void>;
  
  // New Helpers
  updateNavigation: (items: NavItem[]) => Promise<void>;
  updateHomeLayout: (sections: HomeSection[]) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Default Nav to use in case of error
const FALLBACK_NAV: NavItem[] = [
  { id: 'nav-1', label: 'Home', path: '/', icon: 'Home', order: 1, isVisible: true },
  { id: 'nav-2', label: 'Events', path: '/events', icon: 'Calendar', order: 2, isVisible: true },
  { id: 'nav-3', label: 'Services', path: '/services', icon: 'Car', order: 3, isVisible: true },
  { id: 'nav-4', label: 'Community', path: '/community', icon: 'Users', order: 4, isVisible: true },
  { id: 'nav-5', label: 'More', path: '/more', icon: 'Menu', order: 5, isVisible: true },
];

const FALLBACK_SETTINGS: AppSettings = {
    appName: 'AmakenDahab',
    logoUrl: 'https://cdn-icons-png.flaticon.com/512/1042/1042390.png',
    heroImages: [],
    backgroundStyle: 'linear-gradient(to bottom, #0f172a, #1e293b)',
    contentOverrides: {},
    navigation: FALLBACK_NAV,
    homeLayout: []
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    db.getSettings()
      .then(s => {
        setSettings(s);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load settings:", err);
        // Fallback to default settings to prevent app crash
        setSettings(FALLBACK_SETTINGS);
        setLoading(false);
      });
  }, []);

  const updateSettings = async (newSettings: AppSettings) => {
    setSettings(newSettings);
    try {
        await db.updateSettings(newSettings);
    } catch (err) {
        console.error("Failed to save settings:", err);
        alert("Failed to save settings. Please check your connection.");
    }
  };

  const updateContent = async (key: string, value: string) => {
    if (!settings) return;
    const newOverrides = { ...settings.contentOverrides, [key]: value };
    const newSettings = { ...settings, contentOverrides: newOverrides };
    setSettings(newSettings);
    try {
        await db.updateContentOverride(key, value);
    } catch (err) {
        console.error("Failed to update content:", err);
    }
  };
  
  const updateNavigation = async (items: NavItem[]) => {
      if (!settings) return;
      const newSettings = { ...settings, navigation: items };
      setSettings(newSettings);
      try {
        await db.updateSettings(newSettings);
      } catch (err) {
        console.error("Failed to update navigation:", err);
      }
  };

  const updateHomeLayout = async (sections: HomeSection[]) => {
      if (!settings) return;
      const newSettings = { ...settings, homeLayout: sections };
      setSettings(newSettings);
      try {
        await db.updateSettings(newSettings);
      } catch (err) {
        console.error("Failed to update home layout:", err);
      }
  };

  const toggleEditing = () => setIsEditing(prev => !prev);

  if (loading || !settings) return <div className="h-screen flex items-center justify-center bg-gray-50 text-dahab-teal font-bold animate-pulse">Loading App Configuration...</div>;

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, loading, isEditing, toggleEditing, updateContent, updateNavigation, updateHomeLayout }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
};

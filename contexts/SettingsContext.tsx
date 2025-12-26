
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppSettings, NavItem, HomeSection } from '../types';
import { db } from '../services/database';

type Language = 'en' | 'ar';

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: AppSettings) => Promise<void>;
  loading: boolean;
  isEditing: boolean;
  toggleEditing: () => void;
  updateContent: (key: string, value: string) => Promise<void>;
  updateNavigation: (items: NavItem[]) => Promise<void>;
  updateHomeLayout: (sections: HomeSection[]) => Promise<void>;
  updatePageLayout: (path: string, sections: HomeSection[]) => Promise<void>;
  
  // Language Support
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    'nav.home': 'Home',
    'nav.events': 'Events',
    'nav.services': 'Services',
    'nav.community': 'Community',
    'nav.more': 'More',
    'nav.login': 'Login',
    'nav.signup': 'Sign Up',
    'nav.profile': 'Profile',
    'nav.admin': 'Admin',
    'nav.logout': 'Logout',
    'hero.find_events': 'Find Events',
    'hero.book_driver': 'Book a Driver',
    'home.explore': 'Explore Dahab',
    'home.featured': 'Featured Events',
    'home.view_all': 'View All',
    'home.quick_add': 'Quick Add Event',
    'home.add_section': 'Add New Page Section',
    'profile.saved': 'Saved',
    'profile.bookings': 'Bookings',
    'profile.logout': 'Logout',
    'common.back': 'Back',
    'common.cancel': 'Cancel',
    'common.save': 'Save Changes',
    'common.apply': 'Apply',
    'common.loading': 'Loading...',
    'common.done': 'Done'
  },
  ar: {
    'nav.home': 'الرئيسية',
    'nav.events': 'الفعاليات',
    'nav.services': 'الخدمات',
    'nav.community': 'المجتمع',
    'nav.more': 'المزيد',
    'nav.login': 'تسجيل الدخول',
    'nav.signup': 'إنشاء حساب',
    'nav.profile': 'الملف الشخصي',
    'nav.admin': 'الإدارة',
    'nav.logout': 'خروج',
    'hero.find_events': 'ابحث عن فعاليات',
    'hero.book_driver': 'احجز سائق',
    'home.explore': 'استكشف دهب',
    'home.featured': 'أبرز الفعاليات',
    'home.view_all': 'عرض الكل',
    'home.quick_add': 'إضافة فعالية سريعة',
    'home.add_section': 'إضافة قسم جديد للصفحة',
    'profile.saved': 'المحفوظات',
    'profile.bookings': 'الحجوزات',
    'profile.logout': 'تسجيل الخروج',
    'common.back': 'رجوع',
    'common.cancel': 'إلغاء',
    'common.save': 'حفظ التغييرات',
    'common.apply': 'تطبيق',
    'common.loading': 'جاري التحميل...',
    'common.done': 'تم'
  }
};

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
    homeLayout: [],
    pageLayouts: {}
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('amakendahab_lang');
    return (saved === 'ar' || saved === 'en') ? saved : 'en';
  });

  useEffect(() => {
    db.getSettings()
      .then(s => {
        setSettings(s);
        setLoading(false);
      })
      .catch(err => {
        setSettings(FALLBACK_SETTINGS);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('amakendahab_lang', language);
  }, [language]);

  const setLanguage = (lang: Language) => setLanguageState(lang);
  const t = (key: string) => TRANSLATIONS[language][key] || key;

  const updateSettings = async (newSettings: AppSettings) => {
    setSettings(newSettings);
    await db.updateSettings(newSettings);
  };

  const updateContent = async (key: string, value: string) => {
    if (!settings) return;
    const newOverrides = { ...settings.contentOverrides, [key]: value };
    const newSettings = { ...settings, contentOverrides: newOverrides };
    setSettings(newSettings);
    await db.updateContentOverride(key, value);
  };
  
  const updateNavigation = async (items: NavItem[]) => {
      if (!settings) return;
      const newSettings = { ...settings, navigation: items };
      setSettings(newSettings);
      await db.updateSettings(newSettings);
  };

  const updateHomeLayout = async (sections: HomeSection[]) => {
      if (!settings) return;
      const newSettings = { ...settings, homeLayout: sections };
      setSettings(newSettings);
      await db.updateSettings(newSettings);
  };

  const updatePageLayout = async (path: string, sections: HomeSection[]) => {
      if (!settings) return;
      const newPageLayouts = { ...(settings.pageLayouts || {}), [path]: sections };
      const newSettings = { ...settings, pageLayouts: newPageLayouts };
      setSettings(newSettings);
      await db.updateSettings(newSettings);
  };

  const toggleEditing = () => setIsEditing(prev => !prev);

  if (loading || !settings) return (
    <div className="h-screen flex items-center justify-center bg-white text-dahab-teal font-bold animate-pulse">
        AmakenDahab...
    </div>
  );

  return (
    <SettingsContext.Provider value={{ 
        settings, updateSettings, loading, isEditing, toggleEditing, 
        updateContent, updateNavigation, updateHomeLayout, updatePageLayout,
        language, setLanguage, t 
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
};

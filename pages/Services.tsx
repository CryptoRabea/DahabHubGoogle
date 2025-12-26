
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Phone, ShieldCheck, Car, Briefcase, Plus, Trash2, Edit2, Settings, Smartphone, ExternalLink, X } from 'lucide-react';
import { ServiceProvider, User } from '../types';
import { db } from '../services/database';
import ReviewsModal from '../components/ReviewsModal';
import { useSettings } from '../contexts/SettingsContext';
import Editable from '../components/Editable';

interface BannerButton {
  id: string;
  label: string;
  link: string;
  icon: string;
  style: 'primary' | 'secondary';
}

const ICON_MAP: Record<string, any> = {
  'Car': Car,
  'Briefcase': Briefcase,
  'Smartphone': Smartphone,
  'ExternalLink': ExternalLink,
  'Phone': Phone,
  'Star': Star,
  'ShieldCheck': ShieldCheck
};

interface ServicesProps {
  user: User | null;
}

const Services: React.FC<ServicesProps> = ({ user }) => {
  const { isEditing, language, t, settings, updateContent } = useSettings();
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'Driver' | 'Other'>('all');
  const [loading, setLoading] = useState(true);

  // Banner Buttons Logic
  const bannerButtonsKey = `services_banner_buttons_${language}`;
  const [bannerButtons, setBannerButtons] = useState<BannerButton[]>([]);
  const [editingButtonIdx, setEditingButtonIdx] = useState<number | null>(null);

  // Reviews Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedProviderForReview, setSelectedProviderForReview] = useState<{id: string, title: string} | null>(null);

  useEffect(() => {
    // Parse banner buttons from settings
    const savedButtons = settings.contentOverrides[bannerButtonsKey];
    if (savedButtons) {
      try {
        setBannerButtons(JSON.parse(savedButtons));
      } catch (e) {
        setBannerButtons([
          { id: '1', label: 'Are you a Driver?', link: '/login?role=provider', icon: 'Car', style: 'secondary' },
          { id: '2', label: 'List a Service', link: '/login?role=provider', icon: 'Briefcase', style: 'primary' }
        ]);
      }
    } else {
      setBannerButtons([
        { id: '1', label: language === 'ar' ? 'هل أنت سائق؟' : 'Are you a Driver?', link: '/login?role=provider', icon: 'Car', style: 'secondary' },
        { id: '2', label: language === 'ar' ? 'أضف خدمة' : 'List a Service', link: '/login?role=provider', icon: 'Briefcase', style: 'primary' }
      ]);
    }

    const fetchProviders = () => {
      db.getProviders().then(data => {
        setProviders(data);
        setLoading(false);
      });
    };
    
    fetchProviders();
    const interval = setInterval(fetchProviders, 5000);
    return () => clearInterval(interval);
  }, [settings.contentOverrides, bannerButtonsKey, language]);

  const saveButtons = async (newButtons: BannerButton[]) => {
    setBannerButtons(newButtons);
    await updateContent(bannerButtonsKey, JSON.stringify(newButtons));
  };

  const handleAddButton = () => {
    const newBtn: BannerButton = {
      id: Math.random().toString(36).substr(2, 5),
      label: 'New Button',
      link: '/',
      icon: 'ExternalLink',
      style: 'secondary'
    };
    saveButtons([...bannerButtons, newBtn]);
  };

  const handleDeleteButton = (idx: number) => {
    if (window.confirm("Remove this button?")) {
      const newButtons = bannerButtons.filter((_, i) => i !== idx);
      saveButtons(newButtons);
    }
  };

  const handleUpdateBtn = (idx: number, updates: Partial<BannerButton>) => {
    const newButtons = [...bannerButtons];
    newButtons[idx] = { ...newButtons[idx], ...updates };
    setBannerButtons(newButtons);
  };

  const openReviews = (provider: ServiceProvider) => {
    setSelectedProviderForReview({ id: provider.id, title: provider.name });
    setReviewModalOpen(true);
  };

  const filteredProviders = activeTab === 'all' 
    ? providers 
    : providers.filter(p => activeTab === 'Driver' ? p.serviceType === 'Driver' : p.serviceType !== 'Driver');

  return (
    <div className="space-y-8 pb-20">
      {/* Header with Tabs */}
      <div className={`bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-gray-900 transition-all ${isEditing ? 'ring-2 ring-dahab-teal border-dashed' : ''}`}>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold">
            <Editable 
              id={`services_title_${language}`} 
              defaultContent={language === 'ar' ? 'دليل الخدمات' : 'Services Directory'} 
            />
          </h1>
          <div className="flex p-1 bg-gray-100 rounded-xl">
            {['all', 'Driver', 'Other'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition ${activeTab === tab ? 'bg-white shadow text-dahab-teal' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {tab === 'all' ? (language === 'ar' ? 'الكل' : 'All Services') : tab === 'Driver' ? (language === 'ar' ? 'السائقين' : 'Drivers') : (language === 'ar' ? 'خدمات منزلية' : 'Home Services')}
              </button>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <div className={`bg-blue-50 p-6 rounded-2xl border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-6 relative group/banner transition-all ${isEditing ? 'border-dahab-teal border-dashed ring-4 ring-dahab-teal/5 m-2' : ''}`}>
          <div className="text-start flex-1">
            <h3 className="font-bold text-blue-900 text-lg">
              <Editable 
                id={`services_banner_title_${language}`} 
                defaultContent={language === 'ar' ? `اعمل أو قد مع ${settings.appName}` : `Drive or Work with ${settings.appName}`} 
              />
            </h3>
            <div className="text-sm text-blue-700 mt-1">
              <Editable 
                id={`services_banner_desc_${language}`} 
                defaultContent={language === 'ar' ? "انضم إلى شبكتنا الموثقة من المحترفين المحليين." : "Join our verified network of local professionals."} 
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
             {bannerButtons.map((btn, idx) => {
               const Icon = ICON_MAP[btn.icon] || ExternalLink;
               return (
                 <div key={btn.id} className="relative group/btn">
                    <Link 
                      to={isEditing ? "#" : btn.link} 
                      className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition shadow-sm ${
                        btn.style === 'primary' 
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50'
                      } ${isEditing ? 'cursor-default' : ''}`}
                    >
                      <Icon size={18} />
                      {btn.label}
                    </Link>
                    {isEditing && (
                      <div className="absolute -top-4 -right-2 flex gap-1 opacity-0 group-hover/btn:opacity-100 transition-opacity z-20">
                         <button onClick={() => setEditingButtonIdx(idx)} className="p-1 bg-dahab-gold text-black rounded-full shadow hover:scale-110"><Settings size={12}/></button>
                         <button onClick={() => handleDeleteButton(idx)} className="p-1 bg-red-500 text-white rounded-full shadow hover:scale-110"><Trash2 size={12}/></button>
                      </div>
                    )}
                 </div>
               );
             })}
             
             {isEditing && (
               <button 
                 onClick={handleAddButton}
                 className="p-3 border-2 border-dashed border-dahab-teal text-dahab-teal rounded-xl hover:bg-white transition flex items-center justify-center gap-2 font-bold text-xs"
               >
                 <Plus size={16} /> Add Button
               </button>
             )}
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-20 opacity-70 flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-dahab-teal border-t-transparent rounded-full animate-spin mb-4"></div>
            Loading directory...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProviders.map((provider) => (
            <div key={provider.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition border border-gray-100 flex flex-col gap-4 text-gray-900 text-start">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <img src={provider.imageUrl} alt={provider.name} className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" />
                  <div>
                    <h3 className="font-bold text-lg flex items-center gap-1">
                      {provider.name}
                      {provider.isVerified && <ShieldCheck size={16} className="text-dahab-teal" />}
                    </h3>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">{provider.serviceType}</span>
                  </div>
                </div>
                <button 
                  onClick={() => openReviews(provider)}
                  className="flex items-center gap-1 bg-yellow-50 text-yellow-600 px-2 py-1 rounded-lg text-sm font-bold hover:bg-yellow-100 transition"
                >
                  <Star size={14} fill="currentColor" />
                  {provider.rating}
                </button>
              </div>
              
              <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">{provider.description}</p>
              
              <div className="mt-auto pt-4 border-t border-gray-100 flex gap-3">
                <Link 
                  to={`/book/service/${provider.id}`} 
                  className="flex-1 bg-gray-900 text-white py-2.5 rounded-xl font-bold text-center text-sm hover:bg-dahab-teal transition shadow-sm"
                >
                  {language === 'ar' ? 'احجز الآن' : 'Book Now'}
                </Link>
                <a href={`tel:${provider.phone}`} className="flex items-center justify-center w-11 h-11 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition">
                  <Phone size={20} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Button Editor Modal */}
      {editingButtonIdx !== null && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm" onClick={() => setEditingButtonIdx(null)}></div>
          <div className="relative bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 overflow-hidden">
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-xl text-gray-900">Edit Button</h3>
                <button onClick={() => setEditingButtonIdx(null)}><X className="text-gray-400" /></button>
             </div>
             
             <div className="space-y-4">
                <div>
                   <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Label</label>
                   <input 
                     type="text" 
                     value={bannerButtons[editingButtonIdx].label}
                     onChange={(e) => handleUpdateBtn(editingButtonIdx, { label: e.target.value })}
                     className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 text-gray-900 font-bold"
                   />
                </div>
                <div>
                   <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Icon</label>
                   <select 
                     value={bannerButtons[editingButtonIdx].icon}
                     onChange={(e) => handleUpdateBtn(editingButtonIdx, { icon: e.target.value })}
                     className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 text-gray-900"
                   >
                      {Object.keys(ICON_MAP).map(k => <option key={k} value={k}>{k}</option>)}
                   </select>
                </div>
                <div>
                   <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Style</label>
                   <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => handleUpdateBtn(editingButtonIdx, { style: 'primary' })}
                        className={`py-2 rounded-lg font-bold text-xs border-2 transition ${bannerButtons[editingButtonIdx].style === 'primary' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-100 text-gray-400'}`}
                      >Primary</button>
                      <button 
                        onClick={() => handleUpdateBtn(editingButtonIdx, { style: 'secondary' })}
                        className={`py-2 rounded-lg font-bold text-xs border-2 transition ${bannerButtons[editingButtonIdx].style === 'secondary' ? 'bg-white text-blue-600 border-blue-600' : 'border-gray-100 text-gray-400'}`}
                      >Secondary</button>
                   </div>
                </div>
                <div>
                   <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Link Path / URL</label>
                   <input 
                     type="text" 
                     value={bannerButtons[editingButtonIdx].link}
                     onChange={(e) => handleUpdateBtn(editingButtonIdx, { link: e.target.value })}
                     className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 text-gray-900 font-mono text-sm"
                   />
                </div>
             </div>

             <button 
               onClick={async () => {
                 await saveButtons(bannerButtons);
                 setEditingButtonIdx(null);
               }}
               className="w-full bg-dahab-teal text-white py-4 rounded-2xl font-bold mt-8 hover:bg-teal-700 shadow-xl shadow-teal-500/20"
             >
               Save Changes
             </button>
          </div>
        </div>
      )}

      {/* Reviews Modal */}
      <ReviewsModal 
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        itemId={selectedProviderForReview?.id || null}
        itemTitle={selectedProviderForReview?.title || ''}
        user={user}
      />
    </div>
  );
};

export default Services;

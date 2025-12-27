
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Star, Phone, ShieldCheck, Car, Briefcase, Plus, Trash2, Edit2, Settings, 
  Smartphone, ExternalLink, X, Edit, Utensils, Mountain, Heart, Music, 
  Sparkles, Wrench, Flag, MoreHorizontal, ArrowLeft, Grid 
} from 'lucide-react';
import { ServiceProvider, User } from '../types';
import { db } from '../services/database';
import ReviewsModal from '../components/ReviewsModal';
import { useSettings } from '../contexts/SettingsContext';
import Editable from '../components/Editable';
import ServiceFormModal from '../components/ServiceFormModal';

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

const CATEGORIES_CONFIG = [
  { id: 'Food', label: 'Food & Dining', icon: Utensils, color: 'bg-orange-100 text-orange-600' },
  { id: 'Trips', label: 'Trips & Tours', icon: Mountain, color: 'bg-green-100 text-green-600' },
  { id: 'Entertainment', label: 'Entertainment', icon: Music, color: 'bg-purple-100 text-purple-600' },
  { id: 'Wellness', label: 'Wellness & Spa', icon: Heart, color: 'bg-rose-100 text-rose-600' },
  { id: 'Driver', label: 'Drivers & Taxi', icon: Car, color: 'bg-blue-100 text-blue-600' },
  { id: 'Cleaner', label: 'Cleaning Services', icon: Sparkles, color: 'bg-cyan-100 text-cyan-600' },
  { id: 'Maintenance', label: 'Maintenance', icon: Wrench, color: 'bg-slate-100 text-slate-600' },
  { id: 'Guide', label: 'Local Guides', icon: Flag, color: 'bg-indigo-100 text-indigo-600' },
  { id: 'Other', label: 'Other Services', icon: MoreHorizontal, color: 'bg-gray-100 text-gray-600' }
];

interface ServicesProps {
  user: User | null;
}

const Services: React.FC<ServicesProps> = ({ user }) => {
  const { isEditing, language, t, settings, updateContent } = useSettings();
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Banner Buttons Logic
  const bannerButtonsKey = `services_banner_buttons_${language}`;
  const [bannerButtons, setBannerButtons] = useState<BannerButton[]>([]);
  const [editingButtonIdx, setEditingButtonIdx] = useState<number | null>(null);

  // Reviews Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedProviderForReview, setSelectedProviderForReview] = useState<{id: string, title: string} | null>(null);

  // Service Edit/Create Modal State
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceProvider | null>(null);

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

    fetchProviders();
    const interval = setInterval(fetchProviders, 5000);
    return () => clearInterval(interval);
  }, [settings.contentOverrides, bannerButtonsKey, language]);

  const fetchProviders = () => {
    db.getProviders().then(data => {
      setProviders(data);
      setLoading(false);
    });
  };

  const saveButtons = async (newButtons: BannerButton[]) => {
    setBannerButtons(newButtons);
    await updateContent(bannerButtonsKey, JSON.stringify(newButtons));
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

  const handleAddService = () => {
      setEditingService(null);
      setIsServiceModalOpen(true);
  };

  const handleEditService = (provider: ServiceProvider) => {
      setEditingService(provider);
      setIsServiceModalOpen(true);
  };

  const handleDeleteService = async (id: string) => {
      if(window.confirm("Are you sure you want to delete this service?")) {
          await db.deleteProvider(id);
          fetchProviders();
      }
  };

  const handleServiceSubmit = async (data: Partial<ServiceProvider>) => {
      if (editingService) {
          await db.updateProvider({ ...editingService, ...data } as ServiceProvider);
      } else {
          await db.addProvider({
              id: Math.random().toString(36).substr(2, 9),
              name: data.name!,
              serviceType: data.serviceType!,
              description: data.description!,
              phone: data.phone!,
              rating: 5.0,
              imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=800',
              isVerified: true
          } as ServiceProvider);
      }
      fetchProviders();
  };

  const filteredProviders = providers.filter(p => {
      if (!selectedCategory) return false;
      return p.serviceType === selectedCategory;
  });

  const getCategoryLabel = (id: string) => {
      const cat = CATEGORIES_CONFIG.find(c => c.id === id);
      return cat ? cat.label : id;
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className={`bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-gray-900 transition-all ${isEditing ? 'ring-2 ring-dahab-teal border-dashed' : ''}`}>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex items-center gap-4 w-full">
              {selectedCategory && (
                  <button 
                    onClick={() => setSelectedCategory(null)}
                    className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
                  >
                      <ArrowLeft size={20} />
                  </button>
              )}
              <div className="flex-1">
                  <h1 className="text-2xl font-bold flex items-center gap-2">
                    {selectedCategory ? (
                        <span>{getCategoryLabel(selectedCategory)}</span>
                    ) : (
                        <Editable 
                            id={`services_title_${language}`} 
                            defaultContent={language === 'ar' ? 'دليل الخدمات' : 'Services Directory'} 
                        />
                    )}
                  </h1>
                  {selectedCategory && <p className="text-sm text-gray-500">{filteredProviders.length} Listing{filteredProviders.length !== 1 && 's'}</p>}
              </div>
              {isEditing && (
                  <button 
                    onClick={handleAddService}
                    className="border-2 border-dashed border-dahab-teal text-dahab-teal px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 hover:bg-teal-50" 
                    title="Add Service"
                  >
                      <Plus size={14} /> Add Services
                  </button>
              )}
          </div>
        </div>

        {/* CTA Banner - Only Show on Main View */}
        {!selectedCategory && (
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
            </div>
            </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20 opacity-70 flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-dahab-teal border-t-transparent rounded-full animate-spin mb-4"></div>
            Loading directory...
        </div>
      ) : (
        <>
            {/* View: Categories Grid */}
            {!selectedCategory && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-fade-in">
                    {CATEGORIES_CONFIG.map((cat) => (
                        <button 
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center gap-3 hover:shadow-md hover:border-dahab-teal/30 hover:bg-slate-50 transition group text-center"
                        >
                            <div className={`p-4 rounded-full ${cat.color} group-hover:scale-110 transition-transform`}>
                                <cat.icon size={32} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 group-hover:text-dahab-teal transition">{cat.label}</h3>
                                <p className="text-xs text-gray-400 font-medium">
                                    {providers.filter(p => p.serviceType === cat.id).length} Listings
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* View: Service List */}
            {selectedCategory && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                {filteredProviders.length === 0 ? (
                    <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <Grid size={32} />
                        </div>
                        <p className="text-gray-500 font-medium">No services found in this category yet.</p>
                        {isEditing && (
                            <button onClick={handleAddService} className="mt-4 text-dahab-teal font-bold hover:underline">
                                Add the first one!
                            </button>
                        )}
                    </div>
                ) : (
                    filteredProviders.map((provider) => (
                    <div key={provider.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition border border-gray-100 flex flex-col gap-4 text-gray-900 text-start relative group">
                    {isEditing && (
                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition z-10">
                            <button onClick={() => handleEditService(provider)} className="p-1.5 bg-blue-500 text-white rounded-lg shadow"><Edit size={14}/></button>
                            <button onClick={() => handleDeleteService(provider.id)} className="p-1.5 bg-red-500 text-white rounded-lg shadow"><Trash2 size={14}/></button>
                        </div>
                    )}
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
                )))}
                </div>
            )}
        </>
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
      
      {/* Service Form Modal */}
      <ServiceFormModal 
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        onSubmit={handleServiceSubmit}
        initialData={editingService}
      />

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

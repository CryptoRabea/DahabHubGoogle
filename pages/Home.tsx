
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../services/database';
import { Event, UserRole, HeroConfig } from '../types';
import { Calendar, MapPin, Clock, ArrowRight, Sparkles, Car, Briefcase, XCircle, ArrowUp, ArrowDown, Plus, Trash2, EyeOff, Eye, Edit2, X, Settings, Image as ImageIcon, Sliders } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import Editable from '../components/Editable';
import EventFormModal from '../components/EventFormModal';

const HeroSection = ({ id, isActive, onMove, onDelete, onToggle, isEditing, settings }: any) => {
  const { t, language, updateSettings } = useSettings();
  const [currentImage, setCurrentImage] = useState(0);
  const [isHeroConfigOpen, setIsHeroConfigOpen] = useState(false);

  // Use config or defaults
  const heroConfig: HeroConfig = settings.heroConfig || {
    height: "500px",
    displayLimit: 5,
    autoPlaySpeed: 5000
  };

  const imagesToDisplay = settings.heroImages.slice(0, heroConfig.displayLimit);

  useEffect(() => {
    if (imagesToDisplay.length === 0) return;
    const timer = setInterval(() => setCurrentImage((prev) => (prev + 1) % imagesToDisplay.length), heroConfig.autoPlaySpeed);
    return () => clearInterval(timer);
  }, [imagesToDisplay, heroConfig.autoPlaySpeed]);

  const updateHeroConfig = async (updates: Partial<HeroConfig>) => {
    await updateSettings({
        ...settings,
        heroConfig: { ...heroConfig, ...updates }
    });
  };

  const handleUpdateImages = async (newImages: string[]) => {
    await updateSettings({ ...settings, heroImages: newImages });
  };

  return (
      <section 
        className={`relative rounded-3xl overflow-hidden shadow-2xl group transition-all ${isEditing ? 'border-2 border-dahab-teal border-dashed m-2 ring-4 ring-dahab-teal/10' : ''}`}
        style={{ height: heroConfig.height }}
      >
        {/* Admin Controls Overlay */}
        {isEditing && (
            <div className="absolute top-4 left-4 z-50 flex gap-2">
                 <div className="bg-dahab-teal text-white px-2 py-1 rounded text-[10px] font-bold uppercase shadow-lg">Hero Block</div>
                 <button onClick={() => onMove('up')} className="bg-white p-1 rounded hover:bg-gray-100 shadow"><ArrowUp size={14} className="text-gray-800" /></button>
                 <button onClick={() => onMove('down')} className="bg-white p-1 rounded hover:bg-gray-100 shadow"><ArrowDown size={14} className="text-gray-800" /></button>
                 <button onClick={() => setIsHeroConfigOpen(true)} className="bg-dahab-gold p-1 rounded hover:bg-yellow-500 shadow" title="Slider Settings"><Sliders size={14} className="text-black" /></button>
                 <button onClick={onToggle} className="bg-white p-1 rounded hover:bg-gray-100 shadow">{isActive ? <Eye size={14} className="text-green-600"/> : <EyeOff size={14} className="text-gray-400"/>}</button>
                 <button onClick={onDelete} className="bg-red-500 p-1 rounded hover:bg-red-600 shadow"><Trash2 size={14} className="text-white" /></button>
            </div>
        )}

        <div className={`absolute inset-0 bg-gray-900 ${!isActive && isEditing ? 'opacity-20' : ''}`}>
          {imagesToDisplay.length > 0 ? (
            imagesToDisplay.map((img: string, index: number) => (
              <div key={index} className={`absolute inset-0 transition-all duration-[2000ms] ease-in-out transform ${index === currentImage ? 'opacity-100 scale-105' : 'opacity-0 scale-100'}`}>
                <img src={img} alt={`Dahab scenery ${index + 1}`} className="w-full h-full object-cover"/>
                <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
              </div>
            ))
          ) : (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500">No images configured</div>
          )}
        </div>

        <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8 md:p-16 z-10 ${!isActive && isEditing ? 'opacity-20' : ''}`}>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight drop-shadow-lg flex flex-col md:block gap-2 text-start">
            <Editable id={`hero-title-${id}-${language}`} defaultContent={language === 'ar' ? 'عيش روح' : 'Experience the Soul of'} className="inline-block mr-2" />
            <span className="text-dahab-gold">
               <Editable id={`hero-title-h-${id}-${language}`} defaultContent={language === 'ar' ? 'دهب' : 'Dahab'} />
            </span>
          </h1>
          <div className="text-gray-100 text-lg md:text-xl max-w-2xl mb-8 drop-shadow-md font-medium text-start">
             <Editable id={`hero-sub-${id}-${language}`} defaultContent={language === 'ar' ? 'المركز الاجتماعي الأول. اكتشف الفعاليات، احجز سائقين موثوقين، وتواصل مع المجتمع.' : 'The ultimate social hub. Discover events, book reliable drivers, and connect with the community.'} />
          </div>
          <div className="flex gap-4 flex-wrap">
            <Link to={isEditing ? "#" : "/events"} className={`bg-dahab-teal text-white px-8 py-3 rounded-full font-bold transition shadow-lg ${isEditing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-teal-700 hover:shadow-dahab-teal/50'}`}>
              {t('hero.find_events')}
            </Link>
            <Link to={isEditing ? "#" : "/services"} className={`bg-white/10 backdrop-blur-md text-white border border-white/50 px-8 py-3 rounded-full font-bold transition shadow-lg ${isEditing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/20'}`}>
              {t('hero.book_driver')}
            </Link>
          </div>
        </div>

        {/* Hero Slider Config Modal */}
        {isHeroConfigOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
             <div className="bg-white rounded-[2rem] w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] text-gray-900">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-xl">Hero Slider Settings</h3>
                    <button onClick={() => setIsHeroConfigOpen(false)}><X className="text-gray-400"/></button>
                </div>
                <div className="p-8 overflow-y-auto space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Display Height</label>
                            <select 
                              value={heroConfig.height} 
                              onChange={(e) => updateHeroConfig({ height: e.target.value })}
                              className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 bg-white text-gray-900"
                            >
                                <option value="400px">Short (400px)</option>
                                <option value="500px">Medium (500px)</option>
                                <option value="600px">Tall (600px)</option>
                                <option value="80vh">Immersive (80vh)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Max Images</label>
                            <input 
                                type="number" 
                                value={heroConfig.displayLimit}
                                onChange={(e) => updateHeroConfig({ displayLimit: parseInt(e.target.value) })}
                                className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 bg-white text-gray-900"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Slider Images</label>
                        <div className="grid grid-cols-2 gap-2">
                            {settings.heroImages.map((img: string, idx: number) => (
                                <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-gray-200">
                                    <img src={img} className="w-full h-full object-cover" />
                                    <button 
                                      onClick={() => handleUpdateImages(settings.heroImages.filter((_: any, i: number) => i !== idx))}
                                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow"
                                    >
                                        <X size={12}/>
                                    </button>
                                </div>
                            ))}
                            <button 
                               onClick={() => {
                                   const url = prompt("Enter Image URL:");
                                   if(url) handleUpdateImages([...settings.heroImages, url]);
                               }}
                               className="aspect-video border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50"
                            >
                                <Plus size={20} />
                                <span className="text-[10px] font-bold">Add Image</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="p-6 border-t border-gray-100 flex justify-end">
                    <button onClick={() => setIsHeroConfigOpen(false)} className="px-8 py-2 bg-dahab-teal text-white rounded-xl font-bold">Save & Close</button>
                </div>
             </div>
          </div>
        )}
      </section>
  );
};

const CategoriesSection = ({ id, isActive, onMove, onDelete, onToggle, isEditing, settings, sectionData, onUpdate }: any) => {
    const { t, language } = useSettings();
    const [editingIdx, setEditingIdx] = useState<number | null>(null);
    const categories = sectionData?.categories || [
      { title: 'Events & Parties', icon: '🎉', link: '/events', color: 'bg-purple-100 text-purple-600' },
      { title: 'Drivers & Services', icon: '🚕', link: '/services', color: 'bg-yellow-100 text-yellow-600' },
      { title: 'Community Hub', icon: '👥', link: '/community', color: 'bg-blue-100 text-blue-600' },
      { title: 'More & Guide', icon: '🗺️', link: '/more', color: 'bg-teal-100 text-teal-600' },
    ];

    const handleUpdateCard = (idx: number, updates: any) => {
      const newCats = [...categories];
      newCats[idx] = { ...newCats[idx], ...updates };
      onUpdate({ categories: newCats });
    };

    return (
      <section className={`relative transition-all ${isEditing ? 'border-2 border-dahab-teal border-dashed p-6 rounded-3xl m-2 bg-dahab-teal/5' : ''} ${!isActive && isEditing ? 'opacity-40 grayscale' : ''}`}>
        {isEditing && (
            <div className="absolute top-0 left-4 z-50 flex gap-2 -mt-3">
                 <div className="bg-dahab-teal text-white px-2 py-1 rounded text-[10px] font-bold uppercase shadow-lg">Navigation Grid</div>
                 <button onClick={() => onMove('up')} className="bg-white p-1 rounded hover:bg-gray-100 shadow border border-gray-100"><ArrowUp size={14} className="text-gray-800" /></button>
                 <button onClick={() => onMove('down')} className="bg-white p-1 rounded hover:bg-gray-100 shadow border border-gray-100"><ArrowDown size={14} className="text-gray-800" /></button>
                 <button onClick={onToggle} className="bg-white p-1 rounded hover:bg-gray-100 shadow border border-gray-100">{isActive ? <Eye size={14} className="text-green-600"/> : <EyeOff size={14} className="text-gray-400"/>}</button>
                 <button onClick={onDelete} className="bg-red-500 p-1 rounded hover:bg-red-600 shadow border border-red-100"><Trash2 size={14} className="text-white" /></button>
            </div>
        )}
        <div className="mb-6">
          <h2 className="text-2xl font-bold">
            <Editable id={`cat-title-${id}-${language}`} defaultContent={t('home.explore')} />
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat: any, idx: number) => (
             <div key={idx} className="relative group/card">
                <Link to={isEditing ? "#" : cat.link} className={`block p-6 rounded-2xl ${cat.color} transition flex flex-col items-center justify-center gap-3 text-center h-40 shadow-sm ${isEditing ? 'cursor-default' : 'hover:opacity-90 hover:scale-[1.02] transform duration-300'}`}>
                    <span className="text-4xl">{cat.icon}</span>
                    <span className="font-bold">{cat.title}</span>
                </Link>
                {isEditing && (
                  <button 
                    onClick={() => setEditingIdx(idx)}
                    className="absolute top-2 right-2 p-1.5 bg-white text-gray-700 rounded-full shadow-lg border border-gray-100 hover:bg-dahab-teal hover:text-white transition opacity-0 group-hover/card:opacity-100"
                  >
                    <Settings size={14} />
                  </button>
                )}
             </div>
          ))}
          {isEditing && (
             <div 
               onClick={() => {
                 const newCats = [...categories, { title: 'New Tab', icon: '✨', link: '/', color: 'bg-gray-100 text-gray-600' }];
                 onUpdate({ categories: newCats });
               }}
               className="h-40 rounded-2xl border-2 border-dashed border-dahab-teal flex flex-col items-center justify-center gap-2 text-dahab-teal bg-white/50 cursor-pointer hover:bg-white transition"
             >
                <Plus size={24} />
                <span className="text-xs font-bold">Add Card</span>
             </div>
          )}
        </div>

        {/* Card Editor Modal */}
        {editingIdx !== null && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingIdx(null)}></div>
            <div className="relative bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 text-gray-900">
              <h3 className="font-bold text-xl mb-6">Edit Card Settings</h3>
              <div className="space-y-4 text-start">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Title</label>
                  <input 
                    type="text" 
                    value={categories[editingIdx].title}
                    onChange={(e) => handleUpdateCard(editingIdx, { title: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-dahab-teal/50 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Icon (Emoji)</label>
                    <input 
                      type="text" 
                      value={categories[editingIdx].icon}
                      onChange={(e) => handleUpdateCard(editingIdx, { icon: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2 bg-white text-gray-900 text-center text-xl focus:ring-2 focus:ring-dahab-teal/50 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Color Class</label>
                    <input 
                      type="text" 
                      value={categories[editingIdx].color}
                      onChange={(e) => handleUpdateCard(editingIdx, { color: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2 bg-white text-gray-900 text-xs font-mono focus:ring-2 focus:ring-dahab-teal/50 outline-none"
                      placeholder="bg-blue-100 text-blue-600"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Link (URL/Path)</label>
                  <input 
                    type="text" 
                    value={categories[editingIdx].link}
                    onChange={(e) => handleUpdateCard(editingIdx, { link: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-dahab-teal/50 outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-8">
                <button 
                  onClick={() => {
                    const newCats = categories.filter((_: any, i: number) => i !== editingIdx);
                    onUpdate({ categories: newCats });
                    setEditingIdx(null);
                  }}
                  className="flex-1 py-3 text-red-500 font-bold hover:bg-red-50 rounded-xl transition"
                >
                  Delete
                </button>
                <button 
                  onClick={() => setEditingIdx(null)}
                  className="flex-1 py-3 bg-dahab-teal text-white rounded-xl font-bold hover:bg-teal-700 transition"
                >
                  {t('common.done')}
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    );
};

const FeaturedEventsSection = ({ id, isActive, onMove, onDelete, onToggle, isEditing, onQuickAdd }: any) => {
    const { t, language } = useSettings();
    const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeatured = async () => {
            const data = await db.getPublicEvents();
            const featured = data.filter(e => e.isFeatured);
            setFeaturedEvents(featured.length > 0 ? featured : data.slice(0, 3));
            setLoading(false);
        };
        fetchFeatured();
    }, []);

    return (
      <section className={`relative transition-all ${isEditing ? 'border-2 border-dahab-teal border-dashed p-6 rounded-3xl m-2 bg-dahab-teal/5' : ''} ${!isActive && isEditing ? 'opacity-40 grayscale' : ''}`}>
         {isEditing && (
            <div className="absolute top-0 left-4 z-50 flex gap-2 -mt-3">
                 <div className="bg-dahab-teal text-white px-2 py-1 rounded text-[10px] font-bold uppercase shadow-lg">Featured Events</div>
                 <button onClick={() => onMove('up')} className="bg-white p-1 rounded hover:bg-gray-100 shadow border border-gray-100"><ArrowUp size={14} className="text-gray-800" /></button>
                 <button onClick={() => onMove('down')} className="bg-white p-1 rounded hover:bg-gray-100 shadow border border-gray-100"><ArrowDown size={14} className="text-gray-800" /></button>
                 <button onClick={onToggle} className="bg-white p-1 rounded hover:bg-gray-100 shadow border border-gray-100">{isActive ? <Eye size={14} className="text-green-600"/> : <EyeOff size={14} className="text-gray-400"/>}</button>
                 <button onClick={onDelete} className="bg-red-500 p-1 rounded hover:bg-red-600 shadow border border-red-100"><Trash2 size={14} className="text-white" /></button>
            </div>
        )}
        
        <div className="flex justify-between items-end mb-6">
          <div className="flex items-center gap-4">
             <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Sparkles className="text-dahab-gold" fill="currentColor" size={24} />
                  <Editable id={`feat-title-${id}-${language}`} defaultContent={t('home.featured')} />
                </h2>
                <div className="opacity-80 text-sm mt-1">
                   <Editable id={`feat-sub-${id}-${language}`} defaultContent={language === 'ar' ? 'لا تفوت هذه الأنشطة الشعبية' : "Don't miss out on these popular activities"} />
                </div>
             </div>
             {isEditing && (
                <button 
                  onClick={onQuickAdd}
                  className="w-12 h-12 bg-dahab-teal text-white rounded-full shadow-lg flex items-center justify-center hover:bg-teal-700 hover:scale-110 transition animate-in zoom-in ring-4 ring-dahab-teal/20"
                  title={t('home.quick_add')}
                >
                  <Plus size={24} />
                </button>
             )}
          </div>
          <Link to={isEditing ? "#" : "/events"} className={`text-dahab-teal font-bold flex items-center gap-1 text-sm bg-teal-50 px-3 py-1 rounded-full ${isEditing ? 'opacity-50' : 'hover:underline'}`}>
            {t('home.view_all')} <ArrowRight size={16} className={language === 'ar' ? 'rotate-180' : ''} />
          </Link>
        </div>

        {loading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {[1,2,3].map(i => <div key={i} className="h-80 bg-gray-100/50 rounded-2xl animate-pulse"></div>)}
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.map(event => (
              <div key={event.id} className="relative group h-full text-start">
                <Link to={isEditing ? "#" : `/book/event/${event.id}`} className={`block bg-white rounded-2xl overflow-hidden shadow-sm transition border border-gray-100 h-full flex flex-col ${isEditing ? 'cursor-default' : 'hover:shadow-xl'}`}>
                  <div className="relative h-48 overflow-hidden">
                    <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover"/>
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-800 shadow-sm">
                      {event.category}
                    </div>
                    <div className="absolute bottom-4 right-4 bg-dahab-teal text-white px-3 py-1 rounded-lg text-sm font-bold shadow-lg">
                      {event.price} EGP
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-xl text-gray-900 mb-3">{event.title}</h3>
                    <div className="space-y-3 text-sm text-gray-500 mb-4 flex-1">
                      <div className="flex items-center gap-3"><Calendar size={16} className="text-orange-500"/><span>{event.date}</span></div>
                      <div className="flex items-center gap-3"><MapPin size={16} className="text-green-500"/><span className="truncate">{event.location}</span></div>
                    </div>
                    {!isEditing && (
                      <div className="pt-4 border-t border-gray-100 mt-auto flex items-center justify-between text-dahab-teal font-bold group-hover:translate-x-1 transition-transform">
                        <span>Book Now</span>
                        <ArrowRight size={18} className={language === 'ar' ? 'rotate-180' : ''} />
                      </div>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    );
};

const BannerSection = ({ id, isActive, onMove, onDelete, onToggle, isEditing, settings }: any) => {
    const { t, language } = useSettings();
    return (
      <section className={`bg-gray-900 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 text-white relative overflow-hidden transition-all ${isEditing ? 'border-2 border-dahab-teal border-dashed m-2' : ''} ${!isActive && isEditing ? 'opacity-40 grayscale' : ''}`}>
        {isEditing && (
            <div className="absolute top-4 left-4 z-50 flex gap-2">
                 <div className="bg-dahab-teal text-white px-2 py-1 rounded text-[10px] font-bold uppercase shadow-lg">Call to Action</div>
                 <button onClick={() => onMove('up')} className="bg-white p-1 rounded hover:bg-gray-100 shadow"><ArrowUp size={14} className="text-gray-800" /></button>
                 <button onClick={() => onMove('down')} className="bg-white p-1 rounded hover:bg-gray-100 shadow"><ArrowDown size={14} className="text-gray-800" /></button>
                 <button onClick={onToggle} className="bg-white p-1 rounded hover:bg-gray-100 shadow">{isActive ? <Eye size={14} className="text-green-600"/> : <EyeOff size={14} className="text-gray-400"/>}</button>
                 <button onClick={onDelete} className="bg-red-500 p-1 rounded hover:bg-red-600 shadow"><Trash2 size={14} className="text-white" /></button>
            </div>
        )}
        
        <div className="absolute top-0 right-0 w-64 h-64 bg-dahab-teal rounded-full blur-[100px] opacity-20 translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="space-y-4 relative z-10 text-start">
          <h2 className="text-3xl font-bold">
            <Editable id={`banner-title-${id}-${language}`} defaultContent={language === 'ar' ? `قد مع ${settings.appName}` : `Drive with ${settings.appName}`} />
          </h2>
          <div className="text-gray-400 max-w-md">
            <Editable id={`banner-desc-${id}-${language}`} defaultContent={language === 'ar' ? "هل أنت سائق محلي أو مقدم خدمة؟ انضم إلى شبكتنا الموثقة ونمِ عملك اليوم." : "Are you a local driver or service provider? Join our verified network and grow your business today."} />
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto relative z-10">
             <Link to={isEditing ? "#" : "/login?role=provider"} className={`bg-dahab-gold text-black px-8 py-3 rounded-full font-bold transition text-center shadow-lg flex items-center justify-center gap-2 ${isEditing ? 'opacity-50' : 'hover:bg-yellow-400'}`}>
               <Car size={20} /> {language === 'ar' ? 'سجل كسائق' : 'Register as Driver'}
             </Link>
             <Link to={isEditing ? "#" : "/login?role=provider"} className={`bg-gray-800 text-white border border-gray-700 px-8 py-3 rounded-full font-bold transition text-center shadow-lg flex items-center justify-center gap-2 ${isEditing ? 'opacity-50' : 'hover:bg-gray-700'}`}>
               <Briefcase size={20} /> {language === 'ar' ? 'أضف خدمة' : 'List a Service'}
             </Link>
        </div>
      </section>
    );
};

const Home: React.FC = () => {
  const { settings, isEditing, updateHomeLayout, t } = useSettings();
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  const handleUpdateSectionData = (index: number, newData: any) => {
      const newSections = [...settings.homeLayout];
      newSections[index].data = { ...newSections[index].data, ...newData };
      updateHomeLayout(newSections);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
      const newSections = [...settings.homeLayout];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex >= 0 && targetIndex < newSections.length) {
          const temp = newSections[index];
          newSections[index] = newSections[targetIndex];
          newSections[targetIndex] = temp;
          updateHomeLayout(newSections);
      }
  };

  const handleToggle = (index: number) => {
      const newSections = [...settings.homeLayout];
      newSections[index].isVisible = !newSections[index].isVisible;
      updateHomeLayout(newSections);
  };

  const handleDelete = (index: number) => {
      if(window.confirm("Remove this section?")) {
          const newSections = settings.homeLayout.filter((_, i) => i !== index);
          updateHomeLayout(newSections);
      }
  };

  const handleEventSubmit = async (eventData: Partial<Event>) => {
    await db.addEvent({
      id: Math.random().toString(36).substr(2, 9),
      title: eventData.title!,
      description: eventData.description!,
      date: eventData.date!,
      time: eventData.time!,
      location: eventData.location!,
      price: eventData.price!,
      imageUrl: eventData.imageUrl || 'https://images.unsplash.com/photo-1514525253440-b393452e8d26?auto=format&fit=crop&q=80&w=800',
      category: eventData.category!,
      organizerId: 'admin1',
      status: 'approved',
      isFeatured: eventData.isFeatured || false
    } as Event);
    window.location.reload();
  };

  const visibleSections = isEditing 
      ? settings.homeLayout 
      : settings.homeLayout.filter(s => s.isVisible);

  return (
    <div className="space-y-12 pb-20 relative">
      {visibleSections.map((section, index) => {
          const props = {
              key: section.id,
              id: section.id,
              isActive: section.isVisible,
              isEditing,
              settings,
              sectionData: section.data,
              onUpdate: (data: any) => handleUpdateSectionData(index, data),
              onMove: (dir: 'up'|'down') => handleMove(index, dir),
              onToggle: () => handleToggle(index),
              onDelete: () => handleDelete(index),
              onQuickAdd: () => setIsEventModalOpen(true)
          };

          switch(section.type) {
              case 'hero': return <HeroSection {...props} />;
              case 'categories': return <CategoriesSection {...props} />;
              case 'featured': return <FeaturedEventsSection {...props} />;
              case 'banner': return <BannerSection {...props} />;
              default: return null;
          }
      })}

      {/* Local "Add Section" logic removed. Using SectionBuilder from PageWrapper for all pages. */}

      <EventFormModal
          isOpen={isEventModalOpen}
          onClose={() => setIsEventModalOpen(false)}
          onSubmit={handleEventSubmit}
          userRole={UserRole.ADMIN}
      />
    </div>
  );
};

export default Home;

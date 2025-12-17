
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../services/database';
import { Event } from '../types';
import { Calendar, MapPin, Clock, ArrowRight, Sparkles, Car, Briefcase, XCircle, ArrowUp, ArrowDown, Plus, Trash2, EyeOff, Eye, Edit2 } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import Editable from '../components/Editable';

// --- Sub-Components for Sections ---

const HeroSection = ({ id, isActive, onMove, onDelete, onToggle, isEditing, settings }: any) => {
  const [currentImage, setCurrentImage] = useState(0);
  useEffect(() => {
    if (settings.heroImages.length === 0) return;
    const timer = setInterval(() => setCurrentImage((prev) => (prev + 1) % settings.heroImages.length), 5000);
    return () => clearInterval(timer);
  }, [settings.heroImages]);

  return (
      <section className={`relative rounded-3xl overflow-hidden shadow-2xl h-[500px] group transition-all ${isEditing ? 'border-2 border-blue-400 border-dashed m-2' : ''}`}>
        {/* Admin Controls Overlay */}
        {isEditing && (
            <div className="absolute top-4 left-4 z-50 flex gap-2">
                 <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold uppercase shadow">Hero Section</div>
                 <button onClick={() => onMove('up')} className="bg-white p-1 rounded hover:bg-gray-100"><ArrowUp size={14} className="text-gray-800" /></button>
                 <button onClick={() => onMove('down')} className="bg-white p-1 rounded hover:bg-gray-100"><ArrowDown size={14} className="text-gray-800" /></button>
                 <button onClick={onToggle} className="bg-white p-1 rounded hover:bg-gray-100">{isActive ? <Eye size={14} className="text-green-600"/> : <EyeOff size={14} className="text-gray-400"/>}</button>
                 <button onClick={onDelete} className="bg-red-500 p-1 rounded hover:bg-red-600"><Trash2 size={14} className="text-white" /></button>
            </div>
        )}

        <div className={`absolute inset-0 bg-gray-900 ${!isActive && isEditing ? 'opacity-20' : ''}`}>
          {settings.heroImages.length > 0 ? (
            settings.heroImages.map((img: string, index: number) => (
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
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight drop-shadow-lg flex flex-col md:block gap-2">
            <Editable id={`hero-title-${id}`} defaultContent="Experience the Soul of" className="inline-block mr-2" />
            <span className="text-dahab-gold">
               <Editable id={`hero-title-h-${id}`} defaultContent={settings.appName.split(' ')[0]} />
            </span>
          </h1>
          <div className="text-gray-100 text-lg md:text-xl max-w-2xl mb-8 drop-shadow-md font-medium">
             <Editable id={`hero-sub-${id}`} defaultContent="The ultimate social hub. Discover events, book reliable drivers, and connect with the community." />
          </div>
          <div className="flex gap-4 flex-wrap">
            <Link to="/events" className="bg-dahab-teal text-white px-8 py-3 rounded-full font-semibold hover:bg-teal-700 transition shadow-lg hover:shadow-dahab-teal/50">
              <Editable id={`hero-btn-1-${id}`} defaultContent="Find Events" />
            </Link>
            <Link to="/services" className="bg-white/10 backdrop-blur-md text-white border border-white/50 px-8 py-3 rounded-full font-semibold hover:bg-white/20 transition shadow-lg">
              <Editable id={`hero-btn-2-${id}`} defaultContent="Book a Driver" />
            </Link>
          </div>
        </div>
      </section>
  );
};

// Modal for editing individual category cards
const CategoryEditModal = ({ category, onSave, onClose }: { category: any, onSave: (data: any) => void, onClose: () => void }) => {
  const [formData, setFormData] = useState(category);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
       <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
       <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95">
          <h3 className="font-bold text-lg mb-4 text-gray-900">Edit Category Card</h3>
          <div className="space-y-4">
             <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Title</label>
                <input 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-900 focus:ring-2 focus:ring-dahab-teal/50 outline-none" 
                  placeholder="e.g. Events"
                />
             </div>
             <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Icon (Emoji)</label>
                <input 
                  value={formData.icon} 
                  onChange={e => setFormData({...formData, icon: e.target.value})} 
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-900 focus:ring-2 focus:ring-dahab-teal/50 outline-none" 
                  placeholder="e.g. 🎉"
                />
             </div>
             <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Destination Link</label>
                <input 
                  value={formData.link} 
                  onChange={e => setFormData({...formData, link: e.target.value})} 
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-900 focus:ring-2 focus:ring-dahab-teal/50 outline-none" 
                  placeholder="e.g. /events"
                />
                 <p className="text-[10px] text-gray-400 mt-1">Internal paths: /events, /services, /community, /more</p>
             </div>
          </div>
          <div className="flex gap-2 mt-6">
             <button onClick={onClose} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200">Cancel</button>
             <button onClick={() => onSave(formData)} className="flex-1 py-2.5 bg-dahab-teal text-white rounded-xl font-bold hover:bg-teal-700">Save Changes</button>
          </div>
       </div>
    </div>
  );
};

const DEFAULT_CATEGORIES = [
  { title: 'Events & Parties', icon: '🎉', link: '/events', color: 'bg-purple-100 text-purple-600' },
  { title: 'Drivers & Services', icon: '🚕', link: '/services', color: 'bg-yellow-100 text-yellow-600' },
  { title: 'Community Hub', icon: '👥', link: '/community', color: 'bg-blue-100 text-blue-600' },
  { title: 'More & Guide', icon: '🗺️', link: '/more', color: 'bg-teal-100 text-teal-600' },
];

const CategoriesSection = ({ id, isActive, onMove, onDelete, onToggle, isEditing, settings, sectionData, onUpdate }: any) => {
    const [editingCategoryIndex, setEditingCategoryIndex] = useState<number | null>(null);
    
    // Use stored categories or default
    const categories = sectionData?.categories || DEFAULT_CATEGORIES;

    const handleSaveCategory = (index: number, newCategory: any) => {
        const newCategories = [...categories];
        newCategories[index] = newCategory;
        onUpdate({ categories: newCategories });
        setEditingCategoryIndex(null);
    };

    return (
      <section className={`relative transition-all ${isEditing ? 'border-2 border-blue-400 border-dashed p-4 rounded-xl m-2' : ''} ${!isActive && isEditing ? 'opacity-40 grayscale' : ''}`}>
        {isEditing && (
            <div className="absolute top-0 right-0 z-50 flex gap-2 -mt-3 mr-4">
                 <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold uppercase shadow">Categories</div>
                 <button onClick={() => onMove('up')} className="bg-white p-1 rounded hover:bg-gray-100 border border-gray-200"><ArrowUp size={14} className="text-gray-800" /></button>
                 <button onClick={() => onMove('down')} className="bg-white p-1 rounded hover:bg-gray-100 border border-gray-200"><ArrowDown size={14} className="text-gray-800" /></button>
                 <button onClick={onToggle} className="bg-white p-1 rounded hover:bg-gray-100 border border-gray-200">{isActive ? <Eye size={14} className="text-green-600"/> : <EyeOff size={14} className="text-gray-400"/>}</button>
                 <button onClick={onDelete} className="bg-red-500 p-1 rounded hover:bg-red-600 border border-red-600"><Trash2 size={14} className="text-white" /></button>
            </div>
        )}
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold">
            <Editable id={`cat-title-${id}`} defaultContent={`Explore ${settings.appName.split(' ')[0]}`} />
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat: any, idx: number) => (
             <div key={idx} className="relative group">
                <Link to={cat.link} className={`block p-6 rounded-2xl ${cat.color} hover:opacity-90 transition flex flex-col items-center justify-center gap-3 text-center h-40 group-hover:scale-[1.02] transform duration-300`}>
                  <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{cat.icon}</span>
                  <span className="font-bold">{cat.title}</span>
                </Link>
                
                {isEditing && (
                    <button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingCategoryIndex(idx); }}
                        className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md z-10 hover:bg-gray-100 text-gray-700 hover:text-dahab-teal"
                        title="Edit Category"
                    >
                        <Edit2 size={14} />
                    </button>
                )}
            </div>
          ))}
        </div>

        {/* Edit Modal */}
        {editingCategoryIndex !== null && (
            <CategoryEditModal 
                category={categories[editingCategoryIndex]} 
                onSave={(data) => handleSaveCategory(editingCategoryIndex, data)}
                onClose={() => setEditingCategoryIndex(null)}
            />
        )}
      </section>
    );
};

const FeaturedEventsSection = ({ id, isActive, onMove, onDelete, onToggle, isEditing }: any) => {
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

    const handleRemoveFeatured = async (e: React.MouseEvent, eventId: string) => {
        e.preventDefault();
        if(window.confirm('Remove this event from Featured list?')) {
            await db.toggleFeaturedEvent(eventId, false);
            // Refresh
            const data = await db.getPublicEvents();
            setFeaturedEvents(data.filter(ev => ev.isFeatured));
        }
    };

    return (
      <section className={`relative transition-all ${isEditing ? 'border-2 border-blue-400 border-dashed p-4 rounded-xl m-2' : ''} ${!isActive && isEditing ? 'opacity-40 grayscale' : ''}`}>
         {isEditing && (
            <div className="absolute top-0 right-0 z-50 flex gap-2 -mt-3 mr-4">
                 <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold uppercase shadow">Featured Events</div>
                 <button onClick={() => onMove('up')} className="bg-white p-1 rounded hover:bg-gray-100 border border-gray-200"><ArrowUp size={14} className="text-gray-800" /></button>
                 <button onClick={() => onMove('down')} className="bg-white p-1 rounded hover:bg-gray-100 border border-gray-200"><ArrowDown size={14} className="text-gray-800" /></button>
                 <button onClick={onToggle} className="bg-white p-1 rounded hover:bg-gray-100 border border-gray-200">{isActive ? <Eye size={14} className="text-green-600"/> : <EyeOff size={14} className="text-gray-400"/>}</button>
                 <button onClick={onDelete} className="bg-red-500 p-1 rounded hover:bg-red-600 border border-red-600"><Trash2 size={14} className="text-white" /></button>
            </div>
        )}
        
        <div className="flex justify-between items-end mb-6">
          <div>
             <h2 className="text-2xl font-bold flex items-center gap-2">
               <Sparkles className="text-dahab-gold" fill="currentColor" size={24} />
               <Editable id={`feat-title-${id}`} defaultContent="Featured Events" />
             </h2>
             <div className="opacity-80 text-sm mt-1">
                <Editable id={`feat-sub-${id}`} defaultContent="Don't miss out on these popular activities" />
             </div>
          </div>
          <Link to="/events" className="text-dahab-teal font-bold flex items-center gap-1 hover:underline text-sm bg-teal-50 px-3 py-1 rounded-full">
            View All <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {[1,2,3].map(i => <div key={i} className="h-80 bg-gray-100 rounded-2xl animate-pulse"></div>)}
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.map(event => (
              <div key={event.id} className="relative group h-full">
                {isEditing && (
                  <button onClick={(e) => handleRemoveFeatured(e, event.id)} className="absolute -top-3 -right-3 z-30 bg-red-500 text-white p-2 rounded-full shadow-lg hover:scale-110 transition" title="Remove from Featured">
                    <XCircle size={20} />
                  </button>
                )}
                <Link to={`/book/event/${event.id}`} className="block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition border border-gray-100 h-full flex flex-col">
                  <div className="relative h-48 overflow-hidden">
                    <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-700"/>
                    <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-black/50 to-transparent opacity-60"></div>
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-gray-800 shadow-sm border border-white/20">
                      {event.category}
                    </div>
                    <div className="absolute bottom-4 right-4 bg-dahab-teal/90 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm font-bold shadow-lg border border-white/20">
                      {event.price} EGP
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-xl text-gray-900 mb-3 line-clamp-1 group-hover:text-dahab-teal transition-colors">{event.title}</h3>
                    <div className="space-y-3 text-sm text-gray-500 mb-4 flex-1">
                      <div className="flex items-center gap-3"><Calendar size={16} className="text-orange-500"/><span>{event.date}</span></div>
                      <div className="flex items-center gap-3"><Clock size={16} className="text-blue-500"/><span>{event.time}</span></div>
                      <div className="flex items-center gap-3"><MapPin size={16} className="text-green-500"/><span className="truncate">{event.location}</span></div>
                    </div>
                    <div className="pt-4 border-t border-gray-100 mt-auto flex items-center justify-between text-dahab-teal font-bold group-hover:translate-x-1 transition-transform">
                      <span>Book Now</span>
                      <ArrowRight size={18} />
                    </div>
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
    return (
      <section className={`bg-gray-900 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 text-white relative overflow-hidden transition-all ${isEditing ? 'border-2 border-blue-400 border-dashed m-2' : ''} ${!isActive && isEditing ? 'opacity-40 grayscale' : ''}`}>
        {isEditing && (
            <div className="absolute top-4 left-4 z-50 flex gap-2">
                 <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold uppercase shadow">Banner</div>
                 <button onClick={() => onMove('up')} className="bg-white p-1 rounded hover:bg-gray-100 border border-gray-200"><ArrowUp size={14} className="text-gray-800" /></button>
                 <button onClick={() => onMove('down')} className="bg-white p-1 rounded hover:bg-gray-100 border border-gray-200"><ArrowDown size={14} className="text-gray-800" /></button>
                 <button onClick={onToggle} className="bg-white p-1 rounded hover:bg-gray-100 border border-gray-200">{isActive ? <Eye size={14} className="text-green-600"/> : <EyeOff size={14} className="text-gray-400"/>}</button>
                 <button onClick={onDelete} className="bg-red-500 p-1 rounded hover:bg-red-600 border border-red-600"><Trash2 size={14} className="text-white" /></button>
            </div>
        )}
        
        <div className="absolute top-0 right-0 w-64 h-64 bg-dahab-teal rounded-full blur-[100px] opacity-20 translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="space-y-4 relative z-10">
          <h2 className="text-3xl font-bold">
            <Editable id={`banner-title-${id}`} defaultContent={`Drive with ${settings.appName}`} />
          </h2>
          <div className="text-gray-400 max-w-md">
            <Editable id={`banner-desc-${id}`} defaultContent="Are you a local driver or service provider? Join our verified network and grow your business today." />
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto relative z-10">
           <div className="flex flex-col gap-2 w-full md:w-auto">
             <Link to="/login?role=provider" className="bg-dahab-gold text-black px-8 py-3 rounded-full font-bold hover:bg-yellow-400 transition text-center shadow-lg hover:shadow-yellow-500/20 flex items-center justify-center gap-2">
               <Car size={20} /> <Editable id={`banner-btn-1-${id}`} defaultContent="Register as Driver" />
             </Link>
             <Link to="/login?role=provider" className="bg-gray-800 text-white border border-gray-700 px-8 py-3 rounded-full font-bold hover:bg-gray-700 transition text-center shadow-lg flex items-center justify-center gap-2">
               <Briefcase size={20} /> <Editable id={`banner-btn-2-${id}`} defaultContent="List a Service" />
             </Link>
             <span className="text-xs text-gray-500 text-center mt-1">Requires admin verification</span>
           </div>
        </div>
      </section>
    );
};

// ------------------------------------

const Home: React.FC = () => {
  const { settings, isEditing, updateHomeLayout } = useSettings();

  // Helper function to update sections
  const updateSections = (newSections: any[]) => {
      // Sort by order before saving just to be safe, though map renders based on array index mostly
      newSections.forEach((s, i) => s.order = i + 1);
      updateHomeLayout(newSections);
  };
  
  // Update data for a specific section
  const handleUpdateSectionData = (index: number, newData: any) => {
      const newSections = [...settings.homeLayout];
      // Merge existing data with new data
      newSections[index].data = { ...newSections[index].data, ...newData };
      updateSections(newSections);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
      const newSections = [...settings.homeLayout];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      
      if (targetIndex >= 0 && targetIndex < newSections.length) {
          const temp = newSections[index];
          newSections[index] = newSections[targetIndex];
          newSections[targetIndex] = temp;
          updateSections(newSections);
      }
  };

  const handleToggle = (index: number) => {
      const newSections = [...settings.homeLayout];
      newSections[index].isVisible = !newSections[index].isVisible;
      updateSections(newSections);
  };

  const handleDelete = (index: number) => {
      if(window.confirm("Remove this section?")) {
          const newSections = settings.homeLayout.filter((_, i) => i !== index);
          updateSections(newSections);
      }
  };

  const handleAddSection = (type: string) => {
      const newSection = {
          id: Math.random().toString(36).substr(2, 5),
          type: type as any,
          order: settings.homeLayout.length + 1,
          isVisible: true,
          data: {} // Initialize data
      };
      updateSections([...settings.homeLayout, newSection]);
  };

  // Filter sections: if not editing, only show visible. If editing, show all.
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
              onDelete: () => handleDelete(index)
          };

          switch(section.type) {
              case 'hero': return <HeroSection {...props} />;
              case 'categories': return <CategoriesSection {...props} />;
              case 'featured': return <FeaturedEventsSection {...props} />;
              case 'banner': return <BannerSection {...props} />;
              default: return null;
          }
      })}

      {isEditing && (
          <div className="border-2 border-dashed border-gray-300 rounded-3xl p-8 flex flex-col items-center justify-center gap-4 bg-gray-50/50">
              <p className="font-bold text-gray-500">Add New Section</p>
              <div className="flex flex-wrap gap-2 justify-center">
                  <button onClick={() => handleAddSection('hero')} className="px-4 py-2 bg-white border border-gray-200 shadow-sm rounded-lg hover:bg-gray-50 font-medium text-sm">+ Hero</button>
                  <button onClick={() => handleAddSection('categories')} className="px-4 py-2 bg-white border border-gray-200 shadow-sm rounded-lg hover:bg-gray-50 font-medium text-sm">+ Categories</button>
                  <button onClick={() => handleAddSection('featured')} className="px-4 py-2 bg-white border border-gray-200 shadow-sm rounded-lg hover:bg-gray-50 font-medium text-sm">+ Featured Events</button>
                  <button onClick={() => handleAddSection('banner')} className="px-4 py-2 bg-white border border-gray-200 shadow-sm rounded-lg hover:bg-gray-50 font-medium text-sm">+ Banner</button>
              </div>
          </div>
      )}
    </div>
  );
};

export default Home;

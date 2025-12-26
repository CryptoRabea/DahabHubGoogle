
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Anchor, Heart, Mountain, Utensils, Home as HomeIcon, MoreHorizontal, ArrowRight, Plus, Trash2, Settings, X, Globe } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import Editable from '../components/Editable';

interface CategoryCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  link: string;
  color: string;
  comingSoon?: boolean;
}

const ICON_MAP: Record<string, any> = {
  'Anchor': Anchor,
  'Heart': Heart,
  'Mountain': Mountain,
  'Utensils': Utensils,
  'HomeIcon': HomeIcon,
  'MoreHorizontal': MoreHorizontal
};

const More: React.FC = () => {
  const { isEditing, language, settings, updateContent, t } = useSettings();
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [activeList, setActiveList] = useState<'activities' | 'guide'>('activities');

  // Persistence keys
  const activitiesKey = `more_activities_${language}`;
  const guideKey = `more_guide_${language}`;

  const [activities, setActivities] = useState<CategoryCard[]>([]);
  const [guide, setGuide] = useState<CategoryCard[]>([]);

  useEffect(() => {
    const savedActivities = settings.contentOverrides[activitiesKey];
    const savedGuide = settings.contentOverrides[guideKey];

    if (savedActivities) setActivities(JSON.parse(savedActivities));
    else setActivities([
      { id: '1', title: 'Diving', icon: 'Anchor', link: '/events?category=Diving', description: 'Explore the Red Sea depths', color: 'bg-blue-100 text-blue-600' },
      { id: '2', title: 'Wellness', icon: 'Heart', link: '/events?category=Wellness', description: 'Yoga, meditation & spas', color: 'bg-rose-100 text-rose-600' },
      { id: '3', title: 'Hiking', icon: 'Mountain', link: '/events?category=Hike', description: 'Canyons & mountain trails', color: 'bg-orange-100 text-orange-600' },
    ]);

    if (savedGuide) setGuide(JSON.parse(savedGuide));
    else setGuide([
      { id: '4', title: 'Accommodation', icon: 'HomeIcon', link: '#', description: 'Hotels, camps & apartments', color: 'bg-purple-100 text-purple-600', comingSoon: true },
      { id: '5', title: 'Food & Dining', icon: 'Utensils', link: '#', description: 'Best restaurants in town', color: 'bg-green-100 text-green-600', comingSoon: true },
      { id: '6', title: 'Misc Services', icon: 'MoreHorizontal', link: '#', description: 'Laundry, Sim cards & more', color: 'bg-gray-100 text-gray-600', comingSoon: true },
    ]);
  }, [settings.contentOverrides, language]);

  const saveList = async (type: 'activities' | 'guide', newList: CategoryCard[]) => {
    const key = type === 'activities' ? activitiesKey : guideKey;
    if (type === 'activities') setActivities(newList);
    else setGuide(newList);
    await updateContent(key, JSON.stringify(newList));
  };

  const handleAdd = (type: 'activities' | 'guide') => {
    const newList = [...(type === 'activities' ? activities : guide), {
        id: Math.random().toString(36).substr(2, 5),
        title: 'New Item',
        description: 'New Description',
        icon: 'MoreHorizontal',
        link: '#',
        color: 'bg-gray-100 text-gray-600'
    }];
    saveList(type, newList);
  };

  const handleUpdate = (type: 'activities' | 'guide', idx: number, updates: Partial<CategoryCard>) => {
    const list = type === 'activities' ? [...activities] : [...guide];
    list[idx] = { ...list[idx], ...updates };
    saveList(type, list);
  };

  const handleDelete = (type: 'activities' | 'guide', idx: number) => {
    if(window.confirm("Delete this card?")) {
        const list = type === 'activities' ? [...activities] : [...guide];
        list.splice(idx, 1);
        saveList(type, list);
    }
  };

  const CardComponent: React.FC<{ cat: CategoryCard, idx: number, type: 'activities' | 'guide' }> = ({ cat, idx, type }) => {
    const IconComponent = ICON_MAP[cat.icon] || MoreHorizontal;
    const content = (
      <div className={`relative bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 group transition-all ${cat.comingSoon ? 'opacity-75' : 'hover:shadow-md'} ${isEditing ? 'border-dahab-teal border-dashed' : ''}`}>
        <div className={`p-4 rounded-xl ${cat.color} group-hover:scale-110 transition-transform`}>
          <IconComponent size={24} />
        </div>
        <div className="flex-1 text-start">
          <h3 className="font-bold text-gray-900">{cat.title}</h3>
          <p className="text-xs text-gray-500">{cat.description}</p>
        </div>
        {cat.comingSoon ? (
            <span className="absolute top-2 right-2 bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
              COMING SOON
            </span>
        ) : (
            <ArrowRight size={18} className={`text-gray-300 group-hover:text-dahab-teal ${language === 'ar' ? 'rotate-180' : ''}`} />
        )}

        {isEditing && (
            <div className="absolute -top-3 -left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <button onClick={() => { setActiveList(type); setEditingIdx(idx); }} className="bg-dahab-gold p-1.5 rounded-full shadow"><Settings size={12} /></button>
                <button onClick={() => handleDelete(type, idx)} className="bg-red-500 text-white p-1.5 rounded-full shadow"><Trash2 size={12}/></button>
            </div>
        )}
      </div>
    );

    return cat.comingSoon || isEditing ? content : <Link key={cat.id} to={cat.link}>{content}</Link>;
  };

  return (
    <div className="space-y-8 pb-20">
      <div className={`bg-dahab-teal text-white p-8 rounded-3xl shadow-lg relative overflow-hidden transition-all ${isEditing ? 'ring-4 ring-dahab-teal/20 border-2 border-white border-dashed' : ''}`}>
         <div className="relative z-10 text-start">
          <h1 className="text-3xl font-bold mb-2">
            <Editable id={`more-hero-title-${language}`} defaultContent={language === 'ar' ? 'استكشف المزيد' : 'Explore More'} />
          </h1>
          <div className="opacity-90">
            <Editable id={`more-hero-sub-${language}`} defaultContent={language === 'ar' ? 'اعثر على أنشطة متخصصة، وأدلة محلية، وكل ما تقدمه دهب.' : 'Find specialized activities, local guides, and everything else Dahab offers.'} />
          </div>
         </div>
         <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
      </div>

      <section>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
                <Editable id={`more-sec1-title-${language}`} defaultContent={language === 'ar' ? 'الأنشطة والفعاليات' : 'Activities & Events'} />
            </h2>
            {isEditing && (
                <button onClick={() => handleAdd('activities')} className="text-xs bg-dahab-teal text-white px-3 py-1 rounded-full font-bold flex items-center gap-1">
                    <Plus size={14} /> Add Card
                </button>
            )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {activities.map((cat, idx) => (
             <CardComponent key={cat.id} cat={cat} idx={idx} type="activities" />
          ))}
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
                <Editable id={`more-sec2-title-${language}`} defaultContent={language === 'ar' ? 'دليل دهب' : 'Dahab Guide'} />
            </h2>
            {isEditing && (
                <button onClick={() => handleAdd('guide')} className="text-xs bg-dahab-teal text-white px-3 py-1 rounded-full font-bold flex items-center gap-1">
                    <Plus size={14} /> Add Card
                </button>
            )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {guide.map((cat, idx) => (
            <CardComponent key={cat.id} cat={cat} idx={idx} type="guide" />
          ))}
        </div>
      </section>

      {/* Card Editor Modal */}
      {editingIdx !== null && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm" onClick={() => setEditingIdx(null)}></div>
            <div className="relative bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 overflow-hidden text-gray-900">
                <h3 className="font-bold text-xl mb-6">Edit Category Card</h3>
                <div className="space-y-4 text-start">
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Title</label>
                        <input 
                          type="text" 
                          value={(activeList === 'activities' ? activities : guide)[editingIdx].title}
                          onChange={(e) => handleUpdate(activeList, editingIdx, { title: e.target.value })}
                          className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-dahab-teal/30"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Description</label>
                        <input 
                          type="text" 
                          value={(activeList === 'activities' ? activities : guide)[editingIdx].description}
                          onChange={(e) => handleUpdate(activeList, editingIdx, { description: e.target.value })}
                          className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-dahab-teal/30"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Icon</label>
                            <select 
                                value={(activeList === 'activities' ? activities : guide)[editingIdx].icon}
                                onChange={(e) => handleUpdate(activeList, editingIdx, { icon: e.target.value })}
                                className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 bg-white text-gray-900"
                            >
                                {Object.keys(ICON_MAP).map(k => <option key={k} value={k}>{k}</option>)}
                            </select>
                         </div>
                         <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Color</label>
                            <input 
                                type="text" 
                                value={(activeList === 'activities' ? activities : guide)[editingIdx].color}
                                onChange={(e) => handleUpdate(activeList, editingIdx, { color: e.target.value })}
                                className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 bg-white text-gray-900 text-xs font-mono outline-none focus:ring-2 focus:ring-dahab-teal/30"
                                placeholder="bg-blue-100 text-blue-600"
                            />
                         </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Link (URL/Path)</label>
                        <input 
                          type="text" 
                          value={(activeList === 'activities' ? activities : guide)[editingIdx].link}
                          onChange={(e) => handleUpdate(activeList, editingIdx, { link: e.target.value })}
                          className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 bg-white text-gray-900 text-sm outline-none focus:ring-2 focus:ring-dahab-teal/30"
                        />
                    </div>
                    <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={(activeList === 'activities' ? activities : guide)[editingIdx].comingSoon}
                          onChange={(e) => handleUpdate(activeList, editingIdx, { comingSoon: e.target.checked })}
                          className="w-4 h-4 text-dahab-teal rounded"
                        />
                        <span className="text-sm font-bold text-gray-700">Display "Coming Soon" badge</span>
                    </label>
                </div>
                <button 
                  onClick={() => setEditingIdx(null)}
                  className="w-full bg-dahab-teal text-white py-4 rounded-2xl font-bold mt-8 shadow-lg hover:bg-teal-700 transition"
                >
                    Done
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default More;

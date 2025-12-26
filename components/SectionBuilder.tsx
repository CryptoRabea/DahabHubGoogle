
import React, { useState } from 'react';
import { 
  Plus, Image as ImageIcon, Type, Layout, Sparkles, Car, 
  Trash2, ArrowUp, ArrowDown, Eye, EyeOff, MousePointer2, 
  ArrowLeft, ArrowRight, Settings2, Link as LinkIcon, X, 
  Database, Briefcase, Calendar as CalendarIcon, Globe,
  Maximize2
} from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { HomeSection, CardItem, UserRole, Event } from '../types';
import Editable from './Editable';
import { Link } from 'react-router-dom';
import EventFormModal from './EventFormModal';
import { db } from '../services/database';

interface SectionBuilderProps {
  path: string;
  sections: HomeSection[];
  onUpdate: (newSections: HomeSection[]) => void;
}

const TextBox = ({ id, language }: { id: string, language: string }) => (
  <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 text-start space-y-4">
    <h3 className="text-2xl font-bold text-gray-900">
        <Editable id={`${id}-h-${language}`} defaultContent="Custom Section Title" />
    </h3>
    <div className="text-gray-600 leading-relaxed text-lg">
        <Editable id={`${id}-c-${language}`} defaultContent="Start typing your story or information here." />
    </div>
  </div>
);

const ImageBox = ({ id, language }: { id: string, language: string }) => (
  <div className="rounded-[2.5rem] overflow-hidden shadow-xl aspect-video border-4 border-white bg-slate-100">
      <Editable id={`${id}-img-${language}`} type="image" defaultContent="https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?q=80&w=1920&auto=format&fit=crop" className="w-full h-full object-cover" />
  </div>
);

const HeroManager = ({ settings, onUpdateSettings }: any) => {
    return (
        <div className="bg-slate-900 rounded-[3rem] p-8 text-white text-start space-y-8 relative overflow-hidden">
            <div className="relative z-10 flex justify-between items-center">
                <div>
                   <h3 className="text-2xl font-black uppercase tracking-tight">Hero Slide Manager</h3>
                   <p className="text-sm text-gray-400">Add or remove images from your main landing page slider.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => {
                        const url = prompt("Enter Image URL:");
                        if(url) onUpdateSettings({...settings, heroImages: [...settings.heroImages, url]});
                    }} className="bg-dahab-teal text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-teal-700 transition">
                        <Plus size={18}/> Add Slide
                    </button>
                </div>
            </div>
            
            <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4">
                {settings.heroImages.map((img: string, idx: number) => (
                    <div key={idx} className="relative aspect-video rounded-2xl overflow-hidden group shadow-2xl border-2 border-white/10">
                        <img src={img} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                            <button onClick={() => {
                                const newImages = settings.heroImages.filter((_:any, i:number) => i !== idx);
                                onUpdateSettings({...settings, heroImages: newImages});
                            }} className="bg-red-500 p-2 rounded-full text-white hover:scale-110 transition"><Trash2 size={16}/></button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-dahab-teal/10 rounded-full blur-3xl"></div>
        </div>
    );
};

const SectionBuilder: React.FC<SectionBuilderProps> = ({ path, sections, onUpdate }) => {
  const { isEditing, language, settings, updateNavigation, updateSettings } = useSettings();
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  if (!isEditing) return null;

  const handleAddSection = (type: HomeSection['type']) => {
    const newSection: HomeSection = {
        id: Math.random().toString(36).substr(2, 5),
        type,
        order: sections.length + 1,
        isVisible: true,
        data: {}
    };
    onUpdate([...sections, newSection]);
  };

  return (
    <div className="mt-20 space-y-12 mb-32 relative z-[50]">
      {/* Page Sections Listing */}
      {sections.map((section, idx) => (
        <div key={section.id} className={`relative transition-all border-l-8 border-dahab-teal/20 pl-6 ${section.isVisible ? '' : 'opacity-40 grayscale'}`}>
             <div className="absolute top-0 left-6 z-50 flex gap-2 -translate-y-1/2">
                 <div className="bg-slate-900 text-white px-4 py-2 rounded-2xl text-[10px] font-black uppercase shadow-2xl flex items-center gap-3 border border-white/10">
                    <div className="w-2 h-2 bg-dahab-teal rounded-full animate-pulse"></div>
                    {section.type} block
                 </div>
                 <div className="flex gap-1 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl shadow-2xl border border-gray-200">
                    <button onClick={() => {
                        const next = [...sections];
                        if(idx > 0) { [next[idx], next[idx-1]] = [next[idx-1], next[idx]]; onUpdate(next); }
                    }} className="p-2 rounded-xl hover:bg-gray-100 transition"><ArrowUp size={18}/></button>
                    <button onClick={() => {
                        const next = [...sections];
                        if(idx < next.length - 1) { [next[idx], next[idx+1]] = [next[idx+1], next[idx]]; onUpdate(next); }
                    }} className="p-2 rounded-xl hover:bg-gray-100 transition"><ArrowDown size={18}/></button>
                    <button onClick={() => {
                        const next = [...sections];
                        next[idx].isVisible = !next[idx].isVisible;
                        onUpdate(next);
                    }} className="p-2 rounded-xl hover:bg-gray-100 transition">
                      {section.isVisible ? <Eye size={18} className="text-dahab-teal"/> : <EyeOff size={18}/>}
                    </button>
                    <button onClick={() => {
                        if(window.confirm("Delete section?")) onUpdate(sections.filter((_, i) => i !== idx));
                    }} className="p-2 rounded-xl hover:bg-red-50 text-red-500 transition"><Trash2 size={18} /></button>
                 </div>
            </div>

            <div className="py-10">
                {section.type === 'text' && <TextBox id={section.id} language={language} />}
                {section.type === 'image-box' && <ImageBox id={section.id} language={language} />}
                {section.type === 'hero' && <HeroManager settings={settings} onUpdateSettings={updateSettings} />}
                {['card-grid', 'featured', 'banner', 'categories'].includes(section.type) && (
                   <div className="p-12 bg-white rounded-[3.5rem] border border-gray-100 flex flex-col items-center justify-center text-center gap-6 group shadow-xl">
                       <div className="w-20 h-20 bg-dahab-teal/10 rounded-[2rem] flex items-center justify-center text-dahab-teal group-hover:rotate-6 transition-all duration-500">
                          <Database size={40} />
                       </div>
                       <div className="space-y-2">
                          <h3 className="font-black text-2xl uppercase tracking-tighter text-gray-900">Functional {section.type} Active</h3>
                          <p className="text-sm text-gray-500 max-w-sm">This block is linked to your backend. Content is managed via the Admin Dashboard or Quick-Add buttons.</p>
                       </div>
                       <div className="flex gap-2">
                           <span className="px-4 py-1.5 bg-green-50 text-green-700 text-[10px] font-black rounded-full border border-green-100">LIVE CONNECTION</span>
                       </div>
                   </div>
                )}
            </div>
        </div>
      ))}

      {/* COMPACT MASTER BUILDER */}
      <div className="relative px-6 max-w-5xl mx-auto">
        <div className="bg-white rounded-[3.5rem] p-8 border-2 border-dahab-teal/20 flex flex-col items-center gap-10 shadow-2xl border-dashed">
            
            {/* Global Actions - REMOVED PROVIDER REGISTER AS REQUESTED */}
            <div className="w-full">
                <div className="flex justify-between items-center mb-6 px-4">
                  <div className="flex items-center gap-2 text-xs font-black text-dahab-teal uppercase tracking-widest">
                      <Database size={16} /> Global Actions
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button 
                        onClick={() => setIsEventModalOpen(true)}
                        className="bg-dahab-teal text-white p-5 rounded-[2rem] font-bold flex items-center gap-4 hover:scale-[1.02] transition shadow-xl shadow-teal-500/20 group"
                    >
                        <CalendarIcon size={24} />
                        <div className="text-left">
                            <span className="block text-lg">Add New Event</span>
                            <span className="text-[10px] opacity-70 uppercase tracking-widest font-black">Syncs to Database</span>
                        </div>
                    </button>

                    <button 
                        className="bg-slate-900 text-white p-5 rounded-[2rem] font-bold flex items-center gap-4 hover:scale-[1.02] transition shadow-xl shadow-black/20 group"
                        onClick={async () => {
                            const id = Math.random().toString(36).substr(2, 5);
                            await updateNavigation([...settings.navigation, { id: `n-${id}`, label: 'New Page', path: `/p/${id}`, icon: 'Globe', order: 99, isVisible: true }]);
                            alert("Page added!");
                        }}
                    >
                        <Globe size={24} />
                        <div className="text-left">
                            <span className="block text-lg">Add New Tab</span>
                            <span className="text-[10px] opacity-70 uppercase tracking-widest font-black">Navigation Store</span>
                        </div>
                    </button>
                </div>
            </div>

            <div className="w-full h-px bg-gray-100"></div>

            {/* Layout Architect */}
            <div className="w-full space-y-6">
                <div className="flex items-center gap-2 text-xs font-black text-dahab-teal uppercase tracking-widest px-4">
                    <Layout size={16} /> Layout Architect
                </div>
                <div className="flex flex-wrap gap-4 justify-center">
                    {[
                      { type: 'hero', label: 'Slider', icon: ImageIcon, color: 'bg-orange-500' },
                      { type: 'text', label: 'Rich Text', icon: Type, color: 'bg-dahab-teal' },
                      { type: 'image-box', label: 'Image', icon: ImageIcon, color: 'bg-rose-500' },
                      { type: 'card-grid', label: 'Grid', icon: Layout, color: 'bg-emerald-500' },
                      { type: 'featured', label: 'Events', icon: Sparkles, color: 'bg-purple-500' },
                      { type: 'categories', label: 'QuickTabs', icon: Layout, color: 'bg-indigo-500' },
                      { type: 'banner', label: 'Banner', icon: Car, color: 'bg-red-500' }
                    ].map((tool) => (
                      <button 
                        key={tool.type}
                        onClick={() => handleAddSection(tool.type as any)}
                        className="flex flex-col items-center gap-3 p-4 transition-all hover:-translate-y-2 group"
                      >
                        <div className={`w-14 h-14 ${tool.color} text-white rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform`}>
                            <tool.icon size={24} />
                        </div>
                        <span className="font-black text-gray-900 text-[9px] uppercase tracking-widest">{tool.label}</span>
                      </button>
                    ))}
                </div>
            </div>
            
            <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.4em]">Engine 3.1 • CMS Direct</p>
        </div>
      </div>

      <EventFormModal 
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onSubmit={async (data) => {
            await db.addEvent({id: Math.random().toString(36).substr(2,9), ...data, status: 'approved'} as Event);
            alert("Event Added!");
            window.location.reload();
        }}
        userRole={UserRole.ADMIN}
      />
    </div>
  );
};

export default SectionBuilder;

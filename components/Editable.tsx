
import React, { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { Edit2, Image as ImageIcon, Check, X } from 'lucide-react';

interface EditableProps {
  id: string;
  defaultContent: string;
  type?: 'text' | 'image' | 'rich-text';
  className?: string;
  children?: React.ReactNode;
}

const Editable: React.FC<EditableProps> = ({ id, defaultContent, type = 'text', className = '', children }) => {
  const { isEditing, settings, updateContent } = useSettings();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempValue, setTempValue] = useState('');

  const currentValue = settings.contentOverrides?.[id] || defaultContent;

  if (!isEditing) {
    if (type === 'image') {
      return <img src={currentValue} className={className} alt="content" />;
    }
    return <span className={className}>{currentValue}</span>;
  }

  const handleEditClick = (e: React.MouseEvent) => {
    // CRITICAL: Prevent navigation or parent clicks
    e.preventDefault();
    e.stopPropagation();
    setTempValue(currentValue);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await updateContent(id, tempValue);
    setIsModalOpen(false);
  };

  return (
    <>
      <div 
        onClick={handleEditClick}
        className={`relative group cursor-pointer border-2 border-dashed border-dahab-teal hover:border-dahab-gold hover:bg-dahab-teal/10 rounded-lg transition-all p-1 ${className} ${type === 'image' ? 'inline-block' : ''}`}
      >
        {type === 'image' ? (
           <img src={currentValue} className={`w-full h-full object-cover opacity-80 ${className}`} alt="editable" />
        ) : (
           <span className="relative z-0">{currentValue}</span>
        )}
        
        <div className="absolute -top-3 -right-3 bg-dahab-gold text-black p-1.5 rounded-full shadow-lg z-10">
          {type === 'image' ? <ImageIcon size={12} /> : <Edit2 size={12} />}
        </div>
      </div>

      {/* STRICT FOCUS MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Opaque backdrop to block EVERYTHING else */}
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={(e) => { e.stopPropagation(); setIsModalOpen(false); }}></div>
          
          <div className="relative bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl border border-dahab-gold ring-4 ring-dahab-gold/20 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-xl text-gray-900">Editing Content</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
             </div>
             
             {type === 'text' ? (
               <textarea 
                 value={tempValue}
                 autoFocus
                 onChange={(e) => setTempValue(e.target.value)}
                 className="w-full border-2 border-gray-100 rounded-2xl p-4 h-40 focus:border-dahab-teal outline-none text-gray-900 text-lg leading-relaxed shadow-inner"
               />
             ) : (
               <div className="space-y-4">
                 <input 
                   type="text" 
                   value={tempValue}
                   autoFocus
                   onChange={(e) => setTempValue(e.target.value)}
                   className="w-full border-2 border-gray-100 rounded-2xl p-4 focus:border-dahab-teal outline-none text-gray-900 shadow-inner"
                   placeholder="Paste Image URL..."
                 />
                 <div className="h-48 bg-gray-50 rounded-2xl overflow-hidden border-2 border-gray-100 flex items-center justify-center">
                    {tempValue ? <img src={tempValue} className="h-full w-full object-contain p-2" /> : <span className="text-gray-400 italic">Preview will appear here</span>}
                 </div>
               </div>
             )}

             <div className="flex gap-4 mt-8">
               <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 rounded-2xl font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 transition">Cancel</button>
               <button onClick={handleSave} className="flex-1 py-4 rounded-2xl bg-dahab-teal text-white font-bold hover:bg-teal-700 shadow-lg shadow-teal-500/20 transition">Apply Change</button>
             </div>
             <p className="text-center text-[10px] text-gray-400 mt-4 uppercase tracking-widest font-bold">Secure Edit Mode Active</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Editable;

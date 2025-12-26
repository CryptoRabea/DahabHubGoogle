
import React, { useState, useRef } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { Edit2, Image as ImageIcon, Check, X, Upload } from 'lucide-react';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentValue = settings.contentOverrides?.[id] || defaultContent;

  if (!isEditing) {
    if (type === 'image') {
      return <img src={currentValue} className={className} alt="content" />;
    }
    return <span className={className}>{currentValue}</span>;
  }

  const handleEditClick = (e: React.MouseEvent) => {
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempValue(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <div 
        onClick={handleEditClick}
        className={`relative group cursor-pointer border-2 border-dashed border-dahab-teal hover:border-dahab-gold hover:bg-dahab-teal/10 rounded-lg transition-all p-1 ${className} ${type === 'image' ? 'inline-block' : ''}`}
      >
        {type === 'image' ? (
           <img src={currentValue} className={`max-h-full max-w-full object-contain opacity-80 ${className}`} alt="editable" />
        ) : (
           <span className="relative z-0">{currentValue}</span>
        )}
        
        <div className="absolute -top-3 -right-3 bg-dahab-gold text-black p-1.5 rounded-full shadow-lg z-10 scale-90 group-hover:scale-100 transition-transform">
          {type === 'image' ? <ImageIcon size={12} /> : <Edit2 size={12} />}
        </div>
      </div>

      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[999999] flex items-center justify-center p-4 overflow-hidden" 
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}
        >
          {/* Strictly Opaque and Centering Backdrop */}
          <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-xl" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative bg-white rounded-[3rem] p-6 md:p-10 w-full max-w-lg shadow-[0_0_120px_rgba(0,0,0,0.6)] border border-white/20 animate-in zoom-in-95 flex flex-col max-h-[90vh]">
             <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-dahab-teal text-white rounded-[1.5rem] shadow-lg">
                        {type === 'image' ? <ImageIcon size={28} /> : <Edit2 size={28} />}
                    </div>
                    <div className="text-start">
                        <h3 className="font-black text-2xl text-gray-900 tracking-tight">Content Architect</h3>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Live Database Link: {id}</p>
                    </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="bg-gray-100 p-3 rounded-full text-gray-400 hover:text-gray-600 transition hover:bg-gray-200">
                    <X size={24} />
                </button>
             </div>
             
             <div className="flex-1 overflow-y-auto space-y-8 text-start px-2">
               {type === 'text' ? (
                 <div className="space-y-3">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Raw Content Value</label>
                   <textarea 
                     value={tempValue}
                     autoFocus
                     onChange={(e) => setTempValue(e.target.value)}
                     className="w-full border-2 border-gray-100 rounded-[1.5rem] p-6 h-64 focus:border-dahab-teal focus:ring-4 focus:ring-dahab-teal/5 outline-none text-gray-900 text-lg leading-relaxed bg-slate-50 shadow-inner"
                   />
                 </div>
               ) : (
                 <>
                   <div className="space-y-4">
                      <div className="flex justify-between items-end px-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Asset Source</label>
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-2 text-dahab-teal font-extrabold text-sm hover:underline"
                        >
                          <Upload size={16} /> Device Upload
                        </button>
                      </div>
                      <input 
                        type="text" 
                        value={tempValue}
                        autoFocus
                        onChange={(e) => setTempValue(e.target.value)}
                        className="w-full border-2 border-gray-100 rounded-2xl p-4 focus:border-dahab-teal outline-none text-gray-900 font-mono text-xs bg-slate-50 shadow-inner"
                        placeholder="HTTPS URL or Base64 String..."
                      />
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleFileUpload}
                      />
                   </div>
                   <div className="aspect-video bg-slate-100 rounded-[2.5rem] overflow-hidden border-2 border-dashed border-gray-200 flex items-center justify-center relative group/preview shadow-inner">
                      {tempValue ? (
                        <img src={tempValue} className="h-full w-full object-contain" alt="preview" />
                      ) : (
                        <div className="text-gray-300 flex flex-col items-center gap-4">
                          <ImageIcon size={56} className="opacity-10" />
                          <span className="font-black text-xs uppercase tracking-widest">Awaiting Media</span>
                        </div>
                      )}
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-dahab-teal/40 backdrop-blur-md flex items-center justify-center opacity-0 group-hover/preview:opacity-100 transition-all cursor-pointer"
                      >
                         <div className="bg-white px-8 py-4 rounded-full font-black text-dahab-teal shadow-2xl flex items-center gap-2 uppercase text-xs tracking-widest">
                            <Upload size={20} /> Replace Asset
                         </div>
                      </div>
                   </div>
                 </>
               )}
             </div>

             <div className="flex gap-4 mt-12">
               <button onClick={() => setIsModalOpen(false)} className="flex-1 py-5 rounded-[1.5rem] font-black text-gray-500 bg-gray-100 hover:bg-gray-200 transition uppercase text-xs tracking-widest">Discard</button>
               <button onClick={handleSave} className="flex-[2] py-5 rounded-[1.5rem] bg-dahab-teal text-white font-black hover:bg-teal-700 shadow-2xl shadow-teal-500/40 transition transform active:scale-95 uppercase text-xs tracking-widest">Commit to DB</button>
             </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Editable;

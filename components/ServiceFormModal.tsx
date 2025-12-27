
import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Loader2, Type, Phone, Briefcase } from 'lucide-react';
import { ServiceProvider } from '../types';

interface ServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<ServiceProvider>) => Promise<void>;
  initialData?: ServiceProvider | null;
}

const SERVICE_TYPES = ['Driver', 'Cleaner', 'Guide', 'Maintenance', 'Food', 'Entertainment', 'Trips', 'Other'];

const ServiceFormModal: React.FC<ServiceFormModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<Partial<ServiceProvider>>({
    name: '',
    description: '',
    serviceType: 'Driver',
    phone: '',
    imageUrl: '',
    isVerified: true
  });
  
  // Custom type support
  const [isCustomType, setIsCustomType] = useState(false);
  const [customType, setCustomType] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      if (!SERVICE_TYPES.includes(initialData.serviceType)) {
          setIsCustomType(true);
          setCustomType(initialData.serviceType);
      } else {
          setIsCustomType(false);
          setCustomType('');
      }
    } else {
      setFormData({
        name: '',
        description: '',
        serviceType: 'Driver',
        phone: '',
        imageUrl: '',
        isVerified: true
      });
      setIsCustomType(false);
      setCustomType('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const finalData = {
        ...formData,
        serviceType: isCustomType ? customType : formData.serviceType
    };
    await onSubmit(finalData);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh] text-gray-900">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-lg text-gray-900">{initialData ? 'Edit Service' : 'Add New Service'}</h3>
          <button onClick={onClose} className="p-2 bg-white rounded-full text-gray-400 hover:text-gray-600 shadow-sm">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4">
          
          {/* Image Upload */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Service Image</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="h-40 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition relative overflow-hidden group"
            >
              {formData.imageUrl ? (
                <>
                  <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <span className="text-white font-bold text-sm">Change Image</span>
                  </div>
                </>
              ) : (
                <>
                  <Upload className="text-gray-400 mb-2" size={24} />
                  <span className="text-sm text-gray-500">Click to upload image</span>
                </>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-gray-700 mb-1 block">Service Name</label>
              <div className="relative">
                <Type className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-dahab-teal/50 outline-none bg-white text-gray-900"
                  placeholder="e.g. Ali's Taxi, Blue Hole Restaurant"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 mb-1 block">Category</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <select 
                    value={isCustomType ? 'custom' : formData.serviceType}
                    onChange={(e) => {
                        if (e.target.value === 'custom') {
                            setIsCustomType(true);
                        } else {
                            setIsCustomType(false);
                            setFormData({...formData, serviceType: e.target.value});
                        }
                    }}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-dahab-teal/50 outline-none bg-white text-gray-900 appearance-none"
                >
                    {SERVICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    <option value="custom">+ Custom Type</option>
                </select>
              </div>
              {isCustomType && (
                  <input 
                    type="text"
                    value={customType}
                    onChange={(e) => setCustomType(e.target.value)}
                    placeholder="Enter custom category..."
                    className="mt-2 w-full px-4 py-2 border border-dahab-teal rounded-xl text-dahab-teal font-bold focus:outline-none bg-teal-50"
                    autoFocus
                  />
              )}
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 mb-1 block">Contact Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="tel" 
                  required
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-dahab-teal/50 outline-none bg-white text-gray-900"
                  placeholder="+20 1xx xxxx xxx"
                />
              </div>
            </div>

            <div>
               <label className="text-sm font-bold text-gray-700 mb-1 block">Description</label>
               <textarea 
                 required
                 value={formData.description}
                 onChange={e => setFormData({...formData, description: e.target.value})}
                 className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-dahab-teal/50 outline-none h-24 resize-none bg-white text-gray-900"
                 placeholder="Describe the service..."
               />
            </div>
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-dahab-teal text-white py-3 rounded-xl font-bold hover:bg-teal-700 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : (initialData ? 'Update Service' : 'Add Service')}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ServiceFormModal;

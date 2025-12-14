import React, { useEffect, useState, useRef } from 'react';
import { db } from '../services/mockDatabase';
import { Booking, BookingStatus, Event, User, UserRole } from '../types';
import { Check, X, Plus, Image as ImageIcon, Trash2, Upload, Palette, Settings, UserCheck, ShieldAlert } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

const PRESET_BACKGROUNDS = [
  { name: 'Dahab Mesh', value: 'radial-gradient(at 0% 0%, hsla(172, 85%, 93%, 1) 0px, transparent 50%), radial-gradient(at 100% 0%, hsla(45, 90%, 96%, 1) 0px, transparent 50%), radial-gradient(at 100% 100%, hsla(200, 85%, 95%, 1) 0px, transparent 50%), radial-gradient(at 0% 100%, hsla(180, 80%, 94%, 1) 0px, transparent 50%)' },
  { name: 'Clean White', value: '#ffffff' },
  { name: 'Soft Gray', value: '#f3f4f6' },
  { name: 'Deep Ocean', value: 'linear-gradient(to bottom, #0f172a, #1e293b)' },
  { name: 'Sunset Glow', value: 'linear-gradient(120deg, #f6d365 0%, #fda085 100%)' }
];

const AdminDashboard: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pendingProviders, setPendingProviders] = useState<User[]>([]);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [activeTab, setActiveTab] = useState<'bookings' | 'events' | 'verifications' | 'settings'>('bookings');
  
  // Settings Hook
  const { settings, updateSettings } = useSettings();
  const [localSettings, setLocalSettings] = useState(settings);
  const [newHeroImage, setNewHeroImage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  // Update local settings when global settings change (initial load)
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const loadData = async () => {
    const b = await db.getBookings();
    setBookings(b);
    const p = await db.getPendingProviders();
    setPendingProviders(p);
  };

  const handleBookingAction = async (id: string, status: BookingStatus) => {
    await db.updateBookingStatus(id, status);
    loadData();
  };

  const handleProviderAction = async (userId: string, approve: boolean) => {
    if (approve) {
      await db.approveProvider(userId);
    } else {
      await db.rejectProvider(userId);
    }
    loadData();
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!newEventTitle) return;
    
    await db.addEvent({
      id: Math.random().toString(36),
      title: newEventTitle,
      description: 'Admin created event',
      date: '2024-12-01',
      time: '10:00 AM',
      location: 'Dahab',
      price: 100,
      imageUrl: 'https://picsum.photos/800/600',
      organizerId: 'admin1',
      category: 'Workshop'
    });
    setNewEventTitle('');
    alert('Event created!');
  };

  // --- Settings Handlers ---

  const handleSaveSettings = async () => {
    await updateSettings(localSettings);
    alert("Settings saved successfully!");
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalSettings(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddHeroImage = () => {
    if (newHeroImage) {
      setLocalSettings(prev => ({ ...prev, heroImages: [...prev.heroImages, newHeroImage] }));
      setNewHeroImage('');
    }
  };

  const handleRemoveHeroImage = (index: number) => {
    setLocalSettings(prev => ({
      ...prev,
      heroImages: prev.heroImages.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <button 
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${activeTab === 'bookings' ? 'bg-dahab-teal text-white' : 'bg-white'}`}
          >
            Bookings ({bookings.filter(b => b.status === BookingStatus.PENDING).length})
          </button>
           <button 
            onClick={() => setActiveTab('verifications')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap flex items-center gap-2 ${activeTab === 'verifications' ? 'bg-dahab-teal text-white' : 'bg-white'}`}
          >
            Verifications
            {pendingProviders.length > 0 && <span className="bg-red-500 text-white text-xs px-1.5 rounded-full">{pendingProviders.length}</span>}
          </button>
          <button 
            onClick={() => setActiveTab('events')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${activeTab === 'events' ? 'bg-dahab-teal text-white' : 'bg-white'}`}
          >
            Manage Events
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap flex items-center gap-2 ${activeTab === 'settings' ? 'bg-dahab-teal text-white' : 'bg-white'}`}
          >
            <Settings size={18} /> Design & Settings
          </button>
        </div>
      </div>

      {activeTab === 'bookings' && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Item</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Proof</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.length === 0 && (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-400">No bookings found</td></tr>
                )}
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="p-4 font-medium">{booking.userName}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${booking.itemType === 'event' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {booking.itemType.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">{booking.amount} EGP <br/><span className="text-xs text-gray-400">{booking.method}</span></td>
                    <td className="p-4 text-blue-600 text-sm underline cursor-pointer">View Receipt</td>
                    <td className="p-4 flex justify-end gap-2">
                      {booking.status === BookingStatus.PENDING ? (
                        <>
                          <button onClick={() => handleBookingAction(booking.id, BookingStatus.CONFIRMED)} className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200">
                            <Check size={18} />
                          </button>
                          <button onClick={() => handleBookingAction(booking.id, BookingStatus.REJECTED)} className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200">
                            <X size={18} />
                          </button>
                        </>
                      ) : (
                        <span className={`text-sm font-bold ${booking.status === BookingStatus.CONFIRMED ? 'text-green-600' : 'text-red-600'}`}>
                          {booking.status.toUpperCase()}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'verifications' && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex items-center gap-2">
            <UserCheck className="text-dahab-teal" />
            <h3 className="font-bold">Pending Provider Applications</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pendingProviders.length === 0 && (
                  <tr><td colSpan={4} className="p-8 text-center text-gray-400">No pending verifications</td></tr>
                )}
                {pendingProviders.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="p-4 font-bold">{user.name}</td>
                    <td className="p-4 text-gray-600">{user.email}</td>
                    <td className="p-4">
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-bold flex items-center w-fit gap-1">
                        <ShieldAlert size={12} /> Pending Review
                      </span>
                    </td>
                    <td className="p-4 flex justify-end gap-2">
                      <button 
                        onClick={() => handleProviderAction(user.id, true)}
                        className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 flex items-center gap-1"
                      >
                        <Check size={14} /> Approve
                      </button>
                      <button 
                        onClick={() => handleProviderAction(user.id, false)}
                        className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-300 flex items-center gap-1"
                      >
                        <X size={14} /> Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'events' && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold mb-4">Quick Add Event</h3>
          <form onSubmit={handleCreateEvent} className="flex gap-4">
            <input 
              type="text" 
              value={newEventTitle} 
              onChange={e => setNewEventTitle(e.target.value)}
              placeholder="Event Title..." 
              className="flex-1 border border-gray-300 rounded-xl px-4 py-2"
            />
            <button type="submit" className="bg-dahab-gold text-black font-bold px-6 py-2 rounded-xl flex items-center gap-2">
              <Plus size={18} /> Post
            </button>
          </form>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          
          {/* 1. Branding Section */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <ImageIcon size={20} className="text-dahab-teal" /> App Branding
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">App Name</label>
                <input 
                  type="text" 
                  value={localSettings.appName}
                  onChange={(e) => setLocalSettings(prev => ({...prev, appName: e.target.value}))}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Logo</label>
                <div className="flex items-center gap-4">
                  {localSettings.logoUrl ? (
                    <div className="w-16 h-16 border rounded-lg p-1">
                      <img src={localSettings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400">No Logo</div>
                  )}
                  <div className="flex-1">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleLogoUpload}
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition flex items-center gap-2"
                    >
                      <Upload size={16} /> Upload New Logo
                    </button>
                    <p className="text-xs text-gray-500 mt-1">Recommended size: 512x512px transparent PNG</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Appearance Section */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Palette size={20} className="text-dahab-teal" /> Appearance
            </h3>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Background Style</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
                {PRESET_BACKGROUNDS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => setLocalSettings(prev => ({...prev, backgroundStyle: preset.value}))}
                    className={`p-2 text-xs font-bold rounded-lg border-2 transition ${localSettings.backgroundStyle === preset.value ? 'border-dahab-teal bg-teal-50 text-dahab-teal' : 'border-gray-100 text-gray-500 hover:bg-gray-50'}`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
              <textarea 
                value={localSettings.backgroundStyle}
                onChange={(e) => setLocalSettings(prev => ({...prev, backgroundStyle: e.target.value}))}
                className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm font-mono h-20"
                placeholder="CSS background property..."
              />
            </div>
          </div>

          {/* 3. Hero Images Section */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <ImageIcon size={20} className="text-dahab-teal" /> Landing Page Slideshow
            </h3>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newHeroImage}
                  onChange={(e) => setNewHeroImage(e.target.value)}
                  placeholder="Paste Image URL..."
                  className="flex-1 border border-gray-300 rounded-xl px-4 py-2"
                />
                <button 
                  onClick={handleAddHeroImage}
                  className="bg-black text-white px-4 py-2 rounded-xl font-bold hover:bg-gray-800"
                >
                  Add
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {localSettings.heroImages.map((img, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden h-32">
                    <img src={img} alt="Hero" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => handleRemoveHeroImage(idx)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Save Action */}
          <div className="flex justify-end pt-4">
            <button 
              onClick={handleSaveSettings}
              className="bg-dahab-teal text-white px-8 py-3 rounded-xl font-bold hover:bg-teal-700 shadow-lg transition transform hover:scale-105"
            >
              Save Changes
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

import React, { useEffect, useState, useRef } from 'react';
import { User, Event, Booking, UserRole } from '../types';
import { db } from '../services/database';
import { Mail, Shield, User as UserIcon, Calendar, MapPin, Heart, LogOut, Edit2, Upload, X, Check, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProfileProps {
  user: User;
  onToggleSave: (id: string) => void;
  onLogout: () => void;
  onUpdateUser: (user: User) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onToggleSave, onLogout, onUpdateUser }) => {
  const [savedEvents, setSavedEvents] = useState<Event[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<'saved' | 'bookings'>('saved');
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // Profile Form State
  const [formData, setFormData] = useState({
    name: user.name,
    bio: user.bio || '',
    avatarUrl: user.avatarUrl || ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    const allEvents = await db.getEvents();
    const saved = allEvents.filter(e => user.savedEventIds?.includes(e.id));
    setSavedEvents(saved);
    const userBookings = await db.getUserBookings(user.id);
    setBookings(userBookings);
    setLoading(false);
  };

  const handleAvatarClick = () => {
      if (isEditing) fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setFormData(prev => ({ ...prev, avatarUrl: reader.result as string }));
          };
          reader.readAsDataURL(file);
      }
  };

  const handleSaveProfile = async () => {
      const updatedUser = { ...user, ...formData };
      // In a real app we'd call an API to update the user.
      // Here we assume db update and local state update.
      onUpdateUser(updatedUser);
      setIsEditing(false);
      // Removed window.location.reload() to prevent 404/error pages
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Profile Header */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden relative transition-all">
        <div className="h-40 bg-gradient-to-r from-dahab-teal to-blue-500 relative">
           <div className="absolute top-4 right-4 flex gap-2">
             <button 
               onClick={() => setIsEditing(!isEditing)}
               className={`bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-white/30 transition shadow-lg border border-white/20`}
             >
               {isEditing ? <><X size={16} /> Cancel</> : <><Edit2 size={16} /> Edit Profile</>}
             </button>
             <button 
               onClick={onLogout}
               className="bg-white text-gray-900 px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-gray-100 transition shadow-lg"
             >
               <LogOut size={16} /> Logout
             </button>
           </div>
        </div>
        <div className="px-10 pb-10">
          <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 gap-8 relative z-10">
            <div className="relative group">
                <div 
                  onClick={handleAvatarClick}
                  className={`w-32 h-32 rounded-full bg-white p-1.5 shadow-2xl z-10 overflow-hidden transition-all ${isEditing ? 'cursor-pointer hover:ring-4 hover:ring-dahab-teal/30 ring-dahab-teal' : ''}`}
                >
                  {formData.avatarUrl ? (
                    <img src={formData.avatarUrl} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center">
                        <UserIcon size={50} className="text-slate-300" />
                    </div>
                  )}
                  {isEditing && (
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <Upload className="text-white" size={24} />
                    </div>
                  )}
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>

            <div className="flex-1 space-y-4 mb-2 relative z-10">
              {isEditing ? (
                <div className="space-y-4 w-full max-w-md">
                    <input 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="text-3xl font-extrabold text-gray-900 bg-slate-50 border-b-2 border-dahab-teal outline-none w-full py-1"
                      placeholder="Your Display Name"
                    />
                    <textarea 
                      value={formData.bio}
                      onChange={e => setFormData({...formData, bio: e.target.value})}
                      className="text-gray-600 bg-slate-50 border-2 border-gray-100 rounded-xl p-3 w-full h-24 outline-none focus:border-dahab-teal"
                      placeholder="Write a short bio about yourself..."
                    />
                    <button 
                      onClick={handleSaveProfile}
                      className="bg-dahab-teal text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-xl hover:bg-teal-700 transition"
                    >
                        <Check size={20} /> Save Profile Changes
                    </button>
                </div>
              ) : (
                <>
                    <div className="flex flex-col gap-1 text-start">
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{user.name}</h1>
                        <p className="text-gray-500 max-w-lg leading-relaxed">{user.bio || "No bio yet. Tell the community about yourself!"}</p>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm font-bold">
                        <div className="flex items-center gap-2 bg-slate-100 px-4 py-1.5 rounded-full text-slate-600">
                          <Mail size={16} /> {user.email}
                        </div>
                        <div className="flex items-center gap-2 bg-dahab-teal/10 px-4 py-1.5 rounded-full text-dahab-teal capitalize">
                          <Shield size={16} /> {user.role}
                        </div>
                    </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b-2 border-gray-100 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('saved')}
          className={`px-8 py-4 font-extrabold text-sm transition-all border-b-4 -mb-0.5 whitespace-nowrap ${
            activeTab === 'saved' 
              ? 'border-dahab-teal text-dahab-teal bg-dahab-teal/5 rounded-t-xl' 
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          Saved Items ({savedEvents.length})
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-8 py-4 font-extrabold text-sm transition-all border-b-4 -mb-0.5 whitespace-nowrap ${
            activeTab === 'bookings' 
              ? 'border-dahab-teal text-dahab-teal bg-dahab-teal/5 rounded-t-xl' 
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          Recent Bookings ({bookings.length})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-20 text-center text-gray-400 flex flex-col items-center gap-4">
             <div className="w-8 h-8 border-4 border-dahab-teal border-t-transparent rounded-full animate-spin"></div>
             Loading your profile content...
        </div>
      ) : (
        <>
          {activeTab === 'saved' && (
            <div className="space-y-6">
              {savedEvents.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-200">
                  <Heart className="mx-auto text-gray-200 mb-4" size={50} />
                  <p className="text-gray-400 font-medium">Your wishlist is empty.</p>
                  <Link to="/events" className="text-dahab-teal font-extrabold hover:underline mt-4 inline-block bg-teal-50 px-6 py-2 rounded-full transition">
                    Explore Events
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedEvents.map(event => (
                    <div key={event.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col group hover:shadow-xl transition-all duration-300">
                      <div className="relative h-44">
                        <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                         <button
                            onClick={() => onToggleSave(event.id)}
                            className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur rounded-full text-red-500 hover:bg-white transition shadow-lg"
                          >
                            <Heart size={18} fill="currentColor" />
                          </button>
                          <div className="absolute bottom-4 left-4 bg-dahab-teal text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded shadow">
                            {event.category}
                          </div>
                      </div>
                      <div className="p-6 flex-1 flex flex-col text-start">
                        <h3 className="font-extrabold text-xl mb-3 text-gray-900 group-hover:text-dahab-teal transition">{event.title}</h3>
                        <div className="space-y-2 text-sm text-gray-500 mb-6 font-medium">
                           <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-dahab-gold" /> {event.date}
                           </div>
                           <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-dahab-gold" /> {event.location}
                           </div>
                        </div>
                        <Link 
                          to={`/book/event/${event.id}`}
                          className="mt-auto w-full py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-dahab-teal transition text-center shadow-lg shadow-slate-200"
                        >
                          Book Now
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
               {bookings.length === 0 ? (
                  <div className="text-center py-20 text-gray-400 italic">No bookings found in your history.</div>
               ) : (
                 <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-900">
                    <thead className="bg-slate-50 text-gray-400 uppercase font-bold text-[10px] tracking-widest">
                      <tr>
                        <th className="p-6">Item Reference</th>
                        <th className="p-6">Category</th>
                        <th className="p-6">Progress</th>
                        <th className="p-6">Timestamp</th>
                        <th className="p-6 text-right">Amount Paid</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {bookings.map(booking => (
                        <tr key={booking.id} className="hover:bg-slate-50/50 transition">
                          <td className="p-6 font-extrabold text-gray-800">#{booking.id.substr(0, 8).toUpperCase()}</td>
                          <td className="p-6"><span className="bg-slate-100 px-3 py-1 rounded-full text-xs font-bold uppercase text-slate-500">{booking.itemType}</span></td>
                          <td className="p-6">
                            <span className={`px-4 py-1 rounded-full text-xs font-extrabold uppercase ${
                              booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                              booking.status === 'rejected' ? 'bg-red-100 text-red-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="p-6 text-gray-400 font-medium">{new Date(booking.timestamp).toLocaleString()}</td>
                          <td className="p-6 text-right font-extrabold text-dahab-teal text-lg">{booking.amount} EGP</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
               )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Profile;

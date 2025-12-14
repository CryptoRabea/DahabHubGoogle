import React, { useEffect, useState } from 'react';
import { User, Event, UserRole, Booking } from '../types';
import { db } from '../services/mockDatabase';
import { Plus, Clock, CheckCircle, XCircle, Calendar, MapPin, Edit2, Trash2, Eye, BarChart3, Users, DollarSign, ShieldAlert } from 'lucide-react';
import EventFormModal from '../components/EventFormModal';
import { useNavigate } from 'react-router-dom';

const ProviderDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('dahab_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      if (parsedUser.role !== UserRole.PROVIDER) {
        navigate('/'); // Redirect if not provider
      } else {
        setUser(parsedUser);
        fetchData(parsedUser.id);
      }
    } else {
      navigate('/login');
    }
  }, []);

  const fetchData = async (userId: string) => {
    setLoading(true);
    const allEvents = await db.getEvents();
    // Filter events where organizer is the current provider
    const mine = allEvents.filter(e => e.organizerId === userId);
    setMyEvents(mine);
    
    // Fetch bookings (Placeholder - mock DB bookings might not be linked to provider ID directly in this simple schema, 
    // but assuming we'd filter by provider's items)
    const allBookings = await db.getBookings();
    // For mock purposes, filter bookings for items created by this provider
    const myItemIds = mine.map(e => e.id);
    const providerBookings = allBookings.filter(b => myItemIds.includes(b.itemId)); // + add service bookings if any
    setBookings(providerBookings);

    setLoading(false);
  };

  const handleOpenEventModal = (event?: Event) => {
    setEditingEvent(event || null);
    setIsEventModalOpen(true);
  };

  const handleEventSubmit = async (eventData: Partial<Event>) => {
    if (!user) return;
    
    if (editingEvent) {
      // Keep status as pending when editing? Or resets? Let's say editing resets to pending for safety.
      await db.updateEvent({ ...editingEvent, ...eventData, status: 'pending' } as Event);
    } else {
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
        organizerId: user.id,
        status: 'pending'
      } as Event);
    }
    await fetchData(user.id);
  };

  const handleDeleteEvent = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      await db.deleteEvent(id);
      if (user) fetchData(user.id);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Dashboard...</div>;
  if (!user) return null;

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-3xl font-bold text-gray-900">Provider Dashboard</h1>
           <p className="text-gray-500">Manage your events and view your stats.</p>
        </div>
        <button 
          onClick={() => handleOpenEventModal()}
          className="bg-dahab-teal text-white px-6 py-3 rounded-xl font-bold hover:bg-teal-700 flex items-center gap-2 shadow-lg hover:shadow-dahab-teal/50 transition"
        >
          <Plus size={20} /> Create Event
        </button>
      </div>

      {/* Account Status Banner */}
      {user.providerStatus === 'pending' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-start gap-3">
          <ShieldAlert className="text-yellow-600 shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-yellow-800">Account Pending Verification</h3>
            <p className="text-sm text-yellow-700">Your provider account is currently under review by the admin. Your events will not be public until your account is approved.</p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
           <div className="flex justify-between items-start mb-4">
             <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Calendar size={20} /></div>
             <span className="text-xs font-bold text-gray-400 uppercase">Events</span>
           </div>
           <h3 className="text-2xl font-bold text-gray-900">{myEvents.length}</h3>
           <p className="text-xs text-gray-500 mt-1">Total Created</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
           <div className="flex justify-between items-start mb-4">
             <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><BarChart3 size={20} /></div>
             <span className="text-xs font-bold text-gray-400 uppercase">Views</span>
           </div>
           <h3 className="text-2xl font-bold text-gray-900">1.2k</h3>
           <p className="text-xs text-gray-500 mt-1">This Month</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
           <div className="flex justify-between items-start mb-4">
             <div className="p-2 bg-green-50 rounded-lg text-green-600"><DollarSign size={20} /></div>
             <span className="text-xs font-bold text-gray-400 uppercase">Bookings</span>
           </div>
           <h3 className="text-2xl font-bold text-gray-900">{bookings.length}</h3>
           <p className="text-xs text-gray-500 mt-1">Confirmed</p>
        </div>
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
           <div className="flex justify-between items-start mb-4">
             <div className="p-2 bg-orange-50 rounded-lg text-orange-600"><Users size={20} /></div>
             <span className="text-xs font-bold text-gray-400 uppercase">Rating</span>
           </div>
           <h3 className="text-2xl font-bold text-gray-900">4.9</h3>
           <p className="text-xs text-gray-500 mt-1">Average</p>
        </div>
      </div>

      {/* Events List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="font-bold text-lg">My Events</h2>
        </div>
        
        {myEvents.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            <Calendar className="mx-auto mb-3 text-gray-300" size={40} />
            <p>You haven't created any events yet.</p>
            <button onClick={() => handleOpenEventModal()} className="text-dahab-teal font-bold hover:underline mt-2">Create your first event</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
                <tr>
                  <th className="p-4">Event Details</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {myEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={event.imageUrl} className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                        <div>
                          <div className="font-bold text-gray-900">{event.title}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={10} /> {event.location}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      <div className="font-medium">{event.date}</div>
                      <div className="text-xs">{event.time}</div>
                    </td>
                    <td className="p-4">
                      {event.status === 'approved' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700"><CheckCircle size={12} /> Live</span>}
                      {event.status === 'pending' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700"><Clock size={12} /> Pending Approval</span>}
                      {event.status === 'rejected' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700"><XCircle size={12} /> Rejected</span>}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                         <button 
                          onClick={() => handleOpenEventModal(event)}
                          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition" title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteEvent(event.id)}
                          className="p-2 text-gray-500 hover:bg-red-50 hover:text-red-500 rounded-lg transition" title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <EventFormModal 
        isOpen={isEventModalOpen} 
        onClose={() => setIsEventModalOpen(false)}
        onSubmit={handleEventSubmit}
        initialData={editingEvent}
      />
    </div>
  );
};

export default ProviderDashboard;
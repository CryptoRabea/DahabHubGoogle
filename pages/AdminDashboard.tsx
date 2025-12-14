import React, { useEffect, useState } from 'react';
import { db } from '../services/mockDatabase';
import { Booking, BookingStatus, Event } from '../types';
import { Check, X, Plus } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [activeTab, setActiveTab] = useState<'bookings' | 'events'>('bookings');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const b = await db.getBookings();
    setBookings(b);
  };

  const handleBookingAction = async (id: string, status: BookingStatus) => {
    await db.updateBookingStatus(id, status);
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'bookings' ? 'bg-dahab-teal text-white' : 'bg-white'}`}
          >
            Bookings ({bookings.filter(b => b.status === BookingStatus.PENDING).length})
          </button>
          <button 
            onClick={() => setActiveTab('events')}
            className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'events' ? 'bg-dahab-teal text-white' : 'bg-white'}`}
          >
            Manage Events
          </button>
        </div>
      </div>

      {activeTab === 'bookings' && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
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
    </div>
  );
};

export default AdminDashboard;
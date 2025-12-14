import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Phone, ShieldCheck } from 'lucide-react';
import { ServiceProvider } from '../types';
import { db } from '../services/mockDatabase';

const Services: React.FC = () => {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'Driver' | 'Other'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.getProviders().then(data => {
      setProviders(data);
      setLoading(false);
    });
  }, []);

  const filteredProviders = activeTab === 'all' 
    ? providers 
    : providers.filter(p => activeTab === 'Driver' ? p.serviceType === 'Driver' : p.serviceType !== 'Driver');

  return (
    <div className="space-y-8">
      {/* Header with Tabs */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold">Services Directory</h1>
          <div className="flex p-1 bg-gray-100 rounded-xl">
            {['all', 'Driver', 'Other'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition ${activeTab === tab ? 'bg-white shadow text-dahab-teal' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {tab === 'all' ? 'All Services' : tab === 'Driver' ? 'Drivers' : 'Home Services'}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-xl flex items-center justify-between border border-blue-100">
          <div>
            <h3 className="font-bold text-blue-900">Drive with AmakenDahab</h3>
            <p className="text-sm text-blue-700">Are you a service provider? List your service here.</p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700">
            Join Now
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading directory...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProviders.map((provider) => (
            <div key={provider.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition border border-gray-100 flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <img src={provider.imageUrl} alt={provider.name} className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" />
                  <div>
                    <h3 className="font-bold text-lg flex items-center gap-1">
                      {provider.name}
                      {provider.isVerified && <ShieldCheck size={16} className="text-dahab-teal" />}
                    </h3>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded text-xs uppercase">{provider.serviceType}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-yellow-50 text-yellow-600 px-2 py-1 rounded-lg text-sm font-bold">
                  <Star size={14} fill="currentColor" />
                  {provider.rating}
                </div>
              </div>
              
              <p className="text-gray-600 text-sm line-clamp-2">{provider.description}</p>
              
              <div className="mt-auto pt-4 border-t border-gray-100 flex gap-3">
                <Link 
                  to={`/book/service/${provider.id}`} 
                  className="flex-1 bg-dahab-teal text-white py-2 rounded-lg font-medium text-center text-sm hover:bg-teal-700 transition"
                >
                  Book
                </Link>
                <a href={`tel:${provider.phone}`} className="flex items-center justify-center w-10 h-10 bg-green-50 text-green-600 rounded-lg hover:bg-green-100">
                  <Phone size={18} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Services;
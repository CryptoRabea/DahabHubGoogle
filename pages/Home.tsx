import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?q=80&w=1920&auto=format&fit=crop", // Red Sea Reef (Existing - Good)
  "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=1920&auto=format&fit=crop", // Replacement: Clear Beach/Sea
  "https://images.unsplash.com/photo-1682687220063-4742bd7fd538?q=80&w=1920&auto=format&fit=crop", // Replacement: Desert Mountains
  "https://images.unsplash.com/photo-1539768942893-daf53e448371?q=80&w=1920&auto=format&fit=crop", // Palms & Beach (Existing - Good)
];

const Home: React.FC = () => {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden shadow-2xl h-[500px] group">
        {/* Slideshow Background */}
        <div className="absolute inset-0 bg-gray-900">
          {HERO_IMAGES.map((img, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-[2000ms] ease-in-out transform ${
                index === currentImage ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
              }`}
            >
              <img 
                src={img} 
                alt={`Dahab scenery ${index + 1}`} 
                className="w-full h-full object-cover"
              />
              {/* Individual Image Overlay for better contrast/pop if needed */}
              <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
            </div>
          ))}
        </div>

        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8 md:p-16 z-10">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight drop-shadow-lg">
            Experience the Soul of <span className="text-dahab-gold">Dahab</span>
          </h1>
          <p className="text-gray-100 text-lg md:text-xl max-w-2xl mb-8 drop-shadow-md font-medium">
            The ultimate social hub. Discover events, book reliable drivers, and connect with the community.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Link to="/events" className="bg-dahab-teal text-white px-8 py-3 rounded-full font-semibold hover:bg-teal-700 transition shadow-lg hover:shadow-dahab-teal/50">
              Find Events
            </Link>
            <Link to="/services" className="bg-white/10 backdrop-blur-md text-white border border-white/50 px-8 py-3 rounded-full font-semibold hover:bg-white/20 transition shadow-lg">
              Book a Driver
            </Link>
          </div>
        </div>
        
        {/* Slide Indicators */}
        <div className="absolute bottom-6 right-8 z-20 flex gap-2">
          {HERO_IMAGES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentImage(idx)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                idx === currentImage ? 'bg-dahab-gold w-6' : 'bg-white/50 hover:bg-white'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Explore Dahab</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { title: 'Events & Parties', icon: '🎉', link: '/events', color: 'bg-purple-100 text-purple-600' },
            { title: 'Drivers', icon: '🚕', link: '/services', color: 'bg-yellow-100 text-yellow-600' },
            { title: 'Diving', icon: '🤿', link: '/events', color: 'bg-blue-100 text-blue-600' },
            { title: 'Wellness', icon: '🧘‍♀️', link: '/events', color: 'bg-green-100 text-green-600' },
          ].map((cat, idx) => (
            <Link key={idx} to={cat.link} className={`p-6 rounded-2xl ${cat.color} hover:opacity-90 transition flex flex-col items-center justify-center gap-3 text-center h-40 group`}>
              <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{cat.icon}</span>
              <span className="font-bold">{cat.title}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Drive with Us Banner */}
      <section className="bg-gray-900 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 text-white relative overflow-hidden">
        {/* Abstract background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-dahab-teal rounded-full blur-[100px] opacity-20 translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="space-y-4 relative z-10">
          <h2 className="text-3xl font-bold">Drive with AmakenDahab</h2>
          <p className="text-gray-400 max-w-md">
            Are you a local driver or service provider? Join our verified network and grow your business today.
          </p>
        </div>
        <div className="flex flex-col gap-3 w-full md:w-auto relative z-10">
          <Link to="/services" className="bg-dahab-gold text-black px-8 py-3 rounded-full font-bold hover:bg-yellow-400 transition text-center shadow-lg hover:shadow-yellow-500/20">
            Register as Driver
          </Link>
          <span className="text-xs text-gray-500 text-center">Requires admin verification</span>
        </div>
      </section>
    </div>
  );
};

export default Home;
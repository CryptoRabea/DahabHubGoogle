import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Upload, Smartphone, ArrowRight, Loader2 } from 'lucide-react';
import { db } from '../services/mockDatabase';
import { User, Event, ServiceProvider, BookingStatus, PaymentMethod } from '../types';

interface BookingPageProps {
  user: User;
}

const BookingPage: React.FC<BookingPageProps> = ({ user }) => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<Event | ServiceProvider | null>(null);
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.VODAFONE_CASH);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (type === 'event') {
        const events = await db.getEvents();
        setItem(events.find(e => e.id === id) || null);
      } else {
        const providers = await db.getProviders();
        setItem(providers.find(p => p.id === id) || null);
      }
    };
    fetchData();
  }, [type, id]);

  const handleSubmit = async () => {
    if (!item) return;
    setIsSubmitting(true);
    
    // Simulate API call
    await db.createBooking({
      id: Math.random().toString(36).substr(2, 9),
      itemId: item.id,
      itemType: type as 'event' | 'service',
      userId: user.id,
      userName: user.name,
      amount: 'price' in item ? item.price : 100, // Default 100 for service base fee
      method: paymentMethod,
      status: BookingStatus.PENDING,
      timestamp: new Date().toISOString()
    });

    setStep(3);
    setIsSubmitting(false);
  };

  if (!item) return <div className="p-8 text-center">Item not found</div>;

  return (
    <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden min-h-[500px]">
      <div className="bg-dahab-teal p-6 text-white text-center">
        <h2 className="text-2xl font-bold">Secure Booking</h2>
        <p className="opacity-90 text-sm">Step {step} of 3</p>
      </div>

      <div className="p-8">
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
              <img src={item.imageUrl} alt={item.name || (item as Event).title} className="w-16 h-16 rounded-lg object-cover" />
              <div>
                <h3 className="font-bold">{item.name || (item as Event).title}</h3>
                <p className="text-gray-500 text-sm">Total: <span className="text-dahab-teal font-bold text-lg">{'price' in item ? item.price : 100} EGP</span></p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Select Payment Method</label>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setPaymentMethod(PaymentMethod.VODAFONE_CASH)}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition ${paymentMethod === PaymentMethod.VODAFONE_CASH ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <Smartphone className={paymentMethod === PaymentMethod.VODAFONE_CASH ? 'text-red-600' : 'text-gray-400'} />
                  <span className="font-bold text-sm">Vodafone Cash</span>
                </button>
                <button 
                  onClick={() => setPaymentMethod(PaymentMethod.INSTAPAY)}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition ${paymentMethod === PaymentMethod.INSTAPAY ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className="font-bold text-xs bg-purple-200 px-1 rounded text-purple-700">IP</div>
                  <span className="font-bold text-sm">Instapay</span>
                </button>
              </div>
            </div>

            <button onClick={() => setStep(2)} className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition flex justify-center items-center gap-2">
              Continue <ArrowRight size={18} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
             <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl text-center">
              <p className="text-sm text-yellow-800 mb-1">Transfer the exact amount to:</p>
              <p className="text-2xl font-mono font-bold text-gray-900 tracking-wider">010 1234 5678</p>
              <p className="text-xs text-gray-500 mt-1">{paymentMethod}</p>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition cursor-pointer relative">
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center gap-2 pointer-events-none">
                <Upload size={32} className="text-gray-400" />
                <span className="font-medium text-gray-600">{file ? file.name : "Upload Payment Screenshot"}</span>
                <span className="text-xs text-gray-400">Click to browse</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setStep(1)} className="flex-1 py-4 font-bold text-gray-500 hover:text-gray-800">Back</button>
              <button 
                onClick={handleSubmit} 
                disabled={!file || isSubmitting}
                className="flex-[2] bg-dahab-teal text-white py-4 rounded-xl font-bold hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : "Confirm Payment"}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center space-y-6 animate-fade-in py-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Booking Pending!</h3>
              <p className="text-gray-500 mt-2">The admin will verify your payment receipt shortly. You can track this in your profile.</p>
            </div>
            <button onClick={() => navigate('/')} className="px-8 py-3 bg-gray-900 text-white rounded-full font-bold">
              Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
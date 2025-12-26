
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, UserRole } from '../types';
import { db } from '../services/database';
import { Mail, Lock, User as UserIcon, ArrowRight, Check, Facebook, Loader2, Briefcase, AlertCircle, ShieldCheck, ScrollText, Key } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import TermsModal from '../components/TermsModal';

interface LoginProps {
  onLogin: (user: User) => void;
}

type AuthMode = 'login' | 'signup';

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const { settings } = useSettings();
  
  const isMockMode = (db as any).constructor.name === 'MockDatabaseService';

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [isProviderSignup, setIsProviderSignup] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const roleParam = searchParams.get('role');
    const modeParam = searchParams.get('mode');

    if (roleParam === 'provider') {
      setMode('signup');
      setIsProviderSignup(true);
    } else if (modeParam === 'signup') {
      setMode('signup');
      setIsProviderSignup(false);
    }
  }, [searchParams]);

  const handleDemoLogin = (email: string) => {
    setFormData({ ...formData, email, password: 'password123' });
    setError('');
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setLoading(true);
    setError('');
    try {
      const user = await db.socialLogin(provider);
      onLogin(user);
      if (user.role === UserRole.ADMIN) navigate('/admin');
      else if (user.role === UserRole.PROVIDER) navigate('/provider-dashboard');
      else navigate('/');
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Social authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (mode === 'signup' && isProviderSignup && !termsAccepted) {
      setError('You must accept the Terms & Conditions to register as a Provider.');
      return;
    }

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      let user: User;

      if (mode === 'signup') {
        if (!formData.name) {
          setError('Name is required for signup');
          setLoading(false);
          return;
        }
        user = await db.register(formData.name, formData.email, formData.password, isProviderSignup);
      } else {
        user = await db.login(formData.email, formData.password);
      }

      onLogin(user);
      
      if (user.role === UserRole.ADMIN) navigate('/admin');
      else if (user.role === UserRole.PROVIDER) navigate('/provider-dashboard');
      else navigate('/');

    } catch (err: any) {
      console.error("Auth Error", err);
      const code = err.code || '';
      const message = err.message || '';

      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (code === 'auth/user-not-found' || message.includes('user-not-found')) {
        setError('No account found with this email. Please sign up or use a demo account.');
      } else if (code === 'auth/email-already-in-use' || message.includes('email-already-in-use')) {
        setError('This email is already registered. Try signing in.');
      } else if (code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError(message || 'Authentication failed. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Logic to determine if main button is active
  const isFormValid = mode === 'login' 
    ? (formData.email && formData.password)
    : (formData.name && formData.email && formData.password && (!isProviderSignup || termsAccepted));

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden text-gray-900 border border-gray-100">
        
        {/* Header */}
        <div className="bg-gradient-to-br from-dahab-teal to-blue-600 p-10 text-center text-white flex flex-col items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          {settings.logoUrl && (
            <img 
              src={settings.logoUrl} 
              alt="Logo" 
              className="w-20 h-20 object-contain mb-4 drop-shadow-xl"
              onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
            />
          )}
          <h1 className="text-3xl font-extrabold mb-2 tracking-tight">{settings.appName}</h1>
          <p className="opacity-90 text-sm font-medium">
            {isProviderSignup ? 'Become an AmakenDahab Partner' : 'Your Professional Gateway to Dahab'}
          </p>
        </div>

        <div className="p-8 space-y-6">
          {/* Tabs */}
          <div className="flex p-1.5 bg-slate-100 rounded-2xl">
            <button 
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${mode === 'login' ? 'bg-white shadow-lg text-dahab-teal' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => { setMode('login'); setError(''); }}
            >
              Sign In
            </button>
            <button 
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${mode === 'signup' ? 'bg-white shadow-lg text-dahab-teal' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => { setMode('signup'); setError(''); }}
            >
              Sign Up
            </button>
          </div>

          {/* Demo Mode Helper */}
          {isMockMode && mode === 'login' && (
            <div className="bg-teal-50 border border-teal-100 p-4 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-dahab-teal font-bold text-xs uppercase tracking-wider">
                <Key size={14} /> Demo Accounts
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => handleDemoLogin('admin@dahab.com')} className="px-3 py-1 bg-white border border-teal-200 rounded-lg text-[10px] font-bold text-teal-700 hover:bg-dahab-teal hover:text-white transition">Admin</button>
                <button onClick={() => handleDemoLogin('provider@dahab.com')} className="px-3 py-1 bg-white border border-teal-200 rounded-lg text-[10px] font-bold text-teal-700 hover:bg-dahab-teal hover:text-white transition">Provider</button>
                <button onClick={() => handleDemoLogin('user@dahab.com')} className="px-3 py-1 bg-white border border-teal-200 rounded-lg text-[10px] font-bold text-teal-700 hover:bg-dahab-teal hover:text-white transition">User</button>
              </div>
            </div>
          )}

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-4">
            <button 
              type="button"
              onClick={() => handleSocialLogin('google')}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition font-bold text-gray-700 text-xs shadow-sm active:scale-95"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
            <button 
              type="button"
              onClick={() => handleSocialLogin('facebook')}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-[#1877F2] text-white rounded-2xl hover:bg-[#1864D9] transition font-bold text-xs shadow-sm active:scale-95"
            >
              <Facebook size={16} fill="currentColor" />
              Facebook
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Or Secure {mode === 'login' ? 'Login' : 'Signup'}</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="relative group">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-dahab-teal transition-colors" size={20} />
                <input
                  type="text"
                  placeholder="Full Name / Business Name"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-dahab-teal/20 transition-all text-gray-900 font-medium"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
            )}

            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-dahab-teal transition-colors" size={20} />
              <input
                type="email" 
                placeholder="Email Address"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-dahab-teal/20 transition-all text-gray-900 font-medium"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-dahab-teal transition-colors" size={20} />
              <input
                type="password"
                placeholder="Secure Password"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-dahab-teal/20 transition-all text-gray-900 font-medium"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                required
                minLength={6}
              />
            </div>

            {mode === 'signup' && (
              <div className="space-y-3">
                <label className={`flex items-center gap-4 p-5 rounded-[1.5rem] border-2 cursor-pointer transition-all ${isProviderSignup ? 'bg-dahab-teal/5 border-dahab-teal' : 'bg-slate-50 border-transparent hover:bg-slate-100'}`}>
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition ${isProviderSignup ? 'bg-dahab-teal border-dahab-teal shadow-lg shadow-dahab-teal/20' : 'bg-white border-gray-200'}`}>
                    {isProviderSignup && <Check size={16} className="text-white" />}
                  </div>
                  <input 
                    type="checkbox" 
                    checked={isProviderSignup}
                    onChange={e => setIsProviderSignup(e.target.checked)}
                    className="hidden"
                  />
                  <div>
                     <p className="font-bold text-gray-900 text-sm">Register as Service Provider</p>
                     <p className="text-[10px] text-gray-500 font-medium">Create events, list your business or offer driving.</p>
                  </div>
                </label>

                {isProviderSignup && (
                  <div 
                    onClick={() => setIsTermsModalOpen(true)}
                    className={`flex items-center gap-4 p-5 rounded-[1.5rem] border-2 cursor-pointer transition-all animate-in slide-in-from-top-2 duration-300 ${termsAccepted ? 'bg-green-50 border-green-500 text-green-700' : 'bg-amber-50 border-amber-300 text-amber-800 shadow-lg shadow-amber-200/20 ring-2 ring-amber-100 animate-pulse'}`}
                  >
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition ${termsAccepted ? 'bg-green-500 border-green-500' : 'bg-white border-amber-400'}`}>
                      {termsAccepted ? <Check size={16} className="text-white" /> : <ScrollText size={14} className="text-amber-500" />}
                    </div>
                    <div className="flex-1">
                       <p className="font-bold text-sm">{termsAccepted ? 'Terms Accepted Successfully' : 'Accept Terms & Conditions'}</p>
                       <p className="text-[10px] opacity-80 font-bold uppercase tracking-widest">{termsAccepted ? 'Review Agreement' : 'Click to Read (Required)'}</p>
                    </div>
                    {!termsAccepted && <ArrowRight size={20} className="text-amber-400" />}
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold border border-red-100 animate-in shake-1 duration-300">
                <AlertCircle size={20} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={loading || !isFormValid}
                className={`w-full py-5 rounded-[1.5rem] font-extrabold transition-all duration-300 flex justify-center items-center gap-3 shadow-2xl relative overflow-hidden group ${isFormValid ? 'bg-gray-900 text-white hover:bg-black active:scale-[0.98]' : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none grayscale'}`}
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <>
                    <span className="relative z-10">
                      {mode === 'login' ? 'Secure Sign In' : (isProviderSignup ? 'Finalize Partnership' : 'Launch Account')}
                    </span>
                    <ArrowRight size={20} className={`relative z-10 transition-transform ${isFormValid ? 'group-hover:translate-x-1' : ''}`} />
                  </>
                )}
                {isFormValid && <div className="absolute inset-0 bg-gradient-to-r from-dahab-teal/0 via-white/5 to-dahab-teal/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>}
              </button>
              
              {!isFormValid && mode === 'signup' && isProviderSignup && !termsAccepted && (
                <p className="text-center text-[10px] text-amber-600 font-extrabold uppercase mt-4 tracking-widest">
                  Accept Agreement to Continue
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
      
      {/* Footer Hint */}
      <p className="mt-8 text-xs text-slate-400 font-medium">
        Securely serving Dahab, South Sinai since 2024
      </p>

      {/* Terms & Conditions Modal */}
      <TermsModal 
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        onAgree={() => {
          setTermsAccepted(true);
          setIsTermsModalOpen(false);
          setError('');
        }}
      />
    </div>
  );
};

export default Login;

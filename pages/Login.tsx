import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserRole } from '../types';
import { db } from '../services/mockDatabase';
import { Mail, Lock, User as UserIcon, ArrowRight, Check, Facebook, Chrome, Loader2, Car } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

type AuthMode = 'login' | 'signup' | 'verify';

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    code: ''
  });
  const [isProviderSignup, setIsProviderSignup] = useState(false);

  const [error, setError] = useState('');

  // Handlers
  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setLoading(true);
    setError('');
    try {
      const user = await db.socialLogin(provider);
      onLogin(user);
      navigate('/');
    } catch (e) {
      setError('Social authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (mode === 'signup') {
      // Step 1: Request Verification
      if (!formData.email || !formData.password || !formData.name) {
        setError('Please fill in all fields');
        return;
      }
      setLoading(true);
      await db.sendVerificationCode(formData.email);
      setLoading(false);
      setMode('verify');
    } 
    else if (mode === 'verify') {
      // Step 2: Verify Code
      setLoading(true);
      const user = await db.verifyAndCreateUser(formData.name, formData.email, formData.code, isProviderSignup);
      if (user) {
        onLogin(user);
        navigate(user.role === UserRole.ADMIN ? '/admin' : '/');
      } else {
        setError('Invalid verification code. Try "1234"');
        setLoading(false);
      }
    } 
    else {
      // Login Mode
      setLoading(true);
      // Simulate login check
      await new Promise(r => setTimeout(r, 1000));
      
      // Special logic: Login as Admin if identifier is "RahmaOrganizer"
      if (formData.email === 'RahmaOrganizer' || formData.email === 'Rahma Organizer') {
         const user = await db.login(UserRole.ADMIN);
         onLogin(user);
         navigate('/admin');
         return;
      }

      // For demo purposes, we log them in as a generic user if fields are filled
      if (formData.email && formData.password) {
        const user = await db.login(UserRole.USER);
        onLogin({ ...user, email: formData.email, name: 'Returned User' });
        navigate('/');
      } else {
        setError('Invalid credentials');
        setLoading(false);
      }
    }
  };

  // Demo Bypass
  const handleDemoLogin = async (role: UserRole) => {
    const user = await db.login(role);
    onLogin(user);
    navigate(role === UserRole.ADMIN ? '/admin' : '/');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden">
        
        {/* Header Image/Color */}
        <div className="bg-gradient-to-r from-dahab-teal to-blue-500 p-8 text-center text-white">
          <h1 className="text-3xl font-bold mb-2">
            {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Join AmakenDahab' : 'Verify Email'}
          </h1>
          <p className="opacity-90 text-sm">
            {mode === 'login' 
              ? 'Login to manage your bookings and events' 
              : mode === 'signup' 
              ? 'Connect with the best of Dahab' 
              : `We sent a code to ${formData.email}`
            }
          </p>
        </div>

        <div className="p-8">
          {/* Social Login Buttons (Only in Login/Signup) */}
          {mode !== 'verify' && (
            <>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button 
                  onClick={() => handleSocialLogin('google')}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition font-medium text-gray-700 text-sm"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google
                </button>
                <button 
                  onClick={() => handleSocialLogin('facebook')}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 bg-[#1877F2] text-white rounded-xl hover:bg-[#1864D9] transition font-medium text-sm"
                >
                  <Facebook size={20} fill="currentColor" className="text-white" />
                  Facebook
                </button>
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-2 text-xs text-gray-400 uppercase">Or continue with email</span>
                </div>
              </div>
            </>
          )}

          {/* Email Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {mode === 'signup' && (
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dahab-teal/50 transition"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
            )}

            {mode !== 'verify' && (
              <>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text" 
                    placeholder="Email Address"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dahab-teal/50 transition"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="password"
                    placeholder="Password"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dahab-teal/50 transition"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </>
            )}

            {mode === 'signup' && (
              <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition">
                <div className={`w-5 h-5 rounded border flex items-center justify-center ${isProviderSignup ? 'bg-dahab-teal border-dahab-teal' : 'border-gray-300'}`}>
                  {isProviderSignup && <Check size={14} className="text-white" />}
                </div>
                <input 
                  type="checkbox" 
                  checked={isProviderSignup}
                  onChange={e => setIsProviderSignup(e.target.checked)}
                  className="hidden"
                />
                <span className="text-sm text-gray-600 flex items-center gap-1">
                  Register as Service Provider (Driver, etc.)
                </span>
              </label>
            )}

            {mode === 'verify' && (
              <div className="text-center">
                <input
                  type="text"
                  placeholder="0000"
                  maxLength={4}
                  className="w-32 text-center text-3xl tracking-[0.5em] font-mono py-3 border-b-2 border-dahab-teal focus:outline-none bg-transparent"
                  value={formData.code}
                  onChange={e => setFormData({...formData, code: e.target.value})}
                />
                <p className="text-xs text-gray-500 mt-4">Enter the code sent to your email (Demo: use '1234')</p>
              </div>
            )}

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition flex justify-center items-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  {mode === 'login' && 'Sign In'}
                  {mode === 'signup' && 'Sign Up'}
                  {mode === 'verify' && 'Verify & Login'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Toggle Login/Signup */}
          {mode !== 'verify' && (
            <div className="mt-6 text-center text-sm text-gray-500">
              {mode === 'login' ? (
                <p>
                  Don't have an account?{' '}
                  <button onClick={() => setMode('signup')} className="text-dahab-teal font-bold hover:underline">
                    Create Account
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button onClick={() => setMode('login')} className="text-dahab-teal font-bold hover:underline">
                    Sign In
                  </button>
                </p>
              )}
            </div>
          )}
          
          {mode === 'verify' && (
            <div className="mt-6 text-center">
              <button onClick={() => setMode('signup')} className="text-sm text-gray-400 hover:text-gray-600">
                Back to Sign Up
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Demo Links */}
      <div className="mt-8 text-center space-y-2">
        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Demo Access</p>
        <div className="flex gap-4 text-sm justify-center">
          {/* Admin Demo Hidden as requested */}
          <button onClick={() => handleDemoLogin(UserRole.PROVIDER)} className="text-dahab-teal hover:underline">
            Driver Demo
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
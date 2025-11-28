import { useState, useEffect } from 'react';
import axios from 'axios';
import RegisterModal from '../components/RegisterModal';
import { authService } from '../types/authservice';

interface LoginForm {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: {
      user_id: string;
      name: string;
      email: string;
      role: string;
      created_at: string;
    };
  };
}

const LoginPage = () => {
  const [loginForm, setLoginForm] = useState<LoginForm>({
    email: '',
    password: ''
  });
  const [showRegister, setShowRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof LoginForm, string>>>({});

  // Only setup auto-logout if user is already logged in
  useEffect(() => {
    // Check if user is already authenticated
    if (authService.isAuthenticated()) {
      console.log('User already authenticated, setting up auto-logout');
      authService.setupAutoLogout(handleAutoLogout);
    } else {
      console.log('User not authenticated, clearing any existing tokens');
      authService.clearTokens(); // Clear any stale tokens
    }

    // Cleanup on component unmount
    return () => {
      authService.cleanup();
    };
  }, []);

  const handleAutoLogout = () => {
    setMessage({ 
      type: 'error', 
      text: 'Your session has expired. Please login again.' 
    });
    
    // Clear the form
    setLoginForm({ email: '', password: '' });
    
    // Don't reload the page immediately, let user see the message
    setTimeout(() => {
      setMessage(null);
    }, 5000);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof LoginForm, string>> = {};

    if (!loginForm.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginForm.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!loginForm.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      console.log('Attempting login...');
      
      const response = await axios.post<LoginResponse>(
        'http://localhost:5000/api/auth/login',
        {
          email: loginForm.email.trim(),
          password: loginForm.password
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = response.data;
      console.log('Login response:', data);

      if (data.success) {
        console.log('Login successful, storing tokens...');
        
        // Check if tokens exist in response
        if (!data.data.accessToken || !data.data.refreshToken) {
          throw new Error('No tokens received from server');
        }

        // Store tokens securely
        authService.storeTokens(
          data.data.accessToken,
          data.data.refreshToken
        );

        // Debug: Check if tokens were stored properly
        authService.debugAuth();

        setMessage({ 
          type: 'success', 
          text: 'Login successful! Redirecting...' 
        });

        // Setup auto-logout now that we're authenticated
        authService.setupAutoLogout(handleAutoLogout);

        // Store user data in localStorage
        localStorage.setItem('user_data', JSON.stringify(data.data.user));

        // Redirect to dashboard after successful subscription
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);

      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = 'Login failed. Please check your connection and try again.';
      
      if (axios.isAxiosError(error)) {
        // Handle Axios errors
        if (error.response) {
          // Server responded with error status
          const serverError = error.response.data as LoginResponse;
          errorMessage = serverError.message || `Server error: ${error.response.status}`;
        } else if (error.request) {
          // Request was made but no response received
          errorMessage = 'No response from server. Please check your connection.';
        } else {
          // Something else happened
          errorMessage = error.message;
        }
      } else if (error instanceof Error) {
        // Handle other Error types
        errorMessage = error.message;
      }
      
      setMessage({ 
        type: 'error', 
        text: errorMessage
      });
      
      // Clear any existing tokens on login failure
      authService.clearTokens();
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof LoginForm]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleShowRegister = () => {
    setShowRegister(true);
  };

  const handleCloseRegister = () => {
    setShowRegister(false);
  };

  const handleSwitchToLogin = () => {
    setShowRegister(false);
    setMessage({ type: 'success', text: 'Please login with your credentials' });
  };

  // Clear any existing messages on component mount
  useEffect(() => {
    setMessage(null);
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#1a1a2e] flex items-center justify-center p-4 overflow-hidden relative">
      {/* Background decorative circles */}
      <div className="absolute top-10 left-10 md:top-20 md:left-20 w-48 h-48 md:w-96 md:h-96 bg-purple-600 rounded-full opacity-20 blur-3xl animate-pulse"></div>
      <div className="absolute bottom-10 right-10 md:bottom-20 md:right-20 w-48 h-48 md:w-96 md:h-96 bg-pink-600 rounded-full opacity-20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/4 w-32 h-32 md:w-64 md:h-64 bg-blue-600 rounded-full opacity-10 blur-3xl"></div>

      {/* Main glass container */}
      <div className="max-w-6xl w-full bg-white/10 backdrop-blur-xl rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-12 shadow-2xl border border-white/20 relative z-10 animate-fadeIn">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
          {/* Left side - Welcome section */}
          <div className="flex-1 text-white text-center lg:text-left w-full">
            {/* Logo */}
            <div className="mb-6 md:mb-8 flex justify-center lg:justify-start">
              <div className="flex gap-2 mb-2">
                <div className="w-1.5 md:w-2 h-8 md:h-12 bg-white rounded"></div>
                <div className="w-1.5 md:w-2 h-8 md:h-12 bg-white rounded"></div>
              </div>
            </div>

            {/* Welcome text */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 animate-slideInLeft">Welcome!</h1>
            <div className="w-12 md:w-16 h-1 bg-white/50 mb-6 md:mb-8 mx-auto lg:mx-0"></div>
            
            <p className="text-white/70 text-xs md:text-sm mb-6 md:mb-8 leading-relaxed max-w-md mx-auto lg:mx-0">
              Track, manage, and master every plan — because your time deserves more than chasing subscriptions.
            </p>

            <button className="px-6 md:px-8 py-2.5 md:py-3 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full text-white text-sm md:text-base font-medium hover:shadow-lg hover:scale-105 transition-all">
              Learn More
            </button>
          </div>

          {/* Right side - Login form */}
          <div className="w-full lg:w-96 bg-white/10 backdrop-blur-lg rounded-2xl md:rounded-3xl p-6 md:p-8 border border-white/20 shadow-xl animate-slideInRight">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 md:mb-8 text-center lg:text-left">Sign in</h2>

            {message && (
              <div className={`mb-4 p-3 rounded-lg text-sm ${
                message.type === 'success' 
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                  : 'bg-red-500/20 text-red-300 border border-red-500/30'
              }`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="space-y-5 md:space-y-6">
                {/* Email field */}
                <div>
                  <label className="block text-white/90 text-xs md:text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={loginForm.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 md:px-4 py-2.5 md:py-3 bg-white/10 backdrop-blur-sm border rounded-xl text-white text-sm md:text-base placeholder-white/50 focus:outline-none transition-all ${
                      errors.email ? 'border-red-400/50' : 'border-white/20 focus:border-white/40'
                    }`}
                    placeholder="Enter your email"
                    disabled={loading}
                    autoComplete="email"
                  />
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                </div>

                {/* Password field */}
                <div>
                  <label className="block text-white/90 text-xs md:text-sm font-medium mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={loginForm.password}
                    onChange={handleInputChange}
                    className={`w-full px-3 md:px-4 py-2.5 md:py-3 bg-white/10 backdrop-blur-sm border rounded-xl text-white text-sm md:text-base placeholder-white/50 focus:outline-none transition-all ${
                      errors.password ? 'border-red-400/50' : 'border-white/20 focus:border-white/40'
                    }`}
                    placeholder="Enter your password"
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 md:py-3 bg-gradient-to-r from-orange-400 via-pink-500 to-pink-600 rounded-xl text-white text-sm md:text-base font-semibold hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>

                <div className="text-center pt-4">
                  <p className="text-white/70 text-sm">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={handleShowRegister}
                      className="text-orange-400 hover:text-pink-400 font-medium transition-colors underline disabled:opacity-50"
                      disabled={loading}
                    >
                      Register
                    </button>
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Register Modal */}
      <RegisterModal 
        isOpen={showRegister}
        onClose={handleCloseRegister}
        onSwitchToLogin={handleSwitchToLogin}
      />

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideInLeft {
          animation: slideInLeft 0.8s ease-out;
        }

        .animate-slideInRight {
          animation: slideInRight 0.8s ease-out;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
import { useState } from 'react';
import { X } from 'lucide-react';

interface User {
  user_id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
  };
}

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  role: string;
  adminKey: string;
}

const RegisterModal = ({ isOpen, onClose, onSwitchToLogin }: RegisterModalProps) => {
  const [registerForm, setRegisterForm] = useState<RegisterForm>({
    name: '',
    email: '',
    password: '',
    role: 'user',
    adminKey: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterForm, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof RegisterForm, string>> = {};

    if (!registerForm.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (registerForm.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!registerForm.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!registerForm.password) {
      newErrors.password = 'Password is required';
    } else if (registerForm.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (registerForm.role === 'admin' && !registerForm.adminKey) {
      newErrors.adminKey = 'Admin key is required for admin registration';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const requestBody: any = {
        name: registerForm.name.trim(),
        email: registerForm.email.trim(),
        password: registerForm.password
      };

      if (registerForm.role === 'admin') {
        requestBody.role = registerForm.role;
        requestBody.adminKey = registerForm.adminKey;
      }

      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data: RegisterResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      if (data.success) {
        setMessage({ 
          type: 'success', 
          text: data.message || 'Registration successful! Please login.' 
        });
        
        setTimeout(() => {
          resetForm();
          onClose();
          onSwitchToLogin();
        }, 2000);
      } else {
        setMessage({ 
          type: 'error', 
          text: data.message || 'Registration failed. Please try again.' 
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Registration failed. Please check your connection and try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRegisterForm(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof RegisterForm]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value;
    setRegisterForm(prev => ({ 
      ...prev, 
      role: newRole, 
      adminKey: newRole === 'admin' ? prev.adminKey : '' 
    }));
    
    // Clear admin key error if switching to user
    if (newRole === 'user' && errors.adminKey) {
      setErrors(prev => ({ ...prev, adminKey: undefined }));
    }
  };

  const resetForm = () => {
    setRegisterForm({
      name: '',
      email: '',
      password: '',
      role: 'user',
      adminKey: ''
    });
    setErrors({});
    setMessage(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl md:rounded-3xl p-6 md:p-8 border border-white/20 shadow-2xl max-w-md w-full relative animate-slideInRight">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          disabled={loading}
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center">Create Account</h2>

        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            message.type === 'success' 
              ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
              : 'bg-red-500/20 text-red-300 border border-red-500/30'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="space-y-5">
            {/* Name field */}
            <div>
              <label className="block text-white/90 text-xs md:text-sm font-medium mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={registerForm.name}
                onChange={handleRegisterChange}
                className={`w-full px-3 md:px-4 py-2.5 md:py-3 bg-white/10 backdrop-blur-sm border rounded-xl text-white text-sm md:text-base placeholder-white/50 focus:outline-none transition-all ${
                  errors.name ? 'border-red-400/50' : 'border-white/20 focus:border-white/40'
                }`}
                placeholder="Enter your full name"
                disabled={loading}
              />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Email field */}
            <div>
              <label className="block text-white/90 text-xs md:text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={registerForm.email}
                onChange={handleRegisterChange}
                className={`w-full px-3 md:px-4 py-2.5 md:py-3 bg-white/10 backdrop-blur-sm border rounded-xl text-white text-sm md:text-base placeholder-white/50 focus:outline-none transition-all ${
                  errors.email ? 'border-red-400/50' : 'border-white/20 focus:border-white/40'
                }`}
                placeholder="Enter your email"
                disabled={loading}
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
                value={registerForm.password}
                onChange={handleRegisterChange}
                className={`w-full px-3 md:px-4 py-2.5 md:py-3 bg-white/10 backdrop-blur-sm border rounded-xl text-white text-sm md:text-base placeholder-white/50 focus:outline-none transition-all ${
                  errors.password ? 'border-red-400/50' : 'border-white/20 focus:border-white/40'
                }`}
                placeholder="Create a password"
                disabled={loading}
              />
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Role selection */}
            <div>
              <label className="block text-white/90 text-xs md:text-sm font-medium mb-2">
                Account Type
              </label>
              <select
                name="role"
                value={registerForm.role}
                onChange={handleRoleChange}
                className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white text-sm md:text-base focus:outline-none focus:border-white/40 transition-all"
                disabled={loading}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Admin Key field */}
            {registerForm.role === 'admin' && (
              <div>
                <label className="block text-white/90 text-xs md:text-sm font-medium mb-2">
                  Admin Key
                </label>
                <input
                  type="password"
                  name="adminKey"
                  value={registerForm.adminKey}
                  onChange={handleRegisterChange}
                  className={`w-full px-3 md:px-4 py-2.5 md:py-3 bg-white/10 backdrop-blur-sm border rounded-xl text-white text-sm md:text-base placeholder-white/50 focus:outline-none transition-all ${
                    errors.adminKey ? 'border-red-400/50' : 'border-white/20 focus:border-white/40'
                  }`}
                  placeholder="Enter admin key"
                  disabled={loading}
                />
                {errors.adminKey ? (
                  <p className="text-red-400 text-xs mt-1">{errors.adminKey}</p>
                ) : (
                  <p className="text-white/50 text-xs mt-1">Required for admin registration</p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 md:py-3 bg-gradient-to-r from-orange-400 via-pink-500 to-pink-600 rounded-xl text-white text-sm md:text-base font-semibold hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

            <div className="text-center pt-4">
              <p className="text-white/70 text-sm">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="text-orange-400 hover:text-pink-400 font-medium transition-colors underline disabled:opacity-50"
                  disabled={loading}
                >
                  Sign In
                </button>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterModal;
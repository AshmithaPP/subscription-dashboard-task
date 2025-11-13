import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home,  
  Settings, 
  CreditCard, 
  Bell,
  Menu,
  ChevronLeft,
  User,
  LogOut,
  X,
  Shield
} from 'lucide-react';
import Dashboard from './Dashboard';
import PlansPage from './PlansPage';
import AdminDashboard from '../pages/AdminDashboard';
import { authService } from '../types/authservice';

const DashboardLayout = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeItem, setActiveItem] = useState('dashboard');
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
// Add this state to DashboardLayout
const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);

// Add useEffect to load user data
useEffect(() => {
  // Load user data from localStorage or context
  const userData = localStorage.getItem('user_data');
  if (userData) {
    setUser(JSON.parse(userData));
  }
}, []);

// Update the logout function in DashboardLayout
const handleLogout = () => {
  // Clear all tokens and user data
  authService.clearTokens();
  // Clear user data specifically
  localStorage.removeItem('user_data');
  // Clear any other potential user data
  const userKeys = Object.keys(localStorage).filter(key =>
    key.includes('user') || key.includes('auth') || key.includes('token')
  );
  userKeys.forEach(key => localStorage.removeItem(key));

  // Clear sessionStorage as well
  sessionStorage.clear();

  // Navigate to login page
  navigate('/');
};
  // Filter menu items based on user role
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
    { id: 'plans', label: 'Plans', icon: CreditCard, path: '/dashboard/plans' },
    { id: 'notifications', label: 'Notifications', icon: Bell, path: '/dashboard/notifications' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/dashboard/settings' },
  ];

  // Add admin menu item only if user is admin
  if (user?.role === 'admin') {
    menuItems.splice(2, 0, { id: 'admin', label: 'Admin', icon: Shield, path: '/dashboard/admin' });
  }

  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsExpanded(false);
      } else {
        setIsExpanded(true);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Update active item based on current route
  useEffect(() => {
    const currentPath = location.pathname;
    console.log('Current path:', currentPath);
    
    if (currentPath === '/dashboard' || currentPath === '/dashboard/') {
      setActiveItem('dashboard');
      return;
    }

    const currentItem = menuItems.find(item => currentPath.startsWith(item.path));
    if (currentItem) {
      setActiveItem(currentItem.id);
    }
  }, [location.pathname]);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setIsExpanded(false);
    }
  };

  const handleNavigation = (item: any) => {
    console.log('Navigating to:', item.path);
    navigate(item.path);
    if (isMobile) {
      closeSidebar();
    }
  };

  return (
    <div className="flex h-screen bg-[#0f0f1f] overflow-hidden">
      {/* Sidebar - Fixed positioning on mobile */}
      <div 
        className={`
          bg-[#1a1a2e]/95 backdrop-blur-xl border-r border-white/10 transition-all duration-300 z-30
          ${isMobile ? 'fixed inset-y-0 left-0' : 'relative'}
          ${isExpanded ? 'w-64 translate-x-0' : isMobile ? '-translate-x-full' : 'w-20'}
        `}
      >
        {/* Close Button for Mobile */}
        {isMobile && isExpanded && (
          <button
            onClick={closeSidebar}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Toggle Button for Desktop */}
        {!isMobile && (
          <button
            onClick={toggleSidebar}
            className="absolute -right-3 top-6 bg-[#1a1a2e] border border-white/20 rounded-full p-1.5 hover:scale-110 transition-all z-20"
          >
            {isExpanded ? (
              <ChevronLeft className="w-4 h-4 text-white" />
            ) : (
              <Menu className="w-4 h-4 text-white" />
            )}
          </button>
        )}

        {/* Logo */}
        <div 
          className="p-6 border-b border-white/10 cursor-pointer hover:bg-white/5 transition-all"
          onClick={() => handleNavigation(menuItems[0])}
        >
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <div className="w-1.5 h-6 bg-white rounded"></div>
              <div className="w-1.5 h-6 bg-white rounded"></div>
            </div>
            {isExpanded && (
              <span className="text-white font-bold text-xl">SubTrack</span>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                  activeItem === item.id
                    ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/30 border border-white/20 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                } ${!isExpanded ? 'justify-center' : ''}`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${activeItem === item.id ? 'text-purple-300' : ''}`} />
                {isExpanded && (
                  <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>
                )}
                
                {/* Tooltip for collapsed state */}
                {!isExpanded && !isMobile && (
                  <div className="absolute left-full ml-2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Section */}
        <div className={`absolute bottom-4 ${isExpanded ? 'left-4 right-4' : 'left-2 right-2'}`}>
          <div className="border-t border-white/10 pt-4">
            <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-white/5">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
              {isExpanded && (
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">John Doe</p>
                  <p className="text-white/50 text-xs truncate">admin@example.com</p>
                </div>
              )}
            </div>
            
            {/* Logout Button */}
<button 
  onClick={handleLogout} // Changed from navigate('/')
  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all mt-2 ${
    !isExpanded ? 'justify-center' : ''
  }`}
>
  <LogOut className="w-5 h-5 flex-shrink-0" />
  {isExpanded && <span className="font-medium text-sm">Logout</span>}
</button>
          </div>
        </div>

        {/* Background decorative elements */}
        <div className="absolute top-20 -left-10 w-32 h-32 bg-purple-600 rounded-full opacity-10 blur-2xl"></div>
        <div className="absolute bottom-20 -right-10 w-32 h-32 bg-pink-600 rounded-full opacity-10 blur-2xl"></div>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 overflow-auto transition-all duration-300 ${
        !isMobile ? (isExpanded ? 'lg:ml-0' : 'lg:ml-20') : ''
      }`}>
        {/* Mobile Header with Menu Button */}
        {isMobile && (
          <div className="flex items-center gap-4 p-4 lg:hidden sticky top-0 bg-[#0f0f1f]/80 backdrop-blur-sm z-10 border-b border-white/10">
            <button
              onClick={toggleSidebar}
              className="bg-[#1a1a2e] border border-white/20 rounded-xl p-2 hover:scale-105 transition-all"
            >
              <Menu className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white capitalize">
                {activeItem.replace('-', ' ')}
              </h1>
            </div>
          </div>
        )}

        {/* Page Content */}
        <div className="min-h-full">
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="plans" element={<PlansPage />} />
            {user?.role === 'admin' && <Route path="admin" element={<AdminDashboard />} />}
            <Route path="subscriptions" element={
              <div className="p-8">
                <h1 className="text-3xl font-bold text-white mb-4">Subscriptions</h1>
                <p className="text-white/60">Subscriptions page content coming soon...</p>
              </div>
            } />
            <Route path="analytics" element={
              <div className="p-8">
                <h1 className="text-3xl font-bold text-white mb-4">Analytics</h1>
                <p className="text-white/60">Analytics page content coming soon...</p>
              </div>
            } />
            <Route path="notifications" element={
              <div className="p-8">
                <h1 className="text-3xl font-bold text-white mb-4">Notifications</h1>
                <p className="text-white/60">Notifications page content coming soon...</p>
              </div>
            } />
            <Route path="settings" element={
              <div className="p-8">
                <h1 className="text-3xl font-bold text-white mb-4">Settings</h1>
                <p className="text-white/60">Settings page content coming soon...</p>
              </div>
            } />
          </Routes>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobile && isExpanded && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden"
          onClick={closeSidebar}
        />
      )}
    </div>
  );
};

export default DashboardLayout;

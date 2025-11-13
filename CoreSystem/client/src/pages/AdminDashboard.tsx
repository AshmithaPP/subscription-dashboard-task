import { useState, useEffect } from 'react';
import { Search, Filter, Eye, Edit, Trash2, Download, Plus, ChevronLeft, ChevronRight, Loader, RefreshCw } from 'lucide-react';
import { authService } from '../types/authservice';

interface Subscription {
  subscription_id: string;
  user_id: string;
  plan_id: string;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_name: string;
  user_email: string;
  plan_name: string;
  plan_price: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    subscriptions: Subscription[];
    pagination: {
      current: number;
      total: number;
      pageSize: number;
      totalRecords: number;
    };
  };
}

const AdminDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    pageSize: 10,
    totalRecords: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const pageSize = 10;

  // Fetch subscriptions from API
  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = authService.getAccessToken();
      if (!token) {
        throw new Error('Authentication required. Please login again.');
      }

      console.log('Fetching subscriptions from API...');
      
      const response = await fetch('http://localhost:5000/api/admin/subscriptions', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      console.log(token);
      console.log('API Response status:', response.status);

      if (!response.ok) {
        let errorMessage = `Failed to fetch subscriptions: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
        }
        throw new Error(errorMessage);
      }

      const data: ApiResponse = await response.json();
      console.log('API Response data:', data);

      if (data.success && data.data) {
        setSubscriptions(data.data.subscriptions);
        setPagination(data.data.pagination);
        setCurrentPage(data.data.pagination.current);
      } else {
        throw new Error(data.message || 'Failed to fetch subscriptions');
      }
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching subscriptions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSubscriptions();
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  // Filter subscriptions based on search and status
  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.plan_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredSubscriptions.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedSubscriptions = filteredSubscriptions.slice(startIndex, startIndex + pageSize);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-400/20';
      case 'cancelled':
        return 'text-red-400 bg-red-400/20';
      case 'paused':
        return 'text-yellow-400 bg-yellow-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'Basic':
        return 'text-purple-400 bg-purple-400/20';
      case 'Pro':
        return 'text-orange-400 bg-orange-400/20';
      case 'Enterprise':
        return 'text-blue-400 bg-blue-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Calculate stats from real data
  const totalSubscriptions = subscriptions.length;
  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active').length;
  const cancelledSubscriptions = subscriptions.filter(sub => sub.status === 'cancelled').length;
  const monthlyRevenue = subscriptions
    .filter(sub => sub.status === 'active')
    .reduce((sum, sub) => sum + parseFloat(sub.plan_price), 0);

  // Loading state
  if (loading) {
    return (
      <div className="p-4 lg:p-8 flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white/70">Loading subscriptions...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 lg:p-8 flex items-center justify-center min-h-96">
        <div className="text-center max-w-md">
          <div className="text-red-400 text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-white mb-2">Failed to load data</h3>
          <p className="text-white/70 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={fetchSubscriptions}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-semibold hover:shadow-lg transition-all duration-300"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white font-semibold hover:bg-white/20 transition-all duration-300"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 lg:mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-white/60 text-sm lg:text-base">
            Manage all user subscriptions and billing information
          </p>
        </div>
        
        <div className="flex gap-3 mt-4 lg:mt-0">
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white text-sm transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white text-sm transition-all hover:scale-105">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white text-sm font-semibold hover:shadow-lg hover:scale-105 transition-all">
            <Plus className="w-4 h-4" />
            Add Subscription
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 lg:mb-8">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
          <p className="text-white/60 text-sm mb-1">Total Subscriptions</p>
          <p className="text-white text-2xl font-bold">{totalSubscriptions}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
          <p className="text-white/60 text-sm mb-1">Active</p>
          <p className="text-green-400 text-2xl font-bold">
            {activeSubscriptions}
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
          <p className="text-white/60 text-sm mb-1">Monthly Revenue</p>
          <p className="text-white text-2xl font-bold">
            ${monthlyRevenue.toFixed(2)}
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
          <p className="text-white/60 text-sm mb-1">Cancelled</p>
          <p className="text-red-400 text-2xl font-bold">
            {cancelledSubscriptions}
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 lg:p-6 border border-white/20 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
              <input
                type="text"
                placeholder="Search users, emails, or plans..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page when searching
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/20 rounded-xl text-white text-sm placeholder-white/40 focus:outline-none focus:border-white/40 transition-all"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => {
                setStatusFilter('all');
                setCurrentPage(1);
              }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                statusFilter === 'all'
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              All ({subscriptions.length})
            </button>
            <button
              onClick={() => {
                setStatusFilter('active');
                setCurrentPage(1);
              }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                statusFilter === 'active'
                  ? 'bg-green-500 text-white'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              Active ({activeSubscriptions})
            </button>
            <button
              onClick={() => {
                setStatusFilter('cancelled');
                setCurrentPage(1);
              }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                statusFilter === 'cancelled'
                  ? 'bg-red-500 text-white'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              Cancelled ({cancelledSubscriptions})
            </button>
            <button
              onClick={() => {
                setStatusFilter('paused');
                setCurrentPage(1);
              }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                statusFilter === 'paused'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              Paused ({subscriptions.filter(sub => sub.status === 'paused').length})
            </button>
          </div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-4 px-6 text-white/70 text-sm font-medium">User</th>
                <th className="text-left py-4 px-6 text-white/70 text-sm font-medium">Plan</th>
                <th className="text-left py-4 px-6 text-white/70 text-sm font-medium">Price</th>
                <th className="text-left py-4 px-6 text-white/70 text-sm font-medium">Status</th>
                <th className="text-left py-4 px-6 text-white/70 text-sm font-medium">Start Date</th>
                <th className="text-left py-4 px-6 text-white/70 text-sm font-medium">End Date</th>
                <th className="text-left py-4 px-6 text-white/70 text-sm font-medium">Created</th>
                <th className="text-left py-4 px-6 text-white/70 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSubscriptions.map((subscription) => (
                <tr key={subscription.subscription_id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                  <td className="py-4 px-6">
                    <div>
                      <p className="text-white font-medium text-sm">{subscription.user_name}</p>
                      <p className="text-white/50 text-xs">{subscription.user_email}</p>
                      <p className="text-white/40 text-xs mt-1">ID: {subscription.user_id.slice(0, 8)}...</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPlanColor(subscription.plan_name)}`}>
                        {subscription.plan_name}
                      </span>
                      <p className="text-white/40 text-xs mt-1">ID: {subscription.plan_id.slice(0, 8)}...</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-white font-medium">${subscription.plan_price}</p>
                    <p className="text-white/40 text-xs">monthly</p>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
                      {subscription.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-white/80 text-sm">{formatDate(subscription.start_date)}</td>
                  <td className="py-4 px-6 text-white/80 text-sm">{formatDate(subscription.end_date)}</td>
                  <td className="py-4 px-6 text-white/80 text-sm">{formatDateTime(subscription.created_at)}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 hover:bg-white/10 rounded-lg transition-all text-white/70 hover:text-white">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 hover:bg-white/10 rounded-lg transition-all text-white/70 hover:text-white">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 hover:bg-red-500/20 rounded-lg transition-all text-white/70 hover:text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredSubscriptions.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8 text-white/40" />
            </div>
            <h3 className="text-white text-lg font-semibold mb-2">
              {subscriptions.length === 0 ? 'No subscriptions found' : 'No matching subscriptions'}
            </h3>
            <p className="text-white/60 text-sm">
              {subscriptions.length === 0 
                ? 'There are no subscriptions in the system yet.' 
                : 'Try adjusting your search or filter criteria'
              }
            </p>
          </div>
        )}

        {/* Pagination */}
        {filteredSubscriptions.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
            <div className="text-white/60 text-sm">
              Showing {startIndex + 1} to {Math.min(startIndex + pageSize, filteredSubscriptions.length)} of {filteredSubscriptions.length} entries
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-white/5 border border-white/20 text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                    currentPage === page
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-white/5 border border-white/20 text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* API Info (for debugging) */}
      <div className="mt-4 text-center">
        <p className="text-white/40 text-xs">
          Total records: {pagination.totalRecords} | 
          Last updated: {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;
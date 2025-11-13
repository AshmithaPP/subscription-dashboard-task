import { useState, useEffect, type JSXElementConstructor, type Key, type ReactElement, type ReactNode, type ReactPortal } from 'react';
import { Pause, Edit, Trash2, Bell, Plus, Calendar, DollarSign, CheckCircle } from 'lucide-react';
import { subscriptionService, type Subscription } from '../types/subscriptionService';
import { authService } from '../types/authservice';

const Dashboard = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching subscription data...');
      const token = authService.getAccessToken();
      console.log('Current token:', token ? 'Present' : 'Missing');
      
      const result = await subscriptionService.getSubscriptionWithFallback();
      
      console.log('Subscription result:', result);
      
      if (result.hasSubscription && result.subscription) {
        setSubscription(result.subscription);
      } else {
        setSubscription(null);
      }
    } catch (err) {
      console.error('Error in fetchSubscriptionData:', err);
      setError(err instanceof Error ? err.message : 'Failed to load subscription data');
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-400/20';
      case 'cancelled':
        return 'text-red-400 bg-red-400/20';
      case 'paused':
        return 'text-yellow-400 bg-yellow-400/20';
      case 'inactive':
        return 'text-gray-400 bg-gray-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  const calculateDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (loading) {
    return (
      <div className="p-4 lg:p-8 flex items-center justify-center min-h-96">
        <div className="text-white text-lg">Loading subscription data...</div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Desktop Header */}
      <div className="hidden lg:flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">
            Current Subscriptions
          </h1>
          <p className="text-white/60 text-sm lg:text-base mt-2">
            Your active subscription plan and details
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center border border-white/20 hover:scale-105 transition-all cursor-pointer">
            <Bell className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Stats Overview - Only show real subscription stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-8">
          {/* Plan Status */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Current Plan</p>
                <p className="text-white text-xl font-bold mt-1 capitalize">
                  {subscription ? subscription.plan_name : 'No Plan'}
                </p>
                <p className={`text-xs mt-1 ${subscription ? 'text-green-400' : 'text-red-400'}`}>
                  {subscription ? subscription.status : 'Inactive'}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                subscription ? 'bg-green-500/20' : 'bg-red-500/20'
              }`}>
                {subscription ? (
                  <CheckCircle className="w-6 h-6 text-green-400" />
                ) : (
                  <Plus className="w-6 h-6 text-red-400" />
                )}
              </div>
            </div>
          </div>

          {/* Monthly Cost */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Monthly Cost</p>
                <p className="text-white text-2xl font-bold mt-1">
                  ${subscription ? subscription.plan_price.toFixed(2) : '0.00'}
                </p>
                <p className="text-white/60 text-xs mt-1">per month</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>

          {/* Days Remaining */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Days Remaining</p>
                <p className="text-white text-2xl font-bold mt-1">
                  {subscription ? calculateDaysRemaining(subscription.end_date) : '0'}
                </p>
                <p className="text-white/60 text-xs mt-1">
                  {subscription ? `of ${subscription.duration_days} days` : 'No active plan'}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>
        </div>

        {/* SubTrack Subscription Card - Show real API data */}
        {subscription && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Your SubTrack Plan</h2>
            <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-lg font-bold">
                    ST
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-xl">{subscription.plan_name} Plan</h3>
                    <p className="text-white/60">SubTrack Subscription</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription.status)}`}>
                    {subscription.status}
                  </span>
                  <p className="text-white text-2xl font-bold mt-2">${subscription.plan_price}</p>
                  <p className="text-white/60 text-sm">per month</p>
                </div>
              </div>

              {/* Plan Features - Updated to use plan_features */}
              <div className="mb-6">
                <h4 className="text-white font-semibold mb-3">Plan Features:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {subscription.plan_features.map((feature: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined, index: Key | null | undefined) => (
                    <div key={index} className="flex items-center gap-2 text-white/80">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subscription Details */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-white/10">
                <div>
                  <p className="text-white/60 text-sm">Start Date</p>
                  <p className="text-white font-medium">{formatDate(subscription.start_date)}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">End Date</p>
                  <p className="text-white font-medium">{formatDate(subscription.end_date)}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">Days Remaining</p>
                  <p className="text-white font-medium">
                    {calculateDaysRemaining(subscription.end_date)} days
                  </p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">Duration</p>
                  <p className="text-white font-medium">{subscription.duration_days} days</p>
                </div>
              </div>

              {/* Subscription ID (for reference) */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-white/60 text-sm">Subscription ID</p>
                <p className="text-white/80 text-sm font-mono truncate">
                  {subscription.subscription_id}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* No Subscription Message */}
        {!subscription && !loading && (
          <div className="mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center">
              <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-orange-400" />
              </div>
              <h3 className="text-white text-xl font-bold mb-2">No Active Subscription</h3>
              <p className="text-white/60 mb-6">
                You don't have an active SubTrack subscription. Choose a plan to get started.
              </p>
              <button 
                onClick={() => window.location.href = '/dashboard/plans'}
                className="px-6 py-3 bg-gradient-to-r from-orange-400 to-pink-500 rounded-xl text-white font-semibold hover:shadow-lg hover:scale-105 transition-all"
              >
                Browse Plans
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-8">
            <div className="bg-red-500/20 backdrop-blur-lg rounded-2xl p-6 border border-red-500/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                  <span className="text-red-400 text-sm">!</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold">Error Loading Subscription</h3>
                  <p className="text-white/60 text-sm">{error}</p>
                </div>
              </div>
              <button 
                onClick={fetchSubscriptionData}
                className="mt-4 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm hover:bg-white/20 transition-all"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Additional Information */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
          <h3 className="text-white font-semibold mb-4">Subscription Management</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white text-sm transition-all">
              <Edit className="w-4 h-4" />
              Upgrade Plan
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white text-sm transition-all">
              <Pause className="w-4 h-4" />
              Pause Subscription
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl text-red-400 text-sm transition-all">
              <Trash2 className="w-4 h-4" />
              Cancel Subscription
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
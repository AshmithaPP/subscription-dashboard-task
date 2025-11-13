import { useState, useEffect } from 'react';
import { Check, Crown, Zap, Building, Loader } from 'lucide-react';
import { authService } from '../types/authservice';

interface Plan {
  plan_id: string;
  name: string;
  price: number;
  features: string[];
  duration_days: number;
  created_at: string;
  updated_at: string;
  icon?: any;
  gradient?: string;
  description?: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: Plan[];
}

interface SubscribeResponse {
  success: boolean;
  message: string;
  data: {
    subscription: {
      subscription_id: string;
      user_id: string;
      plan_id: string;
      start_date: string;
      end_date: string;
      status: string;
      created_at: string;
      updated_at: string;
      plan_name: string;
      plan_price: number;
      features: string[];
    };
  };
}

// Define the plan IDs directly
const PLAN_IDS = {
  Basic: 'bee53216-37e0-4f81-b9b5-76a353d3729d',
  Pro: 'ace7cd37-2f8b-4557-8059-bd682e2289f7',
  Enterprise: 'f4bd6616-cb0f-41f7-a83a-be0bbb8ec9c1'
};

const PlansPage = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [plansData, setPlansData] = useState<Plan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [subscriptionMessage, setSubscriptionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Map plan names to icons and gradients
  const planConfigs = {
    Basic: {
      icon: Zap,
      gradient: "from-purple-500 to-pink-500",
      description: "For personal use and exploration of AI technology."
    },
    Pro: {
      icon: Crown,
      gradient: "from-orange-400 to-pink-500",
      description: "Perfect for professionals and small businesses in need of significant AI integration."
    },
    Enterprise: {
      icon: Building,
      gradient: "from-blue-500 to-purple-500",
      description: "Perfect for large businesses or organizations that require specialized support."
    }
  };

  // Fetch plans from API
  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:5000/api/plans');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch plans: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      
      if (data.success && data.data) {
        // Enhance the API data with UI configurations
        const enhancedPlans = data.data.map(plan => ({
          ...plan,
          ...planConfigs[plan.name as keyof typeof planConfigs]
        }));
        
        setPlansData(enhancedPlans);
      } else {
        throw new Error(data.message || 'Failed to fetch plans');
      }
    } catch (err) {
      console.error('Error fetching plans:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching plans');
      
      // Fallback to predefined plans if API fails
      setPlansData(getPredefinedPlans());
    } finally {
      setLoading(false);
    }
  };

  // Predefined plans as fallback
  const getPredefinedPlans = (): Plan[] => {
    return [
      {
        plan_id: PLAN_IDS.Basic,
        name: 'Basic',
        price: 9.99,
        features: [
          "10 Projects",
          "5GB Storage", 
          "Basic Support",
          "Email Support"
        ],
        duration_days: 30,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        icon: Zap,
        gradient: "from-purple-500 to-pink-500",
        description: "For personal use and exploration of AI technology."
      },
      {
        plan_id: PLAN_IDS.Pro,
        name: 'Pro',
        price: 19.99,
        features: [
          "50 Projects",
          "50GB Storage",
          "Priority Support",
          "Phone & Email Support",
          "Advanced Analytics"
        ],
        duration_days: 30,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        icon: Crown,
        gradient: "from-orange-400 to-pink-500",
        description: "Perfect for professionals and small businesses in need of significant AI integration."
      },
      {
        plan_id: PLAN_IDS.Enterprise,
        name: 'Enterprise',
        price: 49.99,
        features: [
          "Unlimited Projects",
          "500GB Storage",
          "24/7 Dedicated Support",
          "Custom Integrations",
          "Advanced Security",
          "SLA Guarantee"
        ],
        duration_days: 30,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        icon: Building,
        gradient: "from-blue-500 to-purple-500",
        description: "Perfect for large businesses or organizations that require specialized support."
      }
    ];
  };

  // Subscribe to plan API
  const subscribeToPlan = async (planId: string, planName: string) => {
    try {
      setSubscribing(planId);
      setSubscriptionMessage(null);

      // Check if user is authenticated
      if (!authService.isAuthenticated()) {
        throw new Error('Your session has expired. Please login again to subscribe to a plan.');
      }

      const token = authService.getAccessToken();
      console.log('Current token:', token);

      console.log('Subscribing to plan:', planId);
      
      const response = await fetch(`http://localhost:5000/api/subscribe/${planId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
       console.log('token from planspage',token);

      console.log('Subscription response status:', response.status);

      if (!response.ok) {
        // Try to parse error response
        let errorMessage = `Subscription failed with status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
        }
        throw new Error(errorMessage);
      }

      const data: SubscribeResponse = await response.json();
      console.log('Subscription success data:', data);
      
      if (data.success) {
        setSubscriptionMessage({
          type: 'success',
          text: `Successfully subscribed to ${planName} plan! Redirecting...`
        });

        // Store subscription data in localStorage for immediate access
        localStorage.setItem('current_subscription', JSON.stringify(data.data.subscription));

        // Redirect to dashboard after successful subscription
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      } else {
        throw new Error(data.message || 'Subscription failed');
      }
    } catch (err) {
      console.error('Subscription error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to subscribe. Please try again.';
      
      setSubscriptionMessage({
        type: 'error',
        text: errorMessage
      });

      // Redirect to login if token is missing
      if (errorMessage.includes('login')) {
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      }
    } finally {
      setSubscribing(null);
    }
  };

  const handleSubscribe = async (planId: string, planName: string) => {
    console.log('Subscribe button clicked for:', planName, planId);
    setSelectedPlan(planId);
    await subscribeToPlan(planId, planName);
  };

  const handleRetry = () => {
    fetchPlans();
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f1f] p-4 lg:p-8 overflow-auto flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white/70">Loading plans...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#0f0f1f] p-4 lg:p-8 overflow-auto flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-400 text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-white mb-2">Failed to load plans</h3>
          <p className="text-white/70 mb-6">{error}</p>
          <button
            onClick={handleRetry}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-semibold transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (plansData.length === 0) {
    return (
      <div className="min-h-screen bg-[#0f0f1f] p-4 lg:p-8 overflow-auto flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-white/50 text-4xl mb-4">📋</div>
          <h3 className="text-xl font-bold text-white mb-2">No plans available</h3>
          <p className="text-white/70 mb-6">There are no subscription plans available at the moment.</p>
          <button
            onClick={handleRetry}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-semibold transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f1f] p-4 lg:p-8 overflow-auto">
      {/* Background decorative elements */}
      <div className="fixed top-10 left-10 md:top-20 md:left-20 w-48 h-48 md:w-96 md:h-96 bg-purple-600 rounded-full opacity-20 blur-3xl animate-pulse"></div>
      <div className="fixed bottom-10 right-10 md:bottom-20 md:right-20 w-48 h-48 md:w-96 md:h-96 bg-pink-600 rounded-full opacity-20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="fixed top-1/2 left-1/4 w-32 h-32 md:w-64 md:h-64 bg-blue-600 rounded-full opacity-10 blur-3xl"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center mb-8 lg:mb-12">
          <h1 className="text-3xl lg:text-5xl font-bold text-white mb-4 animate-slideInLeft">
            Choose your plan
          </h1>
          <div className="w-20 h-1 bg-gradient-to-r from-orange-400 to-pink-500 mx-auto mb-4"></div>
          <p className="text-white/70 text-base lg:text-lg max-w-2xl mx-auto">
            Unlock endless possibilities with our flexible pricing plans
          </p>
        </div>

        {/* Subscription Message */}
        {subscriptionMessage && (
          <div className={`max-w-2xl mx-auto mb-6 p-4 rounded-lg ${
            subscriptionMessage.type === 'success' 
              ? 'bg-green-500/20 border border-green-500/30 text-green-300' 
              : 'bg-red-500/20 border border-red-500/30 text-red-300'
          }`}>
            <div className="flex items-center justify-center gap-2">
              {subscriptionMessage.type === 'success' ? (
                <Check className="w-5 h-5" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-red-400 flex items-center justify-center">
                  <span className="text-white text-sm">!</span>
                </div>
              )}
              <span className="text-sm">{subscriptionMessage.text}</span>
            </div>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 max-w-6xl mx-auto">
          {plansData.map((plan) => {
            const IconComponent = plan.icon;
            const isSubscribing = subscribing === plan.plan_id;
            const isDisabled = isSubscribing || !!subscribing;
            
            return (
              <div
                key={plan.plan_id}
                className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 lg:p-6 border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 group relative overflow-hidden cursor-default"
              >
                {/* Background Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl`}></div>
                
                {/* Plan Header */}
                <div className="text-center mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${plan.gradient} flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform duration-300`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl lg:text-2xl font-bold text-white mb-1">{plan.name}</h3>
                  <p className="text-white/60 text-xs lg:text-sm leading-relaxed line-clamp-2">
                    {plan.description}
                  </p>
                </div>

                {/* Price Section */}
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <span className="text-2xl lg:text-3xl font-bold text-white">${plan.price}</span>
                    <span className="text-white/60 text-sm">/month</span>
                  </div>
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-3"></div>
                </div>

                {/* Features List */}
                <div className="space-y-2 mb-4">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                        <Check className="w-2.5 h-2.5 text-green-400" />
                      </div>
                      <span className="text-white/80 text-xs lg:text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Subscribe Button */}
                <button
                  onClick={() => handleSubscribe(plan.plan_id, plan.name)}
                  disabled={isDisabled}
                  className={`
                    w-full py-2.5 lg:py-3 bg-gradient-to-r ${plan.gradient}
                    rounded-lg text-white font-semibold text-sm lg:text-base
                    border border-white/20 flex items-center justify-center gap-2
                    transition-all duration-300
                    ${isDisabled
                      ? 'opacity-50 cursor-not-allowed transform-none'
                      : 'hover:shadow-lg hover:scale-105 hover:brightness-110 cursor-pointer'
                    }
                  `}
                >
                  {isSubscribing ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Subscribing...
                    </>
                  ) : (
                    'Subscribe Now'
                  )}
                </button>

                {/* Popular Badge for Pro Plan */}
                {plan.name === "Pro" && (
                  <div className="absolute top-3 right-3">
                    <div className="bg-gradient-to-r from-orange-400 to-pink-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                      POPULAR
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Additional Info Section */}
        <div className="text-center mt-8 lg:mt-12">
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 lg:p-6 border border-white/10 max-w-4xl mx-auto">
            <h3 className="text-xl lg:text-2xl font-bold text-white mb-3">
              Need a custom solution?
            </h3>
            <p className="text-white/60 text-sm lg:text-base mb-4 leading-relaxed">
              Contact our sales team to discuss enterprise-grade solutions tailored to your specific needs.
            </p>
            <button className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white font-semibold text-sm lg:text-base hover:shadow-lg hover:scale-105 transition-all duration-300 border border-white/20 cursor-pointer">
              Contact Sales
            </button>
          </div>
        </div>

        {/* Download Section */}
        <div className="text-center mt-8 lg:mt-12 pt-6 border-t border-white/10">
          <h3 className="text-xl lg:text-2xl font-bold text-white mb-3">
            Ready to get started?
          </h3>
          <p className="text-white/60 text-sm lg:text-base mb-4">
            Download our app and start your journey today.
          </p>
          <button className="px-6 py-2.5 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg text-white font-semibold text-sm lg:text-base hover:shadow-lg hover:scale-105 transition-all duration-300 border border-white/20 cursor-pointer">
            Download
          </button>
        </div>

        {/* Debug Info (remove in production) */}
        <div className="mt-8 text-center">
          <p className="text-white/40 text-xs">
            Plan IDs: Basic ({PLAN_IDS.Basic.slice(0, 8)}...), 
            Pro ({PLAN_IDS.Pro.slice(0, 8)}...), 
            Enterprise ({PLAN_IDS.Enterprise.slice(0, 8)}...)
          </p>
        </div>
      </div>

      <style>{`
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

  .animate-slideInLeft {
    animation: slideInLeft 0.8s ease-out;
  }

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`}</style>

    </div>
  );
};

export default PlansPage;
import { authService } from '../types/authservice';

// Update interface to match actual API response
export interface Subscription {
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
  plan_features: string[]; // Changed from 'features' to 'plan_features'
  duration_days: number;
}

export interface SubscriptionResponse {
  success: boolean;
  message: string;
  data: Subscription; // Changed from { subscription: Subscription | null } to direct Subscription
}

class SubscriptionService {
  private readonly API_BASE_URL = 'http://localhost:5000/api';

  async getMySubscription(): Promise<SubscriptionResponse> {
    try {
      const token = authService.getAccessToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${this.API_BASE_URL}/my-subscription`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        // Handle "No active subscription found" case
        if (response.status === 404) {
          throw new Error('No active subscription found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: SubscriptionResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching subscription:', error);
      throw error;
    }
  }
// Add this method to your existing SubscriptionService class
async subscribeToPlan(planId: string): Promise<SubscriptionResponse> {
  try {
    const token = authService.getAccessToken();
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${this.API_BASE_URL}/subscribe/${planId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: SubscriptionResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error subscribing to plan:', error);
    throw error;
  }
}
  // Updated method to handle the actual API response structure
  async getSubscriptionWithFallback(): Promise<{
    hasSubscription: boolean;
    subscription: Subscription | null;
    message: string;
  }> {
    try {
      const response = await this.getMySubscription();
      return {
        hasSubscription: response.success && response.data !== null,
        subscription: response.data,
        message: response.message
      };
    } catch (error) {
      if (error instanceof Error && error.message === 'No active subscription found') {
        return {
          hasSubscription: false,
          subscription: null,
          message: 'No active subscription found'
        };
      }
      return {
        hasSubscription: false,
        subscription: null,
        message: 'Failed to fetch subscription data'
      };
    }
  }
}

export const subscriptionService = new SubscriptionService();
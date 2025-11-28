const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const TOKEN_EXPIRY_KEY = 'token_expiry';

// Token expiry time (15 minutes for access token, 7 days for refresh token)
const ACCESS_TOKEN_EXPIRY = 15 * 60 * 1000; // 15 minutes
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

class AuthService {
private autoLogoutInterval: ReturnType<typeof setTimeout> | null = null;
  // private isInitialized = false;

  // Store tokens securely
  storeTokens(accessToken: string, refreshToken: string): void {
    try {
      if (!accessToken || !refreshToken) {
        console.error('Invalid tokens provided');
        return;
      }

      const accessTokenExpiry = Date.now() + ACCESS_TOKEN_EXPIRY;
      // const refreshTokenExpiry = Date.now() + REFRESH_TOKEN_EXPIRY;

      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      localStorage.setItem(TOKEN_EXPIRY_KEY, accessTokenExpiry.toString());

      console.log(' Tokens stored successfully');

      // Also set cookies as backup
      this.setCookie(ACCESS_TOKEN_KEY, accessToken, ACCESS_TOKEN_EXPIRY);
      this.setCookie(REFRESH_TOKEN_KEY, refreshToken, REFRESH_TOKEN_EXPIRY);

    } catch (error) {
      console.error('Error storing tokens:', error);
    }
  }

  private setCookie(name: string, value: string, expiryMs: number): void {
    try {
      const expiryDate = new Date(Date.now() + expiryMs);
      document.cookie = `${name}=${value}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
    } catch (error) {
      console.error('Error setting cookie:', error);
    }
  }

  // Get access token from localStorage
  getAccessToken(): string | null {
    try {
      return localStorage.getItem(ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  getRefreshToken(): string | null {
    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  // Check if token is expired
  isTokenExpired(): boolean {
    try {
      const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
      if (!expiry) return true;
      
      return Date.now() > parseInt(expiry);
    } catch (error) {
      console.error('Error checking token expiry:', error);
      return true;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    return !!token && !this.isTokenExpired();
  }

  // Clear all tokens
  clearTokens(): void {
    try {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(TOKEN_EXPIRY_KEY);
      
      // Clear cookies
      document.cookie = `${ACCESS_TOKEN_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${REFRESH_TOKEN_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      
      console.log(' Tokens cleared');
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }

  // Setup auto logout - only call this after successful login
  setupAutoLogout(onLogout: () => void): void {
    // Clear any existing interval
    if (this.autoLogoutInterval) {
      clearInterval(this.autoLogoutInterval);
    }

    // Only setup if user is authenticated
    if (!this.isAuthenticated()) {
      console.log('User not authenticated, skipping auto-logout setup');
      return;
    }

    console.log('Setting up auto-logout check...');

    const checkToken = () => {
      if (this.isTokenExpired()) {
        console.log('Token expired, logging out...');
        this.clearTokens();
        onLogout();
        
        // Clear the interval after logout
        if (this.autoLogoutInterval) {
          clearInterval(this.autoLogoutInterval);
          this.autoLogoutInterval = null;
        }
      }
    };

    // Check token every 30 seconds instead of every minute
    this.autoLogoutInterval = setInterval(checkToken, 30000);
    
    // Also check when tab becomes active
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkToken();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initial check
    checkToken();
  }

  // Cleanup method to call when component unmounts
  cleanup(): void {
    if (this.autoLogoutInterval) {
      clearInterval(this.autoLogoutInterval);
      this.autoLogoutInterval = null;
    }
  }

  // Debug method
  debugAuth(): void {
    console.log(' Auth Debug:');
    console.log('Access Token:', this.getAccessToken() ? 'Present' : 'Missing');
    console.log('Refresh Token:', this.getRefreshToken() ? 'Present' : 'Missing');
    console.log('Token Expiry:', localStorage.getItem(TOKEN_EXPIRY_KEY));
    console.log('Is Authenticated:', this.isAuthenticated());
    console.log('Is Token Expired:', this.isTokenExpired());
    console.log('All cookies:', document.cookie);
  }
}

export const authService = new AuthService();
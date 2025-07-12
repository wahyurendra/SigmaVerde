// API Service for SigmaVerde Application
const API_BASE_URL = 'http://203.194.113.33';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.timeout = 10000; // 10 seconds timeout
    console.log('🚀 ApiService initialized', {
      baseURL: this.baseURL,
      timeout: this.timeout
    });
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const requestId = Math.random().toString(36).substr(2, 9);
    
    console.log(`📤 [${requestId}] API Request initiated`, {
      endpoint,
      url,
      method: options.method || 'GET',
      timestamp: new Date().toISOString()
    });
    
    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: this.timeout,
    };

    const config = { ...defaultOptions, ...options };

    // Add authorization header if token exists
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`🔐 [${requestId}] Authorization token added`);
    } else {
      console.log(`⚠️ [${requestId}] No authorization token found`);
    }

    // Log request details (excluding sensitive data)
    const logConfig = { ...config };
    if (logConfig.headers.Authorization) {
      logConfig.headers.Authorization = 'Bearer [REDACTED]';
    }
    console.log(`📋 [${requestId}] Request config:`, logConfig);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log(`⏰ [${requestId}] Request timeout triggered after ${this.timeout}ms`);
        controller.abort();
      }, this.timeout);

      const startTime = performance.now();
      console.log(`⏳ [${requestId}] Sending request...`);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);

      clearTimeout(timeoutId);

      console.log(`📥 [${requestId}] Response received`, {
        status: response.status,
        statusText: response.statusText,
        duration: `${duration}ms`,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        console.error(`❌ [${requestId}] HTTP Error Response`, {
          status: response.status,
          statusText: response.statusText,
          url
        });

        const errorData = await response.json().catch(() => ({}));
        console.error(`❌ [${requestId}] Error data:`, errorData);
        
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log(`✅ [${requestId}] Request successful`, {
        dataKeys: Object.keys(responseData),
        duration: `${duration}ms`
      });

      // Log response data (be careful with sensitive information)
      if (process.env.NODE_ENV === 'development') {
        console.log(`📊 [${requestId}] Response data:`, responseData);
      }

      return responseData;
    } catch (error) {
      console.error(`💥 [${requestId}] Request failed`, {
        error: error.message,
        name: error.name,
        endpoint,
        url
      });

      if (error.name === 'AbortError') {
        console.error(`⏰ [${requestId}] Request timeout after ${this.timeout}ms`);
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  // Authentication methods
  async login(credentials) {
    console.log('🔑 Login attempt', {
      username: credentials.username || credentials.email || '[not provided]',
      timestamp: new Date().toISOString()
    });

    try {
      const result = await this.request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      
      console.log('✅ Login successful');
      return result;
    } catch (error) {
      console.error('❌ Login failed:', error.message);
      throw error;
    }
  }

  async logout() {
    console.log('🚪 Logout attempt');
    
    try {
      const result = await this.request('/auth/logout', {
        method: 'POST',
      });
      
      console.log('✅ Logout successful');
      return result;
    } catch (error) {
      console.error('❌ Logout failed:', error.message);
      throw error;
    }
  }

  async refreshToken(refreshToken) {
    console.log('🔄 Token refresh attempt');
    
    try {
      const result = await this.request('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      
      console.log('✅ Token refresh successful');
      return result;
    } catch (error) {
      console.error('❌ Token refresh failed:', error.message);
      throw error;
    }
  }

  // async getProfile() {
  //   console.log('👤 Fetching user profile');
    
  //   try {
  //     const result = await this.request('/auth/profile');
  //     console.log('✅ Profile fetched successfully');
  //     return result;
  //   } catch (error) {
  //     console.error('❌ Profile fetch failed:', error.message);
  //     throw error;
  //   }
  // }

  // Health check
  async healthCheck() {
    console.log('🏥 Health check initiated');
    
    try {
      const result = await this.request('/health');
      console.log('✅ Health check passed:', result);
      return result;
    } catch (error) {
      console.error('❌ Health check failed:', error.message);
      return { status: 'error', message: error.message };
    }
  }
}

// Create and export a singleton instance
console.log('🔧 Creating ApiService singleton instance');
const apiService = new ApiService();

// Log when the service is ready
console.log('✨ SigmaVerde ApiService ready for use');

export default apiService;

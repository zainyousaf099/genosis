/**
 * API Client for centralized API calls
 * Handles authentication and API requests
 */

import { getApiUrl } from './config.js';

// API Client class
class ApiClient {
    constructor() {
        this.baseURL = getApiUrl('').replace(/\/$/, ''); // Remove trailing slash
        this.token = localStorage.getItem('auth_token');
    }

    /**
     * Make authenticated API request
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };
        
        // Add auth token if available
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        console.log(`[API Client] Making request to: ${url}`, {
            method: options.method || 'GET',
            headers: headers
        });

        try {
            // Try without credentials first (since API has Access-Control-Allow-Origin: *)
            // If your API requires cookies, your backend needs to specify exact origin, not *
            const fetchOptions = {
                ...options,
                headers,
                // Only include credentials if needed - causes CORS issues with Access-Control-Allow-Origin: *
                // credentials: 'include', // Uncomment if backend allows specific origin
            };
            
            console.log('[API Client] Fetch options:', {
                method: fetchOptions.method,
                url: url,
                hasCredentials: fetchOptions.credentials === 'include',
                headers: headers
            });
            
            const response = await fetch(url, fetchOptions);
            
            console.log(`[API Client] Response status: ${response.status}`, {
                ok: response.ok,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries())
            });

            // Handle different status codes
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: response.statusText }));
                throw new ApiError(errorData.message || 'Request failed', response.status, errorData);
            }

            return await response.json();
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            
            // Handle CORS errors specifically - "Failed to fetch" often means CORS
            const isCorsError = error.message && (
                error.message.includes('CORS') || 
                error.message.includes('Access-Control') ||
                error.message.includes('Failed to fetch') ||
                error.message.includes('NetworkError') ||
                error.name === 'TypeError'
            );
            
            if (isCorsError) {
                let corsMessage = `CORS Error: Cannot connect to API at ${url}\n\n`;
                corsMessage += `Your API returns "Access-Control-Allow-Origin: *" which works, but:\n`;
                corsMessage += `1. Make sure your backend allows OPTIONS preflight requests\n`;
                corsMessage += `2. If using credentials, backend must specify exact origin, not "*"\n`;
                corsMessage += `3. Check Network tab → Request → check for preflight (OPTIONS) request\n\n`;
                corsMessage += `Current origin: ${window.location.origin}\n`;
                corsMessage += `API URL: ${url}\n\n`;
                corsMessage += `Test in browser console:\n`;
                corsMessage += `fetch('${url}', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({username:'test',password:'test'}) }).then(r => console.log('Success:', r.status)).catch(e => console.log('Error:', e))`;
                
                throw new ApiError(
                    corsMessage,
                    0,
                    { 
                        originalError: error.message,
                        url: url,
                        isCorsError: true,
                        origin: window.location.origin
                    }
                );
            }
            
            // Handle network errors (connection refused, etc.)
            if (error.message && (error.message.includes('ERR_FAILED'))) {
                console.error(`[API Client] Network error details:`, {
                    url: url,
                    error: error.message,
                    baseURL: this.baseURL,
                    endpoint: endpoint
                });
                
                // Check if it might be a wrong URL (404 vs CORS vs network)
                let errorMessage = `Cannot connect to API server at ${url}.\n\n`;
                errorMessage += `Possible issues:\n`;
                errorMessage += `1. API endpoint might not have /api prefix - try: https://api.rjautonomous.com/auth/login\n`;
                errorMessage += `2. Your backend server might not be running\n`;
                errorMessage += `3. CORS might not be enabled on your backend\n`;
                errorMessage += `4. Check Network tab in DevTools to see actual error\n\n`;
                errorMessage += `To test, open browser console and run:\n`;
                errorMessage += `localStorage.setItem('API_BASE_URL', 'https://api.rjautonomous.com');`;
                
                throw new ApiError(
                    errorMessage,
                    0,
                    { 
                        originalError: error.message,
                        url: url,
                        isNetworkError: true
                    }
                );
            }
            
            // Handle other network errors
            throw new ApiError(
                `Network error: ${error.message}`,
                0,
                { originalError: error.message }
            );
        }
    }

    /**
     * POST request
     */
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    /**
     * GET request
     */
    async get(endpoint) {
        return this.request(endpoint, {
            method: 'GET',
        });
    }

    /**
     * PUT request
     */
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    /**
     * DELETE request
     */
    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE',
        });
    }

    /**
     * Set authentication token
     */
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('auth_token', token);
        } else {
            localStorage.removeItem('auth_token');
        }
    }

    /**
     * Clear authentication token
     */
    clearToken() {
        this.token = null;
        localStorage.removeItem('auth_token');
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return !!this.token;
    }
}

// Custom Error class
class ApiError extends Error {
    constructor(message, status, data = {}) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}

// Export singleton instance
const apiClient = new ApiClient();

// Export class and instance
export { ApiClient, ApiError };
export default apiClient;


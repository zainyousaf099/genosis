/**
 * Configuration module for API settings
 */

/**
 * Get the API base URL
 * Automatically detects development vs production environment
 * @param {string} endpoint - API endpoint path
 * @returns {string} Full API URL
 */
export function getApiUrl(endpoint = '') {
    // You can override this by setting API_BASE_URL in localStorage
    // Example: localStorage.setItem('API_BASE_URL', 'http://localhost:3000/api');
    // Or without /api: localStorage.setItem('API_BASE_URL', 'https://api.rjautonomous.com');
    const customUrl = localStorage.getItem('API_BASE_URL');
    
    let BASE_URL;
    
    if (customUrl) {
        // Use custom URL from localStorage if set (useful for development)
        BASE_URL = customUrl;
    } else {
        // Production API URL - Live server
        BASE_URL = 'https://api.rjautonomous.com';
        
        // Local API URL for development (uncomment to use local API)
        // BASE_URL = 'http://127.0.0.1:5000';
    }
    
    // Remove leading slash from endpoint if present
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    
    // Construct full URL
    const fullUrl = `${BASE_URL}/${cleanEndpoint}`.replace(/\/+/g, '/').replace(/:\//, '://');
    
    return fullUrl;
}

/**
 * Export configuration constants
 */
export const API_CONFIG = {
    // Production API base URL - Live server
    BASE_URL: 'https://api.rjautonomous.com',
    
    // Local API base URL for development (uncomment to use local API)
    // BASE_URL: 'http://127.0.0.1:5000',
    
    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
};


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
        // NOTE: Change this based on your actual API structure:
        // If endpoints are: https://api.rjautonomous.com/auth/login → use 'https://api.rjautonomous.com'
        // If endpoints are: https://api.rjautonomous.com/api/auth/login → use 'https://api.rjautonomous.com/api'
        
        // Production API URL - confirmed structure
        BASE_URL = 'https://api.rjautonomous.com';
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
    // Production API base URL
    // Change this if your API structure is different
    BASE_URL: 'https://api.rjautonomous.com', // Try without /api first
    // BASE_URL: 'https://api.rjautonomous.com/api', // If endpoints have /api prefix
    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
};


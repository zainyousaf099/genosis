/**
 * Login Page Handler
 * Integrates with centralized API system
 */

import { signIn, isAuthenticated } from './auth-api.js';

// Check if user is already logged in
if (isAuthenticated()) {
    window.location.href = 'dashboard.html';
}

// Get form elements
const loginForm = document.querySelector('.login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const submitButton = loginForm?.querySelector('button[type="submit"]');

// Show error message
function showError(message) {
    // Remove existing error message
    const existingError = document.querySelector('.login-error');
    if (existingError) {
        existingError.remove();
    }

    // Create error message element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'login-error';
    errorDiv.style.cssText = `
        background-color: #fee2e2;
        color: #dc2626;
        padding: 12px;
        border-radius: 8px;
        margin-bottom: 16px;
        border: 1px solid #fecaca;
        font-size: 14px;
        white-space: pre-line;
        line-height: 1.5;
    `;
    errorDiv.textContent = message;
    
    // Insert before the form
    if (loginForm) {
        loginForm.insertBefore(errorDiv, loginForm.firstChild);
    }
}

// Show success message
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'login-success';
    successDiv.style.cssText = `
        background-color: #d1fae5;
        color: #065f46;
        padding: 12px;
        border-radius: 8px;
        margin-bottom: 16px;
        border: 1px solid #a7f3d0;
        font-size: 14px;
    `;
    successDiv.textContent = message;
    
    if (loginForm) {
        loginForm.insertBefore(successDiv, loginForm.firstChild);
    }
}

// Handle form submission
if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Remove existing error messages
        const existingError = document.querySelector('.login-error');
        if (existingError) {
            existingError.remove();
        }

        // Get form values
        const username = usernameInput?.value.trim();
        const password = passwordInput?.value;

        // Validation
        if (!username || !password) {
            showError('Please enter both username/email and password.');
            return;
        }

        // Disable submit button
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Signing in...';
        }

        try {
            // Call sign in API
            const response = await signIn(username, password);
            
            // Show success message
            showSuccess('Login successful! Redirecting...');
            
            // Redirect to dashboard after successful login
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 500);
        } catch (error) {
            // Handle errors
            let errorMessage = 'Login failed. Please try again.';
            
            if (error.message) {
                errorMessage = error.message;
            } else if (error.data && error.data.message) {
                errorMessage = error.data.message;
            }
            
            showError(errorMessage);
            
            // Re-enable submit button
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = 'Sign In';
            }
        }
    });
}

// Handle social login buttons (placeholder for future implementation)
document.querySelectorAll('.google-btn, .apple-btn, .outlook-btn').forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        alert('Social login coming soon!');
    });
});

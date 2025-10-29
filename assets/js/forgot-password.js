/**
 * Forgot Password Page Handler
 * Handles password reset request
 */

import apiClient from './api-client.js';

// Get form elements
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
const emailInput = document.getElementById('email');
const submitButton = forgotPasswordForm?.querySelector('button[type="submit"]');

// Show error message
function showError(message) {
    const existingError = document.querySelector('.login-error');
    if (existingError) {
        existingError.remove();
    }

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
    
    if (forgotPasswordForm) {
        forgotPasswordForm.insertBefore(errorDiv, forgotPasswordForm.firstChild);
    }
}

// Show success message
function showSuccess(message) {
    const existingSuccess = document.querySelector('.login-success');
    if (existingSuccess) {
        existingSuccess.remove();
    }

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
        white-space: pre-line;
        line-height: 1.5;
    `;
    successDiv.textContent = message;
    
    if (forgotPasswordForm) {
        forgotPasswordForm.insertBefore(successDiv, forgotPasswordForm.firstChild);
    }
}

// Handle form submission
if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Remove existing messages
        const existingError = document.querySelector('.login-error');
        if (existingError) existingError.remove();
        const existingSuccess = document.querySelector('.login-success');
        if (existingSuccess) existingSuccess.remove();

        // Get form values
        const email = emailInput?.value.trim();

        // Validation
        if (!email) {
            showError('Please enter your email address.');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showError('Please enter a valid email address.');
            return;
        }

        // Disable submit button
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';
        }

        try {
            // Call forgot password API
            const response = await apiClient.post('/Account/forgot-password', {
                email: email
            });
            
            // Show success message
            showSuccess('Password reset link has been sent to your email.\nPlease check your inbox and follow the instructions to reset your password.');
            
            // Optionally redirect after showing message
            setTimeout(() => {
                // Could redirect to a "check your email" page, or stay here
                // window.location.href = 'check-email.html';
            }, 5000);
        } catch (error) {
            // Handle errors
            let errorMessage = 'Failed to send reset link. Please try again.';
            
            if (error.message) {
                errorMessage = error.message;
            } else if (error.data && error.data.message) {
                errorMessage = error.data.message;
            }
            
            // For security, we might still show success even if email doesn't exist
            // to prevent email enumeration
            showSuccess('If an account with that email exists, a password reset link has been sent.');
        } finally {
            // Re-enable submit button
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = 'Send Reset Link';
            }
        }
    });
}


/**
 * Forgot Password Page Handler
 * Handles password reset request
 */

import apiClient from './api-client.js';

// Get form elements
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
const messageContainer = forgotPasswordForm?.querySelector('.login-message-container') || null;
const emailInput = document.getElementById('email');
const submitButton = forgotPasswordForm?.querySelector('button[type="submit"]');

// Add styles for validation
const validationStyle = document.createElement('style');
validationStyle.textContent = `
    .input-error {
        border: 2px solid #ef4444 !important;
        background-color: #fef2f2 !important;
    }
    .input-error-icon {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: #ef4444;
        font-weight: bold;
        font-size: 18px;
        pointer-events: none;
    }
    .input-wrapper {
        position: relative;
        display: block;
    }
`;
document.head.appendChild(validationStyle);

// Helper function to show field error
function showFieldError(input) {
    if (!input) return;
    
    // Add error class to input
    input.classList.add('input-error');
    
    // Wrap input in relative container if not already wrapped
    if (!input.parentElement.classList.contains('input-wrapper')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'input-wrapper';
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);
    }
    
    // Add error icon if not exists
    const wrapper = input.parentElement;
    let errorIcon = wrapper.querySelector('.input-error-icon');
    if (!errorIcon) {
        errorIcon = document.createElement('span');
        errorIcon.className = 'input-error-icon';
        errorIcon.textContent = '!';
        wrapper.appendChild(errorIcon);
    }
}

// Helper function to clear field error
function clearFieldError(input) {
    if (!input) return;
    input.classList.remove('input-error');
    const wrapper = input.parentElement;
    if (wrapper && wrapper.classList.contains('input-wrapper')) {
        const errorIcon = wrapper.querySelector('.input-error-icon');
        if (errorIcon) {
            errorIcon.remove();
        }
    }
}

// Clear errors on input
if (emailInput) {
    emailInput.addEventListener('input', function() {
        clearFieldError(this);
    });
}

// Show error message using toaster in top-right corner
function showError(message) {
    document.querySelectorAll('.login-error, .login-success').forEach(el => el.remove());
    if (window.toast) {
        window.toast.error(message);
        return;
    }
    const errorDiv = document.createElement('div');
    errorDiv.className = 'login-error';
    errorDiv.textContent = message;
    if (messageContainer) {
        messageContainer.innerHTML = '';
        messageContainer.appendChild(errorDiv);
    } else if (forgotPasswordForm) {
        forgotPasswordForm.insertBefore(errorDiv, forgotPasswordForm.firstChild);
    }
}

// Show success message using toaster in top-right corner
function showSuccess(message) {
    document.querySelectorAll('.login-error, .login-success').forEach(el => el.remove());
    if (window.toast) {
        window.toast.success(message);
        return;
    }
    const successDiv = document.createElement('div');
    successDiv.className = 'login-success';
    successDiv.textContent = message;
    if (messageContainer) {
        messageContainer.innerHTML = '';
        messageContainer.appendChild(successDiv);
    } else if (forgotPasswordForm) {
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

        // Collect all validation errors
        let errors = [];
        let firstErrorField = null;

        // Validate all fields and mark errors
        if (!email) {
            showFieldError(emailInput);
            errors.push('Email address is required');
            if (!firstErrorField) firstErrorField = emailInput;
        } else {
            // Basic email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showFieldError(emailInput);
                errors.push('Please enter a valid email address');
                if (!firstErrorField) firstErrorField = emailInput;
            }
        }

        // If there are errors, show them and stop
        if (errors.length > 0) {
            showError(errors[0]);
            firstErrorField?.focus();
            return;
        }

        // Show loader
        if (window.loader) {
            window.loader.show('Sending reset link...');
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
            
            // Update loader message
            if (window.loader) {
                window.loader.updateMessage('Reset link sent!');
            }
            
            // Show success message
            showSuccess('Password reset link has been sent to your email.\nPlease check your inbox and follow the instructions to reset your password.');
            
            // Hide loader after short delay
            setTimeout(() => {
                if (window.loader) {
                    window.loader.hide();
                }
            }, 1000);
            
            // Optionally redirect after showing message
            setTimeout(() => {
                // Could redirect to a "check your email" page, or stay here
                // window.location.href = 'check-email.html';
            }, 5000);
        } catch (error) {
            // Hide loader
            if (window.loader) {
                window.loader.hide();
            }
            
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


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
const messageContainer = loginForm?.querySelector('.login-message-container') || null;
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const submitButton = loginForm?.querySelector('.login-btn') || loginForm?.querySelector('button[type="submit"]');

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
[usernameInput, passwordInput].forEach(input => {
    if (input) {
        input.addEventListener('input', function() {
            clearFieldError(this);
        });
    }
});

// Password toggle functionality
document.querySelectorAll('.toggle-password').forEach(button => {
    button.addEventListener('click', function() {
        const targetId = this.getAttribute('data-target');
        const input = document.getElementById(targetId);
        const eyeOpen = this.querySelectorAll('.eye-open');
        const eyeClosed = this.querySelectorAll('.eye-closed');
        
        if (input.type === 'password') {
            input.type = 'text';
            eyeOpen.forEach(el => el.style.display = 'none');
            eyeClosed.forEach(el => el.style.display = 'block');
        } else {
            input.type = 'password';
            eyeOpen.forEach(el => el.style.display = 'block');
            eyeClosed.forEach(el => el.style.display = 'none');
        }
    });
});

// Show error message using toaster in top-right corner
function showError(message) {
    // Remove any old inline messages if present
    document.querySelectorAll('.login-error, .login-success').forEach(el => el.remove());
    if (window.toast) {
        window.toast.error(message);
        return;
    }
    // Fallback: inline inserted into the message container if available
    const errorDiv = document.createElement('div');
    errorDiv.className = 'login-error';
    errorDiv.textContent = message;
    if (messageContainer) {
        // clear container then append
        messageContainer.innerHTML = '';
        messageContainer.appendChild(errorDiv);
    } else if (loginForm) {
        loginForm.insertBefore(errorDiv, loginForm.firstChild);
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
    } else if (loginForm) {
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

        // Collect all validation errors
        let errors = [];
        let firstErrorField = null;

        // Validate all fields and mark errors
        if (!username) {
            showFieldError(usernameInput);
            errors.push('Username or Email is required');
            if (!firstErrorField) firstErrorField = usernameInput;
        }

        if (!password) {
            showFieldError(passwordInput);
            errors.push('Password is required');
            if (!firstErrorField) firstErrorField = passwordInput;
        }

        // If there are errors, show them and stop
        if (errors.length > 0) {
            showError(errors[0]);
            firstErrorField?.focus();
            return;
        }

        // Show loader
        if (window.loader) {
            window.loader.show('Signing in...');
        }

        // Disable submit button
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Signing in...';
        }

        try {
            // Call sign in API
            const response = await signIn(username, password);
            
            // Update loader message
            if (window.loader) {
                window.loader.updateMessage('Login successful!');
            }
            
            // Show success message
            showSuccess('Login successful! Redirecting...');
            
            // Hide loader after short delay
            setTimeout(() => {
                if (window.loader) {
                    window.loader.hide();
                }
            }, 800);
            
            // Redirect to dashboard after successful login
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } catch (error) {
            // Hide loader
            if (window.loader) {
                window.loader.hide();
            }
            
            // Handle errors
            let errorMessage = 'Login failed. Please try again.';
            
            if (error.message) {
                errorMessage = error.message;
            } else if (error.data && error.data.message) {
                errorMessage = error.data.message;
            }
            
            // Check for specific error codes
            if (error.status === 401) {
                errorMessage = 'Invalid username or password.';
            } else if (error.status === 404) {
                errorMessage = 'User not found. Please check your credentials.';
            } else if (error.status === 0 || !error.status) {
                errorMessage = 'Unable to connect to server. Please check your internet connection.';
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

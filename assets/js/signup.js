/**
 * Signup Page Handler
 * Integrates with centralized API system
 */

import { signUp, isAuthenticated } from './auth-api.js';

// Check if user is already logged in
if (isAuthenticated()) {
    window.location.href = 'dashboard.html';
}

// Get form elements
const signupForm = document.querySelector('.signup-form');
const firstNameInput = document.getElementById('firstName');
const lastNameInput = document.getElementById('lastName');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const acceptTermsCheckbox = document.querySelector('input[name="accept_terms"]');
const submitButton = signupForm?.querySelector('button[type="submit"]');

// Show error message
function showError(message) {
    // Remove existing error message
    const existingError = document.querySelector('.signup-error');
    if (existingError) {
        existingError.remove();
    }

    // Create error message element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'signup-error';
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
    if (signupForm) {
        signupForm.insertBefore(errorDiv, signupForm.firstChild);
    }
}

// Show success message
function showSuccess(message) {
    const existingError = document.querySelector('.signup-error');
    if (existingError) {
        existingError.remove();
    }

    const successDiv = document.createElement('div');
    successDiv.className = 'signup-success';
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
    
    if (signupForm) {
        signupForm.insertBefore(successDiv, signupForm.firstChild);
    }
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Handle form submission
if (signupForm) {
    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Remove existing error messages
        const existingError = document.querySelector('.signup-error');
        if (existingError) {
            existingError.remove();
        }

        // Get form values
        const firstName = firstNameInput?.value.trim();
        const lastName = lastNameInput?.value.trim();
        const email = emailInput?.value.trim();
        const password = passwordInput?.value;
        const confirmPassword = confirmPasswordInput?.value;
        const acceptTerms = acceptTermsCheckbox?.checked;

        // Validation
        if (!firstName || !lastName) {
            showError('Please enter your first and last name.');
            return;
        }

        if (!email) {
            showError('Please enter your email or username.');
            return;
        }

        // Check if it's an email format (optional validation)
        if (email.includes('@') && !isValidEmail(email)) {
            showError('Please enter a valid email address.');
            return;
        }

        if (!password) {
            showError('Please enter a password.');
            return;
        }

        if (password.length < 6) {
            showError('Password must be at least 6 characters long.');
            return;
        }

        if (password !== confirmPassword) {
            showError('Passwords do not match.');
            return;
        }

        if (!acceptTerms) {
            showError('Please accept the Privacy Policy and Terms & Conditions.');
            return;
        }

        // Disable submit button
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Creating account...';
        }

        try {
            // Prepare user data
            const userData = {
                firstName,
                lastName,
                email: email.includes('@') ? email : email,
                username: email.includes('@') ? email.split('@')[0] : email,
                password,
            };

            // Call sign up API
            const response = await signUp(userData);
            
            // After successful signup, redirect to login page
            // User must login manually - don't auto-login after signup
            if (response && response.id) {
                // Show success message
                showSuccess('Account created successfully! Redirecting to login...');
                
                // Redirect to login page - user needs to login manually
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
            } else {
                // Fallback - redirect to login anyway
                showSuccess('Account created successfully! Please login...');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
            }
        } catch (error) {
            // Handle errors
            let errorMessage = 'Signup failed. Please try again.';
            
            if (error.message) {
                errorMessage = error.message;
            } else if (error.data && error.data.message) {
                errorMessage = error.data.message;
            }
            
            // If it's a CORS error, provide user-friendly message
            if (error.data && error.data.isCorsError) {
                errorMessage = 'Signup is currently unavailable due to a backend configuration issue.\n\n' +
                              'The signup endpoint needs CORS support enabled on the server.\n\n' +
                              'Please contact support or try again later once the backend is updated.';
            }
            
            showError(errorMessage);
            
            // Re-enable submit button
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = 'Sign Up';
            }
        }
    });
}

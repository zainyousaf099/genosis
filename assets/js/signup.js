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
const messageContainer = signupForm?.querySelector('.signup-message-container') || null;
const firstNameInput = document.getElementById('firstName');
const lastNameInput = document.getElementById('lastName');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const acceptTermsCheckbox = document.querySelector('input[name="accept_terms"]');
const submitButton = signupForm?.querySelector('button[type="submit"]');

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
[firstNameInput, lastNameInput, emailInput, passwordInput, confirmPasswordInput].forEach(input => {
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
    // remove any previous inline messages
    document.querySelectorAll('.signup-error, .signup-success').forEach(el => el.remove());
    if (window.toast) {
        window.toast.error(message);
        return;
    }
    // fallback: inline into message container
    const errorDiv = document.createElement('div');
    errorDiv.className = 'signup-error';
    errorDiv.textContent = message;
    if (messageContainer) {
        messageContainer.innerHTML = '';
        messageContainer.appendChild(errorDiv);
    } else if (signupForm) {
        signupForm.insertBefore(errorDiv, signupForm.firstChild);
    }
}

// Show success message using toaster in top-right corner
function showSuccess(message) {
    document.querySelectorAll('.signup-error, .signup-success').forEach(el => el.remove());
    if (window.toast) {
        window.toast.success(message);
        return;
    }
    const successDiv = document.createElement('div');
    successDiv.className = 'signup-success';
    successDiv.textContent = message;
    if (messageContainer) {
        messageContainer.innerHTML = '';
        messageContainer.appendChild(successDiv);
    } else if (signupForm) {
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

        // Collect all validation errors
        let errors = [];
        let firstErrorField = null;

        // Validate all fields and mark errors
        if (!firstName) {
            showFieldError(firstNameInput);
            errors.push('First Name is required');
            if (!firstErrorField) firstErrorField = firstNameInput;
        }

        if (!lastName) {
            showFieldError(lastNameInput);
            errors.push('Last Name is required');
            if (!firstErrorField) firstErrorField = lastNameInput;
        }

        if (!email) {
            showFieldError(emailInput);
            errors.push('Email or Username is required');
            if (!firstErrorField) firstErrorField = emailInput;
        } else if (email.includes('@') && !isValidEmail(email)) {
            showFieldError(emailInput);
            errors.push('Please enter a valid email address');
            if (!firstErrorField) firstErrorField = emailInput;
        }

        if (!password) {
            showFieldError(passwordInput);
            errors.push('Password is required');
            if (!firstErrorField) firstErrorField = passwordInput;
        } else if (password.length < 6) {
            showFieldError(passwordInput);
            errors.push('Password must be at least 6 characters long');
            if (!firstErrorField) firstErrorField = passwordInput;
        }

        if (!confirmPassword) {
            showFieldError(confirmPasswordInput);
            errors.push('Confirm Password is required');
            if (!firstErrorField) firstErrorField = confirmPasswordInput;
        } else if (password && confirmPassword && password !== confirmPassword) {
            showFieldError(passwordInput);
            showFieldError(confirmPasswordInput);
            errors.push('Passwords do not match');
            if (!firstErrorField) firstErrorField = confirmPasswordInput;
        }

        if (!acceptTerms) {
            errors.push('Please accept the Privacy Policy and Terms & Conditions');
            if (!firstErrorField) firstErrorField = acceptTermsCheckbox;
        }

        // If there are errors, show them and stop
        if (errors.length > 0) {
            showError(errors[0]); // Show first error
            firstErrorField?.focus();
            return;
        }

        // Show loader
        if (window.loader) {
            window.loader.show('Creating your account...');
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
            
            // Update loader message
            if (window.loader) {
                window.loader.updateMessage('Account created successfully!');
            }
            
            // After successful signup, redirect to login page
            // User must login manually - don't auto-login after signup
            if (response && response.id) {
                // Show success message
                showSuccess('Account created successfully! Redirecting to login...');
                
                // Hide loader after short delay
                setTimeout(() => {
                    if (window.loader) {
                        window.loader.hide();
                    }
                }, 800);
                
                // Redirect to login page - user needs to login manually
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
            } else {
                // Fallback - redirect to login anyway
                showSuccess('Account created successfully! Please login...');
                
                setTimeout(() => {
                    if (window.loader) {
                        window.loader.hide();
                    }
                }, 800);
                
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
            }
        } catch (error) {
            // Hide loader
            if (window.loader) {
                window.loader.hide();
            }
            
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

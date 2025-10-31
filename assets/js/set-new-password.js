/**
 * Set New Password Page Handler
 * Handles password reset
 */

import apiClient from './api-client.js';

// Get form elements
const setPasswordForm = document.getElementById('setPasswordForm');
const messageContainer = setPasswordForm?.querySelector('.login-message-container') || null;
const newPasswordInput = document.getElementById('newPassword');
const confirmPasswordInput = document.getElementById('confirmPassword');
const passwordMatchDiv = document.getElementById('passwordMatch');
const submitButton = setPasswordForm?.querySelector('button[type="submit"]');

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

// Show error message via toaster in top-right corner
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
    } else if (setPasswordForm) {
        setPasswordForm.insertBefore(errorDiv, setPasswordForm.firstChild);
    }
}

// Show success message via toaster in top-right corner
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
    } else if (setPasswordForm) {
        setPasswordForm.insertBefore(successDiv, setPasswordForm.firstChild);
    }
}

// Check password match in real-time
if (confirmPasswordInput && newPasswordInput) {
    confirmPasswordInput.addEventListener('input', function() {
        clearFieldError(this);
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        if (confirmPassword && newPassword !== confirmPassword) {
            passwordMatchDiv.style.display = 'block';
            passwordMatchDiv.style.color = '#dc2626';
            passwordMatchDiv.textContent = 'Passwords do not match';
        } else if (confirmPassword && newPassword === confirmPassword) {
            passwordMatchDiv.style.display = 'block';
            passwordMatchDiv.style.color = '#065f46';
            passwordMatchDiv.textContent = 'Passwords match';
        } else {
            passwordMatchDiv.style.display = 'none';
        }
    });
    
    newPasswordInput.addEventListener('input', function() {
        clearFieldError(this);
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        if (confirmPassword && newPassword !== confirmPassword) {
            passwordMatchDiv.style.display = 'block';
            passwordMatchDiv.style.color = '#dc2626';
            passwordMatchDiv.textContent = 'Passwords do not match';
        } else if (confirmPassword && newPassword === confirmPassword) {
            passwordMatchDiv.style.display = 'block';
            passwordMatchDiv.style.color = '#065f46';
            passwordMatchDiv.textContent = 'Passwords match';
        } else {
            passwordMatchDiv.style.display = 'none';
        }
    });
}

// Handle form submission
if (setPasswordForm) {
    setPasswordForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Remove existing messages
        const existingError = document.querySelector('.login-error');
        if (existingError) existingError.remove();
        const existingSuccess = document.querySelector('.login-success');
        if (existingSuccess) existingSuccess.remove();

        // Get form values
        const newPassword = newPasswordInput?.value;
        const confirmPassword = confirmPasswordInput?.value;

        // Collect all validation errors
        let errors = [];
        let firstErrorField = null;

        // Validate all fields and mark errors
        if (!newPassword) {
            showFieldError(newPasswordInput);
            errors.push('New password is required');
            if (!firstErrorField) firstErrorField = newPasswordInput;
        } else if (newPassword.length < 6) {
            showFieldError(newPasswordInput);
            errors.push('Password must be at least 6 characters long');
            if (!firstErrorField) firstErrorField = newPasswordInput;
        }

        if (!confirmPassword) {
            showFieldError(confirmPasswordInput);
            errors.push('Please confirm your password');
            if (!firstErrorField) firstErrorField = confirmPasswordInput;
        } else if (newPassword && confirmPassword && newPassword !== confirmPassword) {
            showFieldError(newPasswordInput);
            showFieldError(confirmPasswordInput);
            errors.push('Passwords do not match');
            if (!firstErrorField) firstErrorField = confirmPasswordInput;
        }

        // If there are errors, show them and stop
        if (errors.length > 0) {
            showError(errors[0]);
            firstErrorField?.focus();
            return;
        }

        // Get token from URL query parameter (usually from email link)
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token') || urlParams.get('resetToken');
        
        if (!token) {
            showError('Invalid or missing reset token. Please use the link from your email.');
            return;
        }

        // Show loader
        if (window.loader) {
            window.loader.show('Resetting your password...');
        }

        // Disable submit button
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Resetting Password...';
        }

        try {
            // Call reset password API
            const response = await apiClient.post('/Account/reset-password', {
                token: token,
                newPassword: newPassword
            });
            
            // Update loader message
            if (window.loader) {
                window.loader.updateMessage('Password reset successful!');
            }
            
            // Show success message
            showSuccess('Password has been reset successfully!\nRedirecting to login page...');
            
            // Hide loader after short delay
            setTimeout(() => {
                if (window.loader) {
                    window.loader.hide();
                }
            }, 1000);
            
            // Redirect to login page after successful reset
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } catch (error) {
            // Hide loader
            if (window.loader) {
                window.loader.hide();
            }
            
            // Handle errors
            let errorMessage = 'Failed to reset password. Please try again.';
            
            if (error.message) {
                errorMessage = error.message;
            } else if (error.data && error.data.message) {
                errorMessage = error.data.message;
            }
            
            // Special handling for expired/invalid token
            if (error.status === 400 || error.status === 401) {
                errorMessage = 'Invalid or expired reset token. Please request a new password reset link.';
            }
            
            showError(errorMessage);
            
            // Re-enable submit button
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = 'Reset Password';
            }
        }
    });
}


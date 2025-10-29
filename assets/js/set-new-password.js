/**
 * Set New Password Page Handler
 * Handles password reset
 */

import apiClient from './api-client.js';

// Get form elements
const setPasswordForm = document.getElementById('setPasswordForm');
const newPasswordInput = document.getElementById('newPassword');
const confirmPasswordInput = document.getElementById('confirmPassword');
const passwordMatchDiv = document.getElementById('passwordMatch');
const submitButton = setPasswordForm?.querySelector('button[type="submit"]');

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
    
    if (setPasswordForm) {
        setPasswordForm.insertBefore(errorDiv, setPasswordForm.firstChild);
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
    
    if (setPasswordForm) {
        setPasswordForm.insertBefore(successDiv, setPasswordForm.firstChild);
    }
}

// Check password match in real-time
if (confirmPasswordInput && newPasswordInput) {
    confirmPasswordInput.addEventListener('input', function() {
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

        // Validation
        if (!newPassword || !confirmPassword) {
            showError('Please enter both password fields.');
            return;
        }

        if (newPassword.length < 8) {
            showError('Password must be at least 8 characters long.');
            return;
        }

        if (newPassword !== confirmPassword) {
            showError('Passwords do not match. Please try again.');
            return;
        }

        // Get token from URL query parameter (usually from email link)
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token') || urlParams.get('resetToken');
        
        if (!token) {
            showError('Invalid or missing reset token. Please use the link from your email.');
            return;
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
            
            // Show success message
            showSuccess('Password has been reset successfully!\nRedirecting to login page...');
            
            // Redirect to login page after successful reset
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } catch (error) {
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


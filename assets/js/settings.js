// Simple Settings Page - Standalone version without database/API

// Helper function to show messages
function showMessage(message, isSuccess = true) {
    alert(message);
}

// Panel switching functionality
function initSettings() {
    const menuItems = document.querySelectorAll(".settings-menu-item");
    const panels = document.querySelectorAll(".settings-panel");

    // Helper: switch visible panel
    function switchPanel(panelId) {
        panels.forEach((panel) => panel.classList.add("hidden"));
        const activePanel = document.querySelector(`#panel-${panelId}`);
        if (activePanel) activePanel.classList.remove("hidden");

        // Update sidebar highlight
        menuItems.forEach((item) => item.classList.remove("active"));
        const activeItem = document.querySelector(`[data-panel="${panelId}"]`);
        if (activeItem) activeItem.classList.add("active");
    }

    // Attach click events for the left sidebar
    menuItems.forEach((item) => {
        item.addEventListener("click", () => {
            switchPanel(item.dataset.panel);
        });
    });

    // Default to "account"
    switchPanel("account");
}

// Subscription plan selection
function initPlanSelection() {
    const planOptions = document.querySelectorAll('.plan-option');
    planOptions.forEach(option => {
        option.addEventListener('click', () => {
            planOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            const checkbox = option.querySelector('input[type="checkbox"]');
            if (checkbox) checkbox.checked = true;
        });
    });
}

// Storage upgrade modal functionality
function initStorageModal() {
    const modal = document.getElementById('upgradeModal');
    const openBtn = document.getElementById('open-upgrade-storage');
    const storageSelect = document.getElementById('storage');
    const priceSpan = document.getElementById('price');

    // Storage pricing
    const pricing = {
        '50GB': 15,
        '100GB': 25,
        '250GB': 50,
        '500GB': 75,
        '1TB': 100,
        '2TB': 180,
        '5TB': 400,
        '10TB': 750
    };

    // Global functions for buttons
    window.openModal = function() {
        if (modal) modal.classList.add("active");
        if (document.body) document.body.style.overflow = 'hidden';
    };

    window.closeModal = function() {
        if (modal) modal.classList.remove("active");
        if (document.body) document.body.style.overflow = '';
        
        // Reset form
        if (storageSelect) storageSelect.value = '';
        if (priceSpan) priceSpan.textContent = '$0';
    };

    window.updatePrice = function() {
        if (storageSelect && priceSpan) {
            const selectedStorage = storageSelect.value;
            const price = pricing[selectedStorage] || 0;
            priceSpan.textContent = `$${price}`;
        }
    };

    window.upgrade = function() {
        if (storageSelect) {
            const selectedStorage = storageSelect.value;
            
            if (!selectedStorage) {
                alert('Please select a storage option');
                return;
            }
            
            const price = pricing[selectedStorage];
            
            alert(`Upgrading to ${selectedStorage} for $${price}/month...`);
            window.closeModal();
            
            console.log('Upgrade details:', {
                storage: selectedStorage,
                price: price
            });
        }
    };

    // Open modal when button is clicked
    if (openBtn) {
        openBtn.addEventListener('click', function() {
            window.openModal();
        });
    }

    // Close modal when clicking outside of it
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                window.closeModal();
            }
        });
    }

    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            window.closeModal();
        }
    });
}

// Password update functionality
function initPasswordUpdate() {
    const updatePasswordBtn = document.getElementById('update-password-button');
    
    if (updatePasswordBtn) {
        updatePasswordBtn.addEventListener('click', function() {
            const currentPassword = document.getElementById('current-password');
            const newPassword = document.getElementById('new-password');
            const confirmPassword = document.getElementById('confirm-password');
            
            // Validation
            if (!currentPassword || !currentPassword.value) {
                showMessage('Please enter current password', false);
                return;
            }
            
            if (!newPassword || !newPassword.value || newPassword.value.length < 8) {
                showMessage('New password must be at least 8 characters', false);
                return;
            }
            
            if (newPassword.value !== confirmPassword.value) {
                showMessage('New passwords do not match', false);
                return;
            }
            
            // In a real app, you would send this to your server
            showMessage('Password updated successfully!');
            
            // Clear fields
            if (currentPassword) currentPassword.value = '';
            if (newPassword) newPassword.value = '';
            if (confirmPassword) confirmPassword.value = '';
        });
    }
}

// Simple button actions
function cancelSettings() {
    showMessage('Changes cancelled');
}

function saveSettings() {
    showMessage('Settings saved successfully!');
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        showMessage('Logged out successfully');
        // In a real app, you would redirect to login page
    }
}

function contactUs() {
    alert('Please contact us at support@example.com');
}

// Navigation functions for sidebar
function loadDashboard(event) {
    console.log('Navigate to Dashboard');
    alert('Dashboard page - navigation not implemented in standalone version');
}

function loadVaults(event) {
    console.log('Navigate to Vaults');
    alert('Vaults page - navigation not implemented in standalone version');
}

function loadCalendar(event) {
    console.log('Navigate to Calendar');
    alert('Calendar page - navigation not implemented in standalone version');
}

function loadSearch(event) {
    console.log('Navigate to Search');
    alert('Search page - navigation not implemented in standalone version');
}

function loadSettings(event) {
    console.log('Already on Settings page');
    event.preventDefault();
}

function logout(event) {
    event.preventDefault();
    if (window.confirm && confirm('Are you sure you want to logout?')) {
        alert('Logged out successfully');
        // In a real app, you would redirect to login page
    } else if (!window.confirm) {
        alert('Are you sure you want to logout?');
        alert('Logged out successfully');
    }
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing Settings page...');
    
    initSettings();
    initPlanSelection();
    initStorageModal();
    initPasswordUpdate();
    
    console.log('Settings page initialized successfully!');
});


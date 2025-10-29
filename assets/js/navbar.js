/**
 * Main Navigation Bar Component
 * Handles tab navigation and active state management
 */

class NavbarManager {
    constructor() {
        this.currentTab = null;
        this.init();
    }

    init() {
        // Load navbar HTML (will set active tab after loading)
        this.loadNavbar();
        
        // Attach event listeners after navbar is loaded
        setTimeout(() => {
            this.attachEventListeners();
        }, 150);
    }

    async loadNavbar() {
        try {
            const response = await fetch('components/navbar.html');
            const html = await response.text();
            
            // Find or create navbar container
            let navbarContainer = document.getElementById('main-navbar-container');
            if (!navbarContainer) {
                navbarContainer = document.createElement('div');
                navbarContainer.id = 'main-navbar-container';
                document.body.insertBefore(navbarContainer, document.body.firstChild);
            }
            
            navbarContainer.innerHTML = html;
            
            // Add CSS if not already loaded
            this.loadNavbarCSS();
            
            // Set active tab after navbar is loaded
            setTimeout(() => {
                this.setActiveTabFromPage();
            }, 50);
        } catch (error) {
            console.error('Error loading navbar:', error);
        }
    }

    loadNavbarCSS() {
        // Check if CSS is already loaded
        if (document.getElementById('navbar-css')) {
            return;
        }
        
        const link = document.createElement('link');
        link.id = 'navbar-css';
        link.rel = 'stylesheet';
        link.href = 'assets/css/navbar.css';
        document.head.appendChild(link);
    }

    setActiveTabFromPage() {
        // Determine current page from URL or page-specific marker
        const currentPage = this.getCurrentPage();
        this.setActiveTab(currentPage);
    }

    getCurrentPage() {
        const path = window.location.pathname;
        const fileName = path.split('/').pop() || window.location.href.split('/').pop();
        
        if (fileName.includes('dashboard') || fileName === '' || fileName === 'index.html') {
            return 'dashboard';
        } else if (fileName.includes('vault')) {
            return 'vaults';
        } else if (fileName.includes('calendar')) {
            return 'calendar';
        } else if (fileName.includes('search')) {
            return 'search';
        } else if (fileName.includes('settings')) {
            return 'settings';
        }
        
        return 'dashboard'; // Default
    }

    setActiveTab(tabName) {
        // Remove active class from all items
        const allItems = document.querySelectorAll('.navbar-item');
        allItems.forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to current tab
        const activeItem = document.querySelector(`.navbar-item[data-tab="${tabName}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
            this.currentTab = tabName;
        }
    }

    attachEventListeners() {
        const navbarItems = document.querySelectorAll('.navbar-item');
        
        navbarItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const tabName = item.getAttribute('data-tab');
                this.navigateToTab(tabName);
            });
        });
    }

    navigateToTab(tabName) {
        // Don't navigate if already on this tab
        if (this.currentTab === tabName) {
            return;
        }
        
        // Map tab names to URLs
        const tabRoutes = {
            'dashboard': 'dashboard.html',
            'vaults': 'vault.html',
            'calendar': 'calendar.html', // You'll need to create this
            'search': 'search.html', // You'll need to create this
            'settings': 'settings.html',
            'logout': null // Handle separately
        };
        
        if (tabName === 'logout') {
            this.handleLogout();
            return;
        }
        
        const route = tabRoutes[tabName];
        if (route) {
            // Smooth transition - add fade effect
            const pageContainer = document.querySelector('.page-container, .main-container, body');
            if (pageContainer) {
                pageContainer.style.opacity = '0.7';
                pageContainer.style.transition = 'opacity 0.2s ease';
            }
            
            setTimeout(() => {
                window.location.href = route;
            }, 200);
        }
    }

    handleLogout() {
        // Import logout function
        import('./auth-api.js').then(({ signOut }) => {
            signOut();
            window.location.href = 'login.html';
        }).catch(() => {
            // Fallback if module not available
            localStorage.clear();
            window.location.href = 'login.html';
        });
    }
}

// Initialize navbar when DOM is ready
let navbarManager = null;

document.addEventListener('DOMContentLoaded', () => {
    navbarManager = new NavbarManager();
});

// Export for global access
window.NavbarManager = NavbarManager;
window.navbarManager = navbarManager;


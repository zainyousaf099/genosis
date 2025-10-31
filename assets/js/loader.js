/**
 * Loader Component
 * Displays a centered loading screen with logo and circular spinner
 */

(function(){
    const styleId = 'app-loader-style';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .app-loader-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(4px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 999999;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .app-loader-overlay.show {
                opacity: 1;
            }
            
            .app-loader-content {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 20px;
            }
            
            .app-loader-logo-wrapper {
                position: relative;
                width: 120px;
                height: 120px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .app-loader-logo {
                width: 80px;
                height: 80px;
                object-fit: contain;
                z-index: 2;
                position: relative;
            }
            
            .app-loader-spinner {
                position: absolute;
                top: 0;
                left: 0;
                width: 120px;
                height: 120px;
                border: 4px solid #e5e7eb;
                border-top: 4px solid #3b82f6;
                border-radius: 50%;
                animation: app-loader-spin 1s linear infinite;
                z-index: 1;
            }
            
            @keyframes app-loader-spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .app-loader-text {
                font-size: 16px;
                color: #6b7280;
                font-weight: 500;
                text-align: center;
            }
        `;
        document.head.appendChild(style);
    }

    let loaderElement = null;

    function createLoader(message = 'Loading...') {
        if (loaderElement) {
            return loaderElement;
        }

        loaderElement = document.createElement('div');
        loaderElement.className = 'app-loader-overlay';
        loaderElement.innerHTML = `
            <div class="app-loader-content">
                <div class="app-loader-logo-wrapper">
                    <img src="assets/logo.png" alt="Loading" class="app-loader-logo">
                    <div class="app-loader-spinner"></div>
                </div>
                <div class="app-loader-text">${message}</div>
            </div>
        `;
        
        document.body.appendChild(loaderElement);
        
        // Trigger animation
        requestAnimationFrame(() => {
            loaderElement.classList.add('show');
        });
        
        return loaderElement;
    }

    function showLoader(message = 'Loading...') {
        if (loaderElement) {
            // Update message if loader already exists
            const textElement = loaderElement.querySelector('.app-loader-text');
            if (textElement) {
                textElement.textContent = message;
            }
            loaderElement.classList.add('show');
        } else {
            createLoader(message);
        }
    }

    function hideLoader() {
        if (loaderElement) {
            loaderElement.classList.remove('show');
            setTimeout(() => {
                if (loaderElement && loaderElement.parentNode) {
                    loaderElement.parentNode.removeChild(loaderElement);
                    loaderElement = null;
                }
            }, 300);
        }
    }

    function updateLoaderMessage(message) {
        if (loaderElement) {
            const textElement = loaderElement.querySelector('.app-loader-text');
            if (textElement) {
                textElement.textContent = message;
            }
        }
    }

    // Export globally
    window.loader = {
        show: showLoader,
        hide: hideLoader,
        updateMessage: updateLoaderMessage
    };
})();

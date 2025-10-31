(function(){
    // Global container (fallback)
    let container = document.getElementById('app-toaster');
    if (!container) {
        container = document.createElement('div');
        container.id = 'app-toaster';
        container.style.cssText = 'position:fixed;top:16px;right:16px;z-index:99999;display:flex;flex-direction:column;gap:8px;max-width:92vw;';
        document.body.appendChild(container);
    }

	const styleId = 'app-toaster-style';
	if (!document.getElementById(styleId)) {
		const style = document.createElement('style');
		style.id = styleId;
		style.textContent = `
			.app-toast{display:flex;align-items:flex-start;gap:10px;padding:12px 14px;border-radius:10px;box-shadow:0 6px 20px rgba(0,0,0,.12);font-size:14px;line-height:1.4;background:#fff;border:1px solid #e5e7eb;opacity:0;transform:translateY(-8px);transition:opacity .2s ease, transform .2s ease}
			.app-toast.show{opacity:1;transform:translateY(0)}
			.app-toast .app-toast-icon{width:20px;height:20px;flex:0 0 20px;display:inline-flex;align-items:center;justify-content:center;border-radius:50%;font-weight:700}
			.app-toast-success{border-color:#34d399;background:#ecfdf5;color:#065f46}
			.app-toast-error{border-color:#fda4af;background:#fff1f2;color:#991b1b}
			.app-toast-info{border-color:#93c5fd;background:#eff6ff;color:#0369a1}
			.app-toast-warning{border-color:#fbd38d;background:#fffbeb;color:#92400e}
			.app-toast-success .app-toast-icon{background:#10b981;color:#fff}
			.app-toast-error .app-toast-icon{background:#ef4444;color:#fff}
			.app-toast-info .app-toast-icon{background:#3b82f6;color:#fff}
			.app-toast-warning .app-toast-icon{background:#f59e0b;color:#fff}
		`;
		document.head.appendChild(style);
	}

    function ensureAnchorContainer(anchor, centered = false){
        if (!anchor) return container;
        let holder = anchor.querySelector(':scope > .app-toast-holder');
        if (!holder) {
            holder = document.createElement('div');
            holder.className = 'app-toast-holder';
            // Centered or top-right in form
            const style = centered
                ? 'position:absolute;top:0;left:50%;transform:translateX(-50%);z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none;min-width:220px;max-width:92vw;'
                : 'position:absolute;top:8px;right:8px;z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none;';
            holder.setAttribute('style', style);
            // Ensure anchor can position children
            const currentPos = getComputedStyle(anchor).position;
            if (!currentPos || currentPos === 'static') {
                anchor.style.position = 'relative';
            }
            anchor.appendChild(holder);
        }
        // Update style if centering toggled
        if (centered) {
            holder.style.left = '50%';
            holder.style.right = '';
            holder.style.transform = 'translateX(-50%)';
            holder.style.top = '0';
        } else {
            holder.style.left = '';
            holder.style.right = '8px';
            holder.style.transform = '';
            holder.style.top = '8px';
        }
        return holder;
    }

    function createToast(message, type, anchor, centered){
        const host = ensureAnchorContainer(anchor, centered);
        const t = document.createElement('div');
		t.className = `app-toast app-toast-${type}`;
        t.style.pointerEvents = 'auto';
		const icon = document.createElement('span');
		icon.className = 'app-toast-icon';
		icon.textContent = type === 'success' ? '✓' : type === 'error' ? '✕' : type === 'warning' ? '!' : 'i';
		const text = document.createElement('div');
		text.style.whiteSpace = 'pre-line';
		text.textContent = message;
		t.appendChild(icon);
		t.appendChild(text);
        host.appendChild(t);
		requestAnimationFrame(() => t.classList.add('show'));
		setTimeout(() => {
			t.classList.remove('show');
			setTimeout(() => t.remove(), 200);
		}, 3500);
	}

	window.toast = {
        success: (msg, opts={}) => createToast(msg, 'success', opts.anchor, opts.centered),
        error: (msg, opts={}) => createToast(msg, 'error', opts.anchor, opts.centered),
        info: (msg, opts={}) => createToast(msg, 'info', opts.anchor, opts.centered),
        warning: (msg, opts={}) => createToast(msg, 'warning', opts.anchor, opts.centered),
        show: (msg, opts={}) => createToast(msg, opts.type || 'info', opts.anchor, opts.centered),
	};
})();

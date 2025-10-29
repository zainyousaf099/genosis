(async function(){
	// Import auth functions
	const { isAuthenticated, signOut, getCurrentUser } = await import('./auth-api.js');
	
	// Check authentication on page load
	if (!isAuthenticated()) {
		window.location.href = 'login.html';
		return;
	}

	// Basic used-space UI initializer — update values from server/JS as needed
	function setUsedSpace(usedGB, totalGB){
		const track = document.querySelector('.used-space-fill');
		const desc = document.querySelector('.used-space-desc');
		if(!track || !desc) return;
		const pct = totalGB > 0 ? Math.min(100, Math.round((usedGB/totalGB)*100)) : 0;
		track.style.width = pct + '%';
		desc.textContent = `You've used ${usedGB.toFixed(2)} GB of your ${totalGB} GB available space.`;
	}

	// Sidebar navigation functions
	function loadDashboard(event) {
		event.preventDefault();
		// Remove active class from all menu items
		document.querySelectorAll('.menu li').forEach(item => item.classList.remove('active'));
		// Add active class to clicked item
		event.currentTarget.classList.add('active');
		console.log('Dashboard loaded');
	}

	function loadVaults(event) {
		event.preventDefault();
		// Remove active class from all menu items
		document.querySelectorAll('.menu li').forEach(item => item.classList.remove('active'));
		// Add active class to clicked item
		event.currentTarget.classList.add('active');
		console.log('Vaults loaded');
	}

	function loadCalendar(event) {
		event.preventDefault();
		// Remove active class from all menu items
		document.querySelectorAll('.menu li').forEach(item => item.classList.remove('active'));
		// Add active class to clicked item
		event.currentTarget.classList.add('active');
		console.log('Calendar loaded');
	}

	function loadSearch(event) {
		event.preventDefault();
		// Remove active class from all menu items
		document.querySelectorAll('.menu li').forEach(item => item.classList.remove('active'));
		// Add active class to clicked item
		event.currentTarget.classList.add('active');
		console.log('Search loaded');
	}

	function loadSettings(event) {
		event.preventDefault();
		// Remove active class from all menu items
		document.querySelectorAll('.menu li').forEach(item => item.classList.remove('active'));
		// Add active class to clicked item
		event.currentTarget.classList.add('active');
		console.log('Settings loaded');
	}

	async function logout(event) {
		event.preventDefault();
		// Remove active class from all menu items
		document.querySelectorAll('.menu li').forEach(item => item.classList.remove('active'));
		// Add active class to clicked item
		event.currentTarget.classList.add('active');
		console.log('Logout clicked');
		
		// Sign out using centralized auth API
		signOut();
		
		// Redirect to login page
		window.location.href = 'login.html';
	}

	// Vault functionality moved to vault_component.js

	document.addEventListener('DOMContentLoaded', function(){
		// set initial values (replace with real values later)
		setUsedSpace(0, 1);
	});

	// Expose functions globally
	window.setUsedSpace = setUsedSpace;
	window.loadDashboard = loadDashboard;
	window.loadVaults = loadVaults;
	window.loadCalendar = loadCalendar;
	window.loadSearch = loadSearch;
	window.loadSettings = loadSettings;
	window.logout = logout;
})();


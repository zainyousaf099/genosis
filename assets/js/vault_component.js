(async function(){
	// Import API client and auth functions
	const { default: apiClient } = await import('./api-client.js');
	const { getCurrentUser } = await import('./auth-api.js');
	
	// Global state
	let currentVaultId = null;
	let vaults = [];
	
	// ================== API FUNCTIONS ==================
	
	/**
	 * Fetch all vaults for the current user
	 */
	async function fetchVaults() {
		try {
			const user = getCurrentUser();
			console.log('Current user:', user);
			
			if (!user) {
				console.error('No user logged in');
				return [];
			}
			
			// Try to get vaults filtered by userId first
			// If userId filtering doesn't work, we'll fetch all and filter client-side
			let response;
			
			if (user.id) {
				console.log('Fetching vaults for user ID:', user.id);
				try {
					// Try fetching with userId parameter
					response = await apiClient.get(`/Vault/?userId=${user.id}`);
				} catch (error) {
					console.warn('Failed to fetch with userId filter, trying without filter:', error);
					// If that fails, try fetching all vaults
					response = await apiClient.get('/Vault/');
				}
			} else {
				console.log('User ID not available, fetching all vaults');
				response = await apiClient.get('/Vault/');
			}
			
			console.log('Raw API response:', response);
			
			// Ensure response is an array
			let vaults = Array.isArray(response) ? response : [];
			console.log('Vaults array:', vaults);
			
			// If we got all vaults and have a user ID, filter by createdBy
			if (user.id && vaults.length > 0) {
				// Check if filtering is needed (if API didn't filter already)
				const allFromDifferentUsers = vaults.some(v => v.createdBy !== user.id);
				if (allFromDifferentUsers) {
					console.log('Filtering vaults by createdBy =', user.id);
					vaults = vaults.filter(v => v.createdBy === user.id);
					console.log('Filtered vaults:', vaults);
				}
			}
			
			console.log('Final vaults to display:', vaults.length, vaults);
			return vaults;
		} catch (error) {
			console.error('Error fetching vaults:', error);
			alert('Failed to load vaults. Please try again.');
			return [];
		}
	}
	
	/**
	 * Create a new vault
	 */
	async function createVaultAPI(vaultName) {
		try {
			const user = getCurrentUser();
			if (!user || !user.id) {
				throw new Error('No user logged in');
			}
			
			const payload = {
				name: vaultName,
				createdBy: user.id
			};
			
			console.log('Creating vault with payload:', payload);
			const response = await apiClient.post('/Vault/', payload);
			console.log('Vault created:', response);
			return response;
		} catch (error) {
			console.error('Error creating vault:', error);
			throw error;
		}
	}
	
	/**
	 * Update vault (rename)
	 */
	async function updateVaultAPI(vaultId, newName) {
		try {
			const user = getCurrentUser();
			if (!user || !user.id) {
				throw new Error('No user logged in');
			}
			
			const payload = {
				name: newName,
				createdBy: user.id
			};
			
			console.log(`Updating vault ${vaultId} with payload:`, payload);
			const response = await apiClient.put(`/Vault/${vaultId}`, payload);
			console.log('Vault updated:', response);
			return response;
		} catch (error) {
			console.error('Error updating vault:', error);
			throw error;
		}
	}
	
	/**
	 * Delete vault
	 */
	async function deleteVaultAPI(vaultId) {
		try {
			console.log(`Deleting vault ${vaultId}`);
			await apiClient.delete(`/Vault/${vaultId}`);
			console.log('Vault deleted successfully');
		} catch (error) {
			console.error('Error deleting vault:', error);
			throw error;
		}
	}
	
	/**
	 * Duplicate vault
	 */
	async function duplicateVaultAPI(vaultId) {
		try {
			const user = getCurrentUser();
			if (!user || !user.id) {
				throw new Error('No user logged in');
			}
			
			const payload = {
				createdBy: user.id
			};
			
			console.log(`Duplicating vault ${vaultId}`);
			const response = await apiClient.post(`/Vault/${vaultId}/duplicate`, payload);
			console.log('Vault duplicated:', response);
			return response;
		} catch (error) {
			console.error('Error duplicating vault:', error);
			throw error;
		}
	}
	
	// ================== UI RENDERING FUNCTIONS ==================
	
	/**
	 * Render vaults to the grid
	 */
	function renderVaults(vaultsData) {
		console.log('renderVaults called with:', vaultsData);
		const grid = document.querySelector('.locker-grid');
		
		if (!grid) {
			console.error('Locker grid not found! Make sure .locker-grid element exists in HTML');
			return;
		}
		
		console.log('Locker grid found:', grid);
		
		// Clear existing cards
		grid.innerHTML = '';
		
		if (!vaultsData || vaultsData.length === 0) {
			console.log('No vaults to display - showing empty state');
			grid.innerHTML = `
				<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #6b7280;">
					<p style="font-size: 16px; margin-bottom: 8px;">No vaults yet</p>
					<p style="font-size: 14px;">Click "Add New" to create your first vault</p>
				</div>
			`;
			return;
		}
		
		console.log(`Rendering ${vaultsData.length} vault(s)`);
		
		// Render each vault
		vaultsData.forEach((vault, index) => {
			console.log(`Creating card ${index + 1} for vault:`, vault);
			const card = createVaultCard(vault);
			grid.appendChild(card);
		});
		
		console.log('All vault cards rendered successfully');
	}
	
	/**
	 * Create a vault card element
	 */
	function createVaultCard(vault) {
		const article = document.createElement('article');
		article.className = 'locker-card';
		article.setAttribute('role', 'article');
		article.setAttribute('aria-label', vault.name);
		article.setAttribute('data-vault-id', vault.id);
		
		// Format dates
		const createdDate = vault.createdDateTime ? new Date(vault.createdDateTime).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A';
		const updatedDate = vault.lastModifyDateTime ? new Date(vault.lastModifyDateTime).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : createdDate;
		
		// Calculate storage using correct API field names
		const storageUsed = vault.usedStorageInGb || 0;
		const storageTotal = vault.totalStorageInGb || 1;
		const storagePercentage = storageTotal > 0 ? Math.min(100, Math.round((storageUsed / storageTotal) * 100)) : 0;
		
		// Number of users
		const numUsers = vault.numOfUsers || 0;
		
		article.innerHTML = `
			<div class="locker-card-header">
				<div class="locker-title">
					<div class="locker-icon-img">
						<img src="assets/images/lock.svg" alt="Locker icon">
					</div>
					<h3>${vault.name}</h3>
				</div>
				<div class="locker-actions">
					<a href="vault.html?id=${vault.id}"><img src="assets/images/expand.svg" alt="Expand" class="icon-btn" title="Expand"></a>
					<img src="assets/images/dots.svg" alt="More" class="icon-btn" title="More options" onclick="showContextMenu(event, this, ${vault.id})">
				</div>
			</div>

			<div class="locker-details">
				<div><img src="assets/images/calendar.svg" alt="created"> Date created: <strong>${createdDate}</strong></div>
				<div><img src="assets/images/calendar.svg" alt="updated"> Date updated: <strong>${updatedDate}</strong></div>
				<div><img src="assets/images/users.svg" alt="users"> No. of users: <strong>${numUsers}</strong></div>
			</div>

			<div class="locker-storage">
				<div class="storage-label">Storage</div>
				<div class="org-progress"><div class="fill" style="width:${storagePercentage}%"></div></div>
				<div class="storage-text">Used: ${storageUsed} GB / ${storageTotal} GB</div>
			</div>
		`;
		
		return article;
	}
	
	/**
	 * Load and display vaults
	 */
	async function loadVaults() {
		console.log('Loading vaults...');
		vaults = await fetchVaults();
		renderVaults(vaults);
	}
	
	// ================== MODAL FUNCTIONS ==================
	
	function openCreateVaultModal() {
		const modal = document.getElementById('createVaultModal');
		const input = document.getElementById('vaultNameInput');
		
		if (!modal || !input) return;
		
		modal.classList.add('show');
		input.focus();
		
		// Close modal when clicking outside
		modal.addEventListener('click', function(e) {
			if (e.target === modal) {
				closeCreateVaultModal();
			}
		});
		
		// Close modal with Escape key
		document.addEventListener('keydown', function(e) {
			if (e.key === 'Escape') {
				closeCreateVaultModal();
			}
		});
	}

	function closeCreateVaultModal() {
		const modal = document.getElementById('createVaultModal');
		const input = document.getElementById('vaultNameInput');
		
		if (!modal || !input) return;
		
		modal.classList.remove('show');
		input.value = '';
	}

	async function createVault() {
		const input = document.getElementById('vaultNameInput');
		const vaultName = input.value.trim();
		
		if (vaultName === '') {
			alert('Please enter a vault name');
			return;
		}
		
		try {
			console.log('Creating vault:', vaultName);
			await createVaultAPI(vaultName);
			
			closeCreateVaultModal();
			alert(`Vault "${vaultName}" created successfully!`);
			
			// Reload vaults to show the new one
			await loadVaults();
		} catch (error) {
			alert(`Failed to create vault: ${error.message}`);
		}
	}

	// ================== CONTEXT MENU FUNCTIONS ==================
	
	function showContextMenu(event, button, vaultId) {
		event.preventDefault();
		event.stopPropagation();
		
		// Store the current vault ID for context menu actions
		currentVaultId = vaultId;
		
		const menu = document.getElementById('contextMenu');
		if (!menu) return;
		
		// Position the menu near the button
		const rect = button.getBoundingClientRect();
		menu.style.left = rect.right + 'px';
		menu.style.top = rect.bottom + 'px';
		
		menu.classList.add('show');
		
		// Close menu when clicking outside
		setTimeout(() => {
			document.addEventListener('click', closeContextMenu);
		}, 0);
	}

	function closeContextMenu() {
		const menu = document.getElementById('contextMenu');
		if (!menu) return;
		
		menu.classList.remove('show');
		document.removeEventListener('click', closeContextMenu);
	}

	async function duplicateVault() {
		closeContextMenu();
		
		if (!currentVaultId) {
			alert('No vault selected');
			return;
		}
		
		try {
			console.log('Duplicating vault:', currentVaultId);
			await duplicateVaultAPI(currentVaultId);
			alert('Vault duplicated successfully!');
			
			// Reload vaults to show the duplicate
			await loadVaults();
		} catch (error) {
			alert(`Failed to duplicate vault: ${error.message}`);
		}
	}

	function openPermissionsModal() {
		const modal = document.getElementById('permissionsModal');
		const input = document.getElementById('permissionEmailInput');
		
		if (!modal || !input) return;
		
		closeContextMenu();
		modal.classList.add('show');
		input.focus();
		
		// Close modal when clicking outside
		modal.addEventListener('click', function(e) {
			if (e.target === modal) {
				closePermissionsModal();
			}
		});
		
		// Close modal with Escape key
		document.addEventListener('keydown', function(e) {
			if (e.key === 'Escape') {
				closePermissionsModal();
			}
		});
	}

	function closePermissionsModal() {
		const modal = document.getElementById('permissionsModal');
		const input = document.getElementById('permissionEmailInput');
		
		if (!modal || !input) return;
		
		modal.classList.remove('show');
		input.value = '';
	}

	function addPermission() {
		const input = document.getElementById('permissionEmailInput');
		const select = document.getElementById('permissionType');
		const email = input.value.trim();
		const permissionType = select.value;
		
		if (email === '') {
			alert('Please enter an email or name');
			return;
		}
		
		console.log('Adding permission:', email, permissionType);
		
		// Add the permission to the display area
		const displayArea = document.querySelector('.permissions-display-area');
		if (displayArea.querySelector('.permissions-empty')) {
			displayArea.innerHTML = '';
		}
		
		const permissionItem = document.createElement('div');
		permissionItem.className = 'permission-item';
		permissionItem.innerHTML = `
			<div class="permission-user-info">
				<img src="assets/images/user-01.svg" alt="User" class="permission-icon">
				<span>${email}</span>
			</div>
			<span class="permission-badge">${permissionType}</span>
		`;
		displayArea.appendChild(permissionItem);
		
		input.value = '';
		alert(`Permission added for ${email} as ${permissionType}!`);
		
		// TODO: Implement API call to save permissions
	}

	function showPermissions() {
		openPermissionsModal();
	}

	async function renameVault() {
		closeContextMenu();
		
		if (!currentVaultId) {
			alert('No vault selected');
			return;
		}
		
		const newName = prompt('Enter new name for the vault:');
		if (!newName || newName.trim() === '') {
			return;
		}
		
		try {
			console.log('Renaming vault:', currentVaultId, 'to', newName);
			await updateVaultAPI(currentVaultId, newName.trim());
			alert(`Vault renamed to "${newName}" successfully!`);
			
			// Reload vaults to show the updated name
			await loadVaults();
		} catch (error) {
			alert(`Failed to rename vault: ${error.message}`);
		}
	}

	async function deleteVault() {
		closeContextMenu();
		
		if (!currentVaultId) {
			alert('No vault selected');
			return;
		}
		
		if (!confirm('Are you sure you want to delete this vault? This action cannot be undone.')) {
			return;
		}
		
		try {
			console.log('Deleting vault:', currentVaultId);
			await deleteVaultAPI(currentVaultId);
			alert('Vault deleted successfully!');
			
			// Reload vaults to remove the deleted one
			await loadVaults();
		} catch (error) {
			alert(`Failed to delete vault: ${error.message}`);
		}
	}
	
	// ================== INITIALIZATION ==================
	
	// Expose vault functions globally first
	window.openCreateVaultModal = openCreateVaultModal;
	window.closeCreateVaultModal = closeCreateVaultModal;
	window.createVault = createVault;
	window.showContextMenu = showContextMenu;
	window.closeContextMenu = closeContextMenu;
	window.duplicateVault = duplicateVault;
	window.showPermissions = showPermissions;
	window.openPermissionsModal = openPermissionsModal;
	window.closePermissionsModal = closePermissionsModal;
	window.addPermission = addPermission;
	window.renameVault = renameVault;
	window.deleteVault = deleteVault;
	window.loadVaults = loadVaults; // Expose for manual refresh
	
	// Load vaults when the page loads
	console.log('Vault component initialized');
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', function() {
			console.log('DOMContentLoaded - loading vaults');
			loadVaults();
		});
	} else {
		// DOM is already loaded
		console.log('DOM already loaded - loading vaults immediately');
		loadVaults();
	}
})();


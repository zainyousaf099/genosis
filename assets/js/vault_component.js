(function(){
	// Vault Modal functions
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

	function createVault() {
		const input = document.getElementById('vaultNameInput');
		const vaultName = input.value.trim();
		
		if (vaultName === '') {
			alert('Please enter a vault name');
			return;
		}
		
		console.log('Creating vault:', vaultName);
		
		// Here you would typically send the data to your server
		// For now, we'll just close the modal and show a success message
		closeCreateVaultModal();
		alert(`Vault "${vaultName}" created successfully!`);
		
		// You can add logic here to refresh the vault list or add the new vault to the UI
	}

	// Context menu functions
	function showContextMenu(event, button) {
		event.preventDefault();
		event.stopPropagation();
		
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

	function duplicateVault() {
		console.log('Duplicate vault clicked');
		closeContextMenu();
		alert('Vault duplicated successfully!');
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
	}

	function showPermissions() {
		openPermissionsModal();
	}

	function renameVault() {
		console.log('Rename vault clicked');
		closeContextMenu();
		const newName = prompt('Enter new name for the vault:');
		if (newName) {
			console.log('Renaming vault to:', newName);
			alert(`Vault renamed to "${newName}"!`);
		}
	}

	function deleteVault() {
		console.log('Delete vault clicked');
		closeContextMenu();
		if (confirm('Are you sure you want to delete this vault?')) {
			alert('Vault deleted successfully!');
		}
	}

	// Expose vault functions globally
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
})();


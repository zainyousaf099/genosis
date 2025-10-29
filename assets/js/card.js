// Card Management System
class CardManager {
  constructor() {
    this.cards = [];
    this.loadCardsFromStorage();
  }

  // Load cards from localStorage
  loadCardsFromStorage() {
    const savedCards = localStorage.getItem('cards');
    if (savedCards) {
      this.cards = JSON.parse(savedCards);
      this.renderCards();
    }
  }

  // Save cards to localStorage
  saveCardsToStorage() {
    localStorage.setItem('cards', JSON.stringify(this.cards));
  }

  // Create a new card
  createCard(title, description, priority, assignee, date) {
    const card = {
      id: 'card_' + Date.now(),
      title: title,
      description: description,
      priority: priority,
      assignee: assignee,
      date: date,
      createdDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      position: {
        x: Math.random() * 300 + 50,
        y: Math.random() * 200 + 50
      }
    };

    this.cards.push(card);
    this.saveCardsToStorage();
    this.renderCards();
    this.updateReferencedBy();
    
    return card;
  }

  // Delete a card
  deleteCard(cardId) {
    this.cards = this.cards.filter(card => card.id !== cardId);
    this.saveCardsToStorage();
    this.renderCards();
    this.updateReferencedBy();
  }

  // Render all cards
  renderCards() {
    const cardsContainer = document.getElementById('cardsContainer');
    if (!cardsContainer) return;

    cardsContainer.innerHTML = '';

    this.cards.forEach(card => {
      const cardElement = this.createCardElement(card);
      cardsContainer.appendChild(cardElement);
    });

    // Update notes editor visibility
    this.updateNotesEditorVisibility();
    
    // Update referenced by section
    this.updateReferencedBy();
  }

  // Create a card element
  createCardElement(card) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    cardDiv.id = card.id;
    cardDiv.style.left = card.position.x + 'px';
    cardDiv.style.top = card.position.y + 'px';
    cardDiv.draggable = true;

    // Determine card color based on priority, assignee, or card ID for variety
    const cardColor = this.getCardColor(card.priority, card.assignee, card.id);
    cardDiv.style.backgroundColor = cardColor;

    cardDiv.innerHTML = `
      <div class="card-header">
        <h3 class="card-title">${card.title}</h3>
        <img src="assets/images/block-circle.svg" alt="Delete" class="card-delete" style="width: 16px; height: 16px; cursor: pointer; opacity: 0.6;">
      </div>
      <div class="card-priority">${card.priority || 'No priority'}</div>
      <div class="card-description">${card.description || 'No description'}</div>
      <div class="card-footer">
        <span class="card-created">Created: ${card.createdDate}</span>
      </div>
    `;

    // Make card draggable
    this.makeCardDraggable(cardDiv, card);

    // Add delete functionality
    const deleteBtn = cardDiv.querySelector('.card-delete');
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm('Are you sure you want to delete this card?')) {
        this.deleteCard(card.id);
      }
    });

    return cardDiv;
  }

  // Get card color
  getCardColor(priority, assignee, cardId) {
    // Simple color scheme based on priority
    if (priority && priority.toLowerCase().includes('high')) {
      return '#fee2e2'; // Light red
    } else if (priority && priority.toLowerCase().includes('medium')) {
      return '#fef3c7'; // Light yellow
    } else if (priority && priority.toLowerCase().includes('low')) {
      return '#dbeafe'; // Light blue
    } else {
      // Default colors rotated by card ID or assignee or index
      const colors = [
        '#dbeafe', // Light blue
        '#fef3c7', // Light yellow
        '#e9d5ff', // Light purple
        '#fce7f3', // Light pink
        '#d1fae5', // Light green
        '#fef3c7', // Light orange
        '#f3f4f6', // Light gray
        '#fed7aa'  // Light peach
      ];
      
      // Use card ID to determine color (more random variety)
      const hash = (cardId || '').split('').reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
      }, 0);
      
      return colors[Math.abs(hash) % colors.length];
    }
  }

  // Make card draggable
  makeCardDraggable(cardElement, card) {
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    cardElement.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('card-delete')) {
        return; // Don't drag when clicking delete
      }
      
      initialX = e.clientX - xOffset;
      initialY = e.clientY - yOffset;

      if (e.target === cardElement || cardElement.contains(e.target)) {
        isDragging = true;
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;

        xOffset = currentX;
        yOffset = currentY;

        setTranslate(currentX, currentY, cardElement);
      }
    });

    document.addEventListener('mouseup', (e) => {
      if (isDragging) {
        initialX = currentX;
        initialY = currentY;
        
        // Save position (get current computed position)
        const rect = cardElement.getBoundingClientRect();
        const container = document.getElementById('cardsContainer');
        if (container) {
          const containerRect = container.getBoundingClientRect();
          card.position.x = rect.left - containerRect.left;
          card.position.y = rect.top - containerRect.top;
          this.saveCardsToStorage();
        }
        
        isDragging = false;
      }
    });

    function setTranslate(xPos, yPos, el) {
      el.style.transform = 'translate3d(' + xPos + 'px, ' + yPos + 'px, 0)';
    }
  }

  // Update notes editor visibility - always show it
  updateNotesEditorVisibility() {
    const pageHashtag = document.getElementById('pageHashtag');
    if (pageHashtag) {
      pageHashtag.style.display = 'block';
    }
  }

  // Update Referenced By section in right sidebar
  updateReferencedBy() {
    const referencedList = document.getElementById('referencedByList');
    if (!referencedList) return;

    referencedList.innerHTML = '';

    if (this.cards.length === 0) {
      const emptyItem = document.createElement('div');
      emptyItem.innerHTML = '<span style="color: #9ca3af; font-style: italic;">No references</span>';
      referencedList.appendChild(emptyItem);
      return;
    }

    this.cards.forEach(card => {
      const item = document.createElement('div');
      item.className = 'referenced-item';
      item.innerHTML = `
        <img src="assets/images/dots.svg" alt="Item">
        <span>${card.title}</span>
      `;
      referencedList.appendChild(item);
    });
  }

  // Extract tags from text (starting with #)
  extractTags(text) {
    const tags = [];
    if (!text) return tags;
    
    const tagRegex = /#(\w+)/g;
    let match;
    while ((match = tagRegex.exec(text)) !== null) {
      if (!tags.includes(match[1])) {
        tags.push(match[1]);
      }
    }
    return tags;
  }

  // Extract links from text
  extractLinks(text) {
    const links = [];
    if (!text) return links;
    
    const linkRegex = /(www\.[^\s]+|https?:\/\/[^\s]+)/g;
    let match;
    while ((match = linkRegex.exec(text)) !== null) {
      if (!links.includes(match[1])) {
        links.push(match[1]);
      }
    }
    return links;
  }

  // Update Page Tags section (optimized to reduce DOM manipulation)
  updatePageTags() {
    const tagsList = document.querySelector('#pageTagsList');
    if (!tagsList) return;

    let allTags = [];
    // Use Set for faster deduplication
    const tagsSet = new Set();
    
    // Extract tags from cards
    this.cards.forEach(card => {
      if (card.description) {
        const cardTags = this.extractTags(card.description);
        cardTags.forEach(tag => tagsSet.add(tag));
      }
    });

    // Extract tags from notes editor
    const notesEditor = document.querySelector('.notes-editor');
    if (notesEditor && notesEditor.textContent) {
      const noteTags = this.extractTags(notesEditor.textContent);
      noteTags.forEach(tag => tagsSet.add(tag));
    }

    allTags = Array.from(tagsSet);
    
    // Use DocumentFragment to batch DOM updates
    const fragment = document.createDocumentFragment();

    if (allTags.length === 0) {
      const emptySpan = document.createElement('span');
      emptySpan.style.cssText = 'color: #9ca3af; font-style: italic;';
      emptySpan.textContent = 'No tags found';
      fragment.appendChild(emptySpan);
    } else {
      allTags.forEach(tag => {
        const tagElement = document.createElement('div');
        tagElement.className = 'referenced-item';
        const span = document.createElement('span');
        span.textContent = `#${tag}`;
        tagElement.appendChild(span);
        fragment.appendChild(tagElement);
      });
    }
    
    // Single DOM update instead of multiple
    tagsList.innerHTML = '';
    tagsList.appendChild(fragment);
  }

  // Update External Links section (optimized to reduce DOM manipulation)
  updateExternalLinks() {
    const linksList = document.querySelector('#externalLinksList');
    if (!linksList) return;

    let allLinks = [];
    const linksSet = new Set();
    
    // Extract links from cards
    this.cards.forEach(card => {
      if (card.description) {
        const cardLinks = this.extractLinks(card.description);
        cardLinks.forEach(link => linksSet.add(link));
      }
    });

    // Extract links from notes editor
    const notesEditor = document.querySelector('.notes-editor');
    if (notesEditor && notesEditor.textContent) {
      const noteLinks = this.extractLinks(notesEditor.textContent);
      noteLinks.forEach(link => linksSet.add(link));
    }

    allLinks = Array.from(linksSet);
    
    // Use DocumentFragment to batch DOM updates
    const fragment = document.createDocumentFragment();

    if (allLinks.length === 0) {
      const emptySpan = document.createElement('span');
      emptySpan.style.cssText = 'color: #9ca3af; font-style: italic; margin-left: 24px;';
      emptySpan.textContent = 'No links found';
      fragment.appendChild(emptySpan);
    } else {
      allLinks.forEach(link => {
        const linkElement = document.createElement('div');
        linkElement.className = 'referenced-item';
        
        const img = document.createElement('img');
        img.src = 'assets/images/link.svg';
        img.alt = 'Link';
        img.style.cssText = 'width: 16px; height: 16px; opacity: 0.5;';
        
        const span = document.createElement('span');
        span.textContent = link;
        
        linkElement.appendChild(img);
        linkElement.appendChild(span);
        
        linkElement.onclick = () => {
          const fullLink = link.startsWith('http') ? link : 'https://' + link;
          window.open(fullLink, '_blank');
        };
        
        fragment.appendChild(linkElement);
      });
    }
    
    // Single DOM update instead of multiple
    linksList.innerHTML = '';
    linksList.appendChild(fragment);
  }
}

// Initialize card manager
let cardManager;

// Debounce function to limit how often functions are called
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Store the debounced update function
let debouncedUpdateTagsAndLinks = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  cardManager = new CardManager();
  
  // Create debounced function (wait 500ms after user stops typing)
  debouncedUpdateTagsAndLinks = debounce(function() {
    if (cardManager) {
      cardManager.updatePageTags();
      cardManager.updateExternalLinks();
    }
  }, 500);
  
  // Attach listener once using event delegation from document
  // This ensures it works even when notes editor is dynamically added/removed
  document.addEventListener('input', function(e) {
    if (e.target && e.target.classList.contains('notes-editor')) {
      if (debouncedUpdateTagsAndLinks) {
        debouncedUpdateTagsAndLinks();
      }
    }
  }, { passive: true }); // Use passive for better performance
});

// Function to save a card (called from vault.html)
function saveCardToManager(title, description, priority, assignee, date) {
  if (!cardManager) {
    cardManager = new CardManager();
  }
  cardManager.createCard(title, description, priority, assignee, date);
}


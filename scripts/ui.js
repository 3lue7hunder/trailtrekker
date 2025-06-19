// UI Management Module
class UIManager {
    constructor() {
        this.currentView = 'home';
        this.modal = null;
        this.init();
    }

    init() {
        this.setupModal();
        this.setupNavigation();
        this.setupFilters();
        this.setupSearchForm();
    }

    setupModal() {
        this.modal = document.getElementById('trailModal');
        const closeBtn = document.getElementById('closeModal');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
    }

    setupNavigation() {
        // Navigation event listeners
        const homeLink = document.querySelector('a[href="#home"]');
        const trailsLink = document.querySelector('a[href="#trails"]');
        const savedLink = document.getElementById('savedTrailsLink');

        if (homeLink) {
            homeLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSection('home');
            });
        }

        if (trailsLink) {
            trailsLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSection('trails');
            });
        }

        if (savedLink) {
            savedLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSection('saved');
            });
        }
    }

    setupFilters() {
        const difficultyFilter = document.getElementById('difficultyFilter');
        const lengthFilter = document.getElementById('lengthFilter');
        const featuresFilter = document.getElementById('featuresFilter');

        if (difficultyFilter) {
            difficultyFilter.addEventListener('change', () => {
                if (window.app) window.app.filterTrails();
            });
        }

        if (lengthFilter) {
            lengthFilter.addEventListener('change', () => {
                if (window.app) window.app.filterTrails();
            });
        }

        if (featuresFilter) {
            featuresFilter.addEventListener('change', () => {
                if (window.app) window.app.filterTrails();
            });
        }
    }

    setupSearchForm() {
        const searchForm = document.getElementById('searchForm');
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                if (window.app) window.app.filterTrails();
            });
        }
    }

    showSection(sectionName) {
        // Hide all sections
        const sections = ['home', 'trails', 'savedTrails'];
        sections.forEach(section => {
            const element = document.getElementById(section === 'home' ? 'home' : 
                            section === 'trails' ? 'trails' : 'savedTrails');
            if (element) {
                if (section === sectionName || (sectionName === 'trails' && section === 'trails')) {
                    element.classList.remove('hidden');
                } else {
                    element.classList.add('hidden');
                }
            }
        });

        this.currentView = sectionName;
        
        // Update app state if available
        if (window.app) {
            window.app.currentView = sectionName;
            if (sectionName === 'saved') {
                window.app.showSavedTrails();
            } else {
                window.app.renderTrails();
            }
        }
    }

    showModal(title, content) {
        if (!this.modal) return;

        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');

        if (modalTitle) modalTitle.textContent = title;
        if (modalBody) modalBody.innerHTML = content;

        this.modal.style.display = 'block';
    }

    closeModal() {
        if (this.modal) {
            this.modal.style.display = 'none';
        }
    }

    showLoading(container) {
        if (container) {
            container.innerHTML = `
                <div class="loading">
                    <div class="spinner"></div>
                </div>
            `;
        }
    }

    showError(container, message = 'An error occurred. Please try again.') {
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <p>${message}</p>
                </div>
            `;
        }
    }

    // Helper method to get trail image URL
    getTrailImageUrl(trail) {
        // If trail has an image property, use it
        if (trail.image) {
            return trail.image;
        }
        
        // Generate image filename based on trail name to match your existing files
        const imageName = trail.name.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '') // Remove special characters
            .replace(/\s+/g, '_') // Replace spaces with underscores to match your filenames
            .trim();
        
        return `images/${imageName}.jpg`;
    }

    // Helper method to get fallback image
    getFallbackImage() {
        return 'images/default-trail.jpg';
    }

    renderTrailCard(trail, isSaved = false) {
        const imageUrl = this.getTrailImageUrl(trail);
        const fallbackUrl = this.getFallbackImage();
        
        return `
            <div class="trail-card" onclick="app.showTrailDetails(${trail.id})">
                <div class="trail-image">
                    <img src="${imageUrl}" 
                         alt="${trail.name}" 
                         onerror="this.onerror=null; this.src='${fallbackUrl}';"
                         loading="lazy">
                    <div class="trail-overlay">
                        <div class="trail-quick-info">
                            <span class="trail-time">⏱️ ${trail.estimatedTime}</span>
                            <span class="trail-season">📅 ${trail.season}</span>
                        </div>
                    </div>
                </div>
                <div class="trail-content">
                    <div class="trail-header">
                        <h3 class="trail-title">${trail.name}</h3>
                        <div class="trail-rating">
                            <span>⭐</span>
                            <span>${trail.rating}</span>
                        </div>
                    </div>
                    <div class="trail-info">
                        <div class="trail-info-item">
                            <span>📍</span>
                            <span>${trail.location}</span>
                        </div>
                        <div class="trail-info-item">
                            <span>📏</span>
                            <span>${trail.length} miles</span>
                        </div>
                        <div class="trail-info-item">
                            <span>⬆️</span>
                            <span>${trail.elevation} ft</span>
                        </div>
                    </div>
                    <div class="difficulty-badge difficulty-${trail.difficulty}">
                        ${trail.difficulty}
                    </div>
                    <div class="trail-tags">
                        ${trail.features.slice(0, 3).map(feature => 
                            `<span class="tag">${feature.replace('-', ' ')}</span>`
                        ).join(' ')}
                    </div>
                    <div class="trail-actions" onclick="event.stopPropagation()">
                        <button class="btn btn-primary" onclick="app.showTrailDetails(${trail.id})">
                            View Details
                        </button>
                        <button class="btn btn-secondary" onclick="app.toggleSaveTrail(${trail.id})">
                            ${isSaved ? 'Saved ✓' : 'Save Trail'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    updateSaveButton(trailId, isSaved) {
        const buttons = document.querySelectorAll(`button[onclick*="toggleSaveTrail(${trailId})"]`);
        buttons.forEach(button => {
            button.textContent = isSaved ? 'Saved ✓' : 'Save Trail';
            if (isSaved) {
                button.classList.add('saved');
            } else {
                button.classList.remove('saved');
            }
        });
    }

    showNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'var(--forest-green)' : '#dc3545'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 9999;
            animation: slideIn 0.3s ease-out;
        `;

        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    formatFeatureName(feature) {
        return feature.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        let stars = '';
        
        for (let i = 0; i < fullStars; i++) {
            stars += '⭐';
        }
        
        if (hasHalfStar) {
            stars += '⭐'; // Could use a half-star character if available
        }
        
        return stars;
    }

    setupHamburgerMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const navOverlay = document.getElementById('navOverlay');

    if (!hamburger || !navMenu || !navOverlay) return;

    // Toggle menu on hamburger click
    hamburger.addEventListener('click', () => {
        const isOpen = navMenu.classList.contains('active');
        
        if (isOpen) {
            this.closeHamburgerMenu();
        } else {
            this.openHamburgerMenu();
        }
    });

    // Close menu on overlay click
    navOverlay.addEventListener('click', () => {
        this.closeHamburgerMenu();
    });

    // Close menu on navigation link click
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            this.closeHamburgerMenu();
        });
    });
}

openHamburgerMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const navOverlay = document.getElementById('navOverlay');

    hamburger?.classList.add('active');
    navMenu?.classList.add('active');
    navOverlay?.classList.add('active');
    document.body.style.overflow = 'hidden';
}

closeHamburgerMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const navOverlay = document.getElementById('navOverlay');

    hamburger?.classList.remove('active');
    navMenu?.classList.remove('active');
    navOverlay?.classList.remove('active');
    document.body.style.overflow = '';
}
}

// Initialize UI Manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.uiManager = new UIManager();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIManager;
}
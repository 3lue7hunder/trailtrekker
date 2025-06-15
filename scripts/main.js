// TrailTrekker Main Application Controller
class TrailTrekker {
    constructor() {
        this.trails = [];
        this.savedTrails = this.loadSavedTrails();
        this.reviews = this.loadReviews();
        this.filteredTrails = [];
        this.currentView = 'trails'; // Changed from 'home' to 'trails'
        this.uiManager = null;

        this.init();
    }

    async init() {
        // Wait for UIManager to be available
        if (window.uiManager) {
            this.uiManager = window.uiManager;
        } else {
            // Create UIManager if not available
            this.uiManager = new UIManager();
        }

        try {
            // Load trail data
            this.trails = await TrailData.loadTrails();
            this.filteredTrails = [...this.trails];
            console.log('Loaded trails:', this.trails.length);
        } catch (error) {
            console.error('Failed to load trail data:', error);
            this.trails = [];
            this.filteredTrails = [];
        }

        this.setupEventListeners();
        this.renderTrails();
        this.updateSavedTrailsCount(this.savedTrails.length);
    }

    setupEventListeners() {
        // Search and filters
        const searchForm = document.getElementById('searchForm');
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.filterTrails();
            });
        }

        // Filter change events
        const filters = ['difficultyFilter', 'lengthFilter', 'featuresFilter'];
        filters.forEach(filterId => {
            const filter = document.getElementById(filterId);
            if (filter) {
                filter.addEventListener('change', () => this.filterTrails());
            }
        });

        // Clear filters button
        const clearFilters = document.getElementById('clearFilters');
        if (clearFilters) {
            clearFilters.addEventListener('click', () => {
                const searchInput = document.getElementById('searchInput');
                const difficultyFilter = document.getElementById('difficultyFilter');
                const lengthFilter = document.getElementById('lengthFilter');
                const featuresFilter = document.getElementById('featuresFilter');
                
                if (searchInput) searchInput.value = '';
                if (difficultyFilter) difficultyFilter.value = '';
                if (lengthFilter) lengthFilter.value = '';
                if (featuresFilter) featuresFilter.value = '';
                
                this.filterTrails();
            });
        }

        // View toggle buttons
        const gridView = document.getElementById('gridView');
        const listView = document.getElementById('listView');

        if (gridView && listView) {
            gridView.addEventListener('click', () => {
                gridView.classList.add('active');
                listView.classList.remove('active');
                const trailsGrid = document.getElementById('trailsGrid');
                if (trailsGrid) {
                    trailsGrid.className = 'trails-grid';
                }
            });
            
            listView.addEventListener('click', () => {
                listView.classList.add('active');
                gridView.classList.remove('active');
                const trailsGrid = document.getElementById('trailsGrid');
                if (trailsGrid) {
                    trailsGrid.className = 'trails-list';
                }
            });
        }

        // Modal close button
        const closeModal = document.getElementById('closeModal');
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                this.hideModal();
            });
        }

        // Close modal on outside click
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('trailModal');
            if (e.target === modal) {
                this.hideModal();
            }
        });

        // Event delegation for dynamically generated trail cards
        const trailsGrid = document.getElementById('trailsGrid');
        if (trailsGrid) {
            trailsGrid.addEventListener('click', (e) => {
                const card = e.target.closest('.trail-card');
                if (!card) return;

                const trailId = parseInt(card.dataset.trailId, 10);
                if (isNaN(trailId)) return;

                // Check if clicked element is the Save button
                if (e.target.classList.contains('btn-secondary')) {
                    e.stopPropagation();
                    this.toggleSaveTrail(trailId);
                }
                // Check if clicked element is the View Details button
                else if (e.target.classList.contains('btn-primary')) {
                    e.stopPropagation();
                    this.showTrailDetails(trailId);
                }
                // Click on card itself
                else if (!e.target.classList.contains('btn')) {
                    this.showTrailDetails(trailId);
                }
            });
        }
    }

    filterTrails() {
        const searchInput = document.getElementById('searchInput');
        const difficultyFilter = document.getElementById('difficultyFilter');
        const lengthFilter = document.getElementById('lengthFilter');
        const featuresFilter = document.getElementById('featuresFilter');

        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const difficulty = difficultyFilter ? difficultyFilter.value : '';
        const length = lengthFilter ? lengthFilter.value : '';
        const features = featuresFilter ? featuresFilter.value : '';

        this.filteredTrails = this.trails.filter(trail => {
            const matchesSearch = !searchTerm || 
                trail.name.toLowerCase().includes(searchTerm) ||
                trail.location.toLowerCase().includes(searchTerm);

            const matchesDifficulty = !difficulty || trail.difficulty === difficulty;

            const matchesLength = !length || 
                (length === 'short' && trail.length < 3) ||
                (length === 'medium' && trail.length >= 3 && trail.length <= 6) ||
                (length === 'long' && trail.length > 6);

            const matchesFeatures = !features || trail.features.includes(features);

            return matchesSearch && matchesDifficulty && matchesLength && matchesFeatures;
        });

        this.renderTrails();
    }

     updateTrailRating(trailId) {
        if (window.reviewManager) {
            const avgRating = window.reviewManager.getAverageRating(trailId);
            const reviewCount = window.reviewManager.getReviewCount(trailId);

            // Update the trail object with new rating if reviews exist
            const trail = this.trails.find(t => t.id === trailId);
            if (trail && reviewCount > 0) {
                trail.rating = avgRating;
                trail.reviewCount = reviewCount;
            }
        }
    }

    renderTrails() {
        const trailsGrid = document.getElementById('trailsGrid');
        const resultsCount = document.getElementById('resultsCount');
        
        if (!trailsGrid) return;

        const trails = this.currentView === 'saved' ? this.getSavedTrailsData() : this.filteredTrails;

        // Update results count
        if (resultsCount) {
            const countText = trails.length === 1 ? '1 trail found' : `${trails.length} trails found`;
            resultsCount.textContent = countText;
        }

        if (trails.length === 0) {
            const message = this.currentView === 'saved' 
                ? 'No saved trails yet. Start exploring and save your favorites!'
                : 'No trails found matching your criteria.';
            trailsGrid.innerHTML = `<p class="no-results">${message}</p>`;
            return;
        }

        trailsGrid.innerHTML = trails.map(trail => this.createTrailCard(trail)).join('');

        if (window.mapManager && this.trails.length > 0) {
    setTimeout(() => {
        const overviewMapContainer = document.getElementById('overviewMap');
        if (overviewMapContainer) {
            window.mapManager.createOverviewMap('overviewMap', this.trails);
        }
    }, 500);
    }
    }

    

    createTrailCard(trail) {
        return `
            <div class="trail-card" data-trail-id="${trail.id}">
                <div class="trail-image"></div>
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
                            `<span class="tag">${feature.replace(/-/g, ' ')}</span>`
                        ).join('')}
                    </div>
                    <div class="trail-actions">
                        <button class="btn btn-primary">
                            View Details
                        </button>
                        <button class="btn btn-secondary">
                            ${this.savedTrails.includes(trail.id) ? 'Saved ✓' : 'Save Trail'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    showTrailDetails(trailId) {
        const trail = this.trails.find(t => t.id === trailId);
        if (!trail) return;

        this.showTrailModal(trail, this.savedTrails.includes(trailId));
    }

   showTrailModal(trail, isSaved) {
    const modal = document.getElementById('trailModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    if (!modal || !modalTitle || !modalBody) return;

   // In your showTrailModal method in main.js, replace the modalBody.innerHTML with this:

modalBody.innerHTML = `
    <div class="trail-details">
        <div class="trail-info-grid">
            <div class="info-item">
                <strong>Location:</strong> ${trail.location}
            </div>
            <div class="info-item">
                <strong>Length:</strong> ${trail.length} miles
            </div>
            <div class="info-item">
                <strong>Difficulty:</strong> ${trail.difficulty}
            </div>
            <div class="info-item">
                <strong>Elevation Gain:</strong> ${trail.elevation} ft
            </div>
            <div class="info-item">
                <strong>Rating:</strong> ⭐ ${trail.rating}
            </div>
            <div class="info-item">
                <strong>Estimated Time:</strong> ${trail.estimatedTime}
            </div>
        </div>
        
        <!-- ADD THIS MAP CONTAINER -->
        <div class="trail-map-section">
            <h3>Location</h3>
            <div id="trailMap" class="map-container" style="height: 300px; width: 100%; margin: 1rem 0;"></div>
        </div>
        
        <div class="trail-description">
            <h3>Description</h3>
            <p>${trail.description}</p>
        </div>
        
        <div class="trail-features">
            <h3>Features</h3>
            <div class="features-list">
                ${trail.features.map(feature => 
                    `<span class="feature-tag">${feature.replace(/-/g, ' ')}</span>`
                ).join('')}
            </div>
        </div>
        
        <div class="trail-tips">
            <h3>Tips</h3>
            <p>${trail.tips}</p>
        </div>
        
        <div class="trail-reviews">
            <h3>Reviews</h3>
            <div id="reviewsList">
                <!-- Reviews will be loaded here -->
            </div>
            
            <div class="add-review">
                <h4>Add Your Review</h4>
                <form id="reviewForm" data-trail-id="${trail.id}">
                    <div class="form-group">
                        <label for="reviewerName">Your Name:</label>
                        <input type="text" id="reviewerName" name="reviewerName" required>
                    </div>
                    <div class="form-group">
                        <label for="reviewRating">Rating:</label>
                        <select id="reviewRating" name="reviewRating" required>
                            <option value="">Select Rating</option>
                            <option value="5">5 - Excellent</option>
                            <option value="4">4 - Very Good</option>
                            <option value="3">3 - Good</option>
                            <option value="2">2 - Fair</option>
                            <option value="1">1 - Poor</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="reviewComment">Your Review:</label>
                        <textarea id="reviewComment" name="reviewComment" rows="4" required></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary">Submit Review</button>
                </form>
            </div>
        </div>
        
        <div class="trail-actions">
            <button class="btn btn-secondary" onclick="app.toggleSaveTrail(${trail.id})">
                ${isSaved ? 'Saved ✓' : 'Save Trail'}
            </button>
        </div>
    </div>
`;

modal.style.display = 'block';

// Initialize the map after modal is shown
if (window.mapManager && trail.coordinates) {
    // Small delay to ensure modal is rendered
    setTimeout(() => {
        window.mapManager.initializeModalMap(trail);
    }, 100);
}

// Render reviews after modal is shown
if (window.reviewManager) {
    window.reviewManager.renderReviews(trail.id);
}
    
}

    hideModal() {
        const modal = document.getElementById('trailModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    toggleSaveTrail(trailId) {
        const index = this.savedTrails.indexOf(trailId);

        if (index > -1) {
            this.savedTrails.splice(index, 1);
            this.showNotification('Trail removed from saved list', 'success');
        } else {
            this.savedTrails.push(trailId);
            this.showNotification('Trail saved successfully!', 'success');
        }

        this.saveSavedTrails();
        this.updateSavedTrailsCount(this.savedTrails.length);

        if (this.currentView === 'saved') {
            this.renderTrails();
        }

        this.updateSaveButton(trailId, this.savedTrails.includes(trailId));
    }

    updateSaveButton(trailId, isSaved) {
        const buttons = document.querySelectorAll(`[data-trail-id="${trailId}"] .btn-secondary`);
        buttons.forEach(button => {
            button.textContent = isSaved ? 'Saved ✓' : 'Save Trail';
        });
    }

    showNotification(message, type = 'success') {
        if (this.uiManager) {
            this.uiManager.showNotification(message, type);
        } else {
            // Fallback notification
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    updateSavedTrailsCount(count) {
        const countElement = document.getElementById('savedCount');
        if (countElement) {
            countElement.textContent = count;
        }
    }

    showSavedTrails() {
        this.currentView = 'saved';
        this.renderTrails();
    }

    showAllTrails() {
        this.currentView = 'trails';
        this.renderTrails();
    }

    getSavedTrailsData() {
        return this.trails.filter(trail => this.savedTrails.includes(trail.id));
    }

    loadSavedTrails() {
        try {
            const saved = JSON.parse(localStorage.getItem('savedTrails') || '[]');
            return Array.isArray(saved) ? saved : [];
        } catch (error) {
            console.error('Error loading saved trails:', error);
            return [];
        }
    }

    saveSavedTrails() {
        try {
            localStorage.setItem('savedTrails', JSON.stringify(this.savedTrails));
        } catch (error) {
            console.error('Error saving trails:', error);
        }
    }

    loadReviews() {
        // Fallback if Reviews module not available
        try {
            return Reviews ? Reviews.loadReviews() : [];
        } catch (error) {
            console.error('Reviews module not available:', error);
            return [];
        }
    }
}

// Initialize app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure all modules are loaded
    setTimeout(() => {
        app = new TrailTrekker();
        window.app = app; // Make available globally
    }, 100);
});
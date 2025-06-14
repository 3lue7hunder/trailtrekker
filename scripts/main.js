// TrailTrekker Main Application Controller
class TrailTrekker {
    constructor() {
        this.trails = [];
        this.savedTrails = this.loadSavedTrails();
        this.reviews = this.loadReviews();
        this.filteredTrails = [];
        this.currentView = 'home';
        
        this.init();
    }

    async init() {
        try {
            // Load trail data
            this.trails = await TrailData.loadTrails();
            this.filteredTrails = [...this.trails];
        } catch (error) {
            console.error('Failed to load trail data:', error);
            // Fallback to empty array or show error message
            this.trails = [];
            this.filteredTrails = [];
        }
        
        this.setupEventListeners();
        this.renderTrails();
        UI.updateSavedTrailsCount(this.savedTrails.length);
    }

    setupEventListeners() {
        // Navigation
        const savedTrailsLink = document.getElementById('savedTrailsLink');
        if (savedTrailsLink) {
            savedTrailsLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSavedTrails();
            });
        }

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

        // Modal events
        const closeModal = document.getElementById('closeModal');
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                UI.hideModal();
            });
        }

        window.addEventListener('click', (e) => {
            const modal = document.getElementById('trailModal');
            if (e.target === modal) {
                UI.hideModal();
            }
        });

        // Home link navigation
        const homeLinks = document.querySelectorAll('a[href="#home"]');
        homeLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.showAllTrails();
            });
        });
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

    renderTrails() {
        const trailsGrid = document.getElementById('trailsGrid');
        if (!trailsGrid) return;

        const trails = this.currentView === 'saved' ? this.getSavedTrailsData() : this.filteredTrails;

        if (trails.length === 0) {
            const message = this.currentView === 'saved' 
                ? 'No saved trails yet. Start exploring and save your favorites!'
                : 'No trails found matching your criteria.';
            trailsGrid.innerHTML = `<p>${message}</p>`;
            return;
        }

        trailsGrid.innerHTML = trails.map(trail => this.createTrailCard(trail)).join('');
    }

    createTrailCard(trail) {
        return `
            <div class="trail-card" onclick="app.showTrailDetails(${trail.id})">
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
                            `<span class="tag">${feature.replace('-', ' ')}</span>`
                        ).join('')}
                    </div>
                    <div class="trail-actions" onclick="event.stopPropagation()">
                        <button class="btn btn-primary" onclick="app.showTrailDetails(${trail.id})">
                            View Details
                        </button>
                        <button class="btn btn-secondary" onclick="app.toggleSaveTrail(${trail.id})">
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

        UI.showTrailModal(trail, this.savedTrails.includes(trailId));
        
        // Initialize map after modal is shown
        setTimeout(() => {
            TrailMap.initMap('trailMap', trail.coordinates, trail.name);
        }, 100);

        // Load weather data
        WeatherService.getWeatherForTrail(trail.coordinates)
            .then(weather => {
                UI.updateWeatherInfo(weather);
            })
            .catch(error => {
                console.error('Failed to load weather:', error);
            });
    }

    toggleSaveTrail(trailId) {
        const index = this.savedTrails.indexOf(trailId);
        
        if (index > -1) {
            this.savedTrails.splice(index, 1);
            UI.showNotification('Trail removed from saved list', 'success');
        } else {
            this.savedTrails.push(trailId);
            UI.showNotification('Trail saved successfully!', 'success');
        }
        
        this.saveSavedTrails();
        UI.updateSavedTrailsCount(this.savedTrails.length);
        
        // Update UI if we're currently viewing saved trails
        if (this.currentView === 'saved') {
            this.renderTrails();
        }
        
        // Update save button in modal if open
        UI.updateSaveButton(trailId, this.savedTrails.includes(trailId));
    }

    showSavedTrails() {
        this.currentView = 'saved';
        this.showSection('savedTrails');
        this.renderTrails();
    }

    showAllTrails() {
        this.currentView = 'home';
        this.showSection('trails');
        this.renderTrails();
    }

    showSection(sectionId) {
        // Hide all sections
        const sections = ['trails', 'savedTrails'];
        sections.forEach(id => {
            const section = document.getElementById(id);
            if (section) {
                section.classList.add('hidden');
            }
        });

        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.remove('hidden');
        }
    }

    getSavedTrailsData() {
        return this.trails.filter(trail => this.savedTrails.includes(trail.id));
    }

    submitReview(event, trailId) {
        event.preventDefault();
        
        const form = event.target;
        const reviewData = {
            trailId: trailId,
            author: form.reviewerName.value,
            rating: parseInt(form.reviewRating.value),
            comment: form.reviewComment.value,
            date: new Date().toISOString()
        };

        Reviews.addReview(reviewData);
        UI.showNotification('Review submitted successfully!', 'success');
        
        // Reset form
        form.reset();
        
        // Refresh reviews display
        const reviewsList = document.getElementById('reviewsList');
        if (reviewsList) {
            Reviews.renderReviews(trailId, reviewsList);
        }
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
        return Reviews.loadReviews();
    }
}

// Initialize app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new TrailTrekker();
});

// Make app globally accessible for onclick handlers
window.app = app;
// Saved Trails Page Controller
class SavedTrailsController {
    constructor() {
        this.trails = [];
        this.savedTrails = this.loadSavedTrails();
        this.uiManager = null;
        this.mapManager = null;

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
            console.log('Loaded trails:', this.trails.length);
            console.log('Saved trail IDs:', this.savedTrails);
        } catch (error) {
            console.error('Failed to load trail data:', error);
            this.trails = [];
        }

        this.setupEventListeners();
        this.renderSavedTrails();
        this.initializeMap();
    }

    setupEventListeners() {
        // Export trails button
        const exportBtn = document.getElementById('exportTrails');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportTrails());
        }

        // Clear all saved trails button
        const clearBtn = document.getElementById('clearAllSaved');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearAllSaved());
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
        const savedTrailsGrid = document.getElementById('savedTrailsGrid');
        if (savedTrailsGrid) {
            savedTrailsGrid.addEventListener('click', (e) => {
                const card = e.target.closest('.trail-card');
                if (!card) return;

                const trailId = parseInt(card.dataset.trailId, 10);
                if (isNaN(trailId)) return;

                // Check if clicked element is the Remove button
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

    renderSavedTrails() {
        const savedTrailsGrid = document.getElementById('savedTrailsGrid');
        const savedCount = document.getElementById('savedCount');
        const emptyState = document.getElementById('emptyState');
        
        if (!savedTrailsGrid) return;

        const savedTrailsData = this.getSavedTrailsData();

        // Update count
        if (savedCount) {
            const countText = savedTrailsData.length === 1 
                ? '1 Saved Trail' 
                : `${savedTrailsData.length} Saved Trails`;
            savedCount.textContent = countText;
        }

        // Show/hide empty state
        if (savedTrailsData.length === 0) {
            savedTrailsGrid.innerHTML = '';
            if (emptyState) {
                emptyState.classList.remove('hidden');
            }
            return;
        } else {
            if (emptyState) {
                emptyState.classList.add('hidden');
            }
        }

        // Render trail cards
        savedTrailsGrid.innerHTML = savedTrailsData.map(trail => this.createTrailCard(trail)).join('');
        
        // Update map if available
        if (this.mapManager) {
            this.mapManager.updateSavedTrailsMap(savedTrailsData);
        }
    }

    createTrailCard(trail) {
        // Helper function to get trail image URL (same as in main.js)
        const getTrailImageUrl = (trail) => {
            // If trail has an image property, use it
            if (trail.image) {
                return trail.image;
            }
            
            // Generate image filename based on trail name
            const imageName = trail.name.toLowerCase()
                .replace(/[^a-z0-9\s]/g, '') // Remove special characters
                .replace(/\s+/g, '_') // Replace spaces with underscores
                .trim();
            
            return `images/${imageName}.jpg`;
        };
        
        const imageUrl = getTrailImageUrl(trail);
        const fallbackUrl = 'images/default-trail.jpg'; // Make sure you have this fallback image
        
        return `
            <div class="trail-card" data-trail-id="${trail.id}">
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
                            `<span class="tag">${feature.replace(/-/g, ' ')}</span>`
                        ).join('')}
                    </div>
                    <div class="trail-actions">
                        <button class="btn btn-primary">
                            View Details
                        </button>
                        <button class="btn btn-secondary">
                            Remove
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    showTrailDetails(trailId) {
        const trail = this.trails.find(t => t.id === trailId);
        if (!trail) return;

        this.showTrailModal(trail, true);
    }

    showTrailModal(trail, isSaved) {
        const modal = document.getElementById('trailModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');

        if (!modal || !modalTitle || !modalBody) return;

        modalTitle.textContent = trail.name;
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
                    <div class="info-item">
                        <strong>Season:</strong> ${trail.season}
                    </div>
                    <div class="info-item">
                        <strong>Dogs Allowed:</strong> ${trail.dogs ? 'Yes' : 'No'}
                    </div>
                    <div class="info-item">
                        <strong>Permits Required:</strong> ${trail.permits ? 'Yes' : 'No'}
                    </div>
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
                        ).join(', ')}
                    </div>
                </div>
                
                <div class="trail-tips">
                    <h3>Tips</h3>
                    <p>${trail.tips}</p>
                </div>
                
                <div class="trail-actions">
                    <button class="btn btn-secondary" onclick="savedApp.toggleSaveTrail(${trail.id})">
                        Remove from Saved
                    </button>
                </div>
            </div>
        `;

        modal.style.display = 'block';
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
            this.saveSavedTrails();
            this.renderSavedTrails();
        }
    }

    clearAllSaved() {
        if (this.savedTrails.length === 0) {
            this.showNotification('No saved trails to clear', 'info');
            return;
        }

        if (confirm('Are you sure you want to remove all saved trails? This action cannot be undone.')) {
            this.savedTrails = [];
            this.saveSavedTrails();
            this.renderSavedTrails();
            this.showNotification('All saved trails cleared', 'success');
        }
    }

    exportTrails() {
        const savedTrailsData = this.getSavedTrailsData();
        
        if (savedTrailsData.length === 0) {
            this.showNotification('No saved trails to export', 'info');
            return;
        }

        const exportData = savedTrailsData.map(trail => ({
            name: trail.name,
            location: trail.location,
            length: trail.length,
            difficulty: trail.difficulty,
            elevation: trail.elevation,
            rating: trail.rating,
            features: trail.features.join(', ')
        }));

        const csv = this.convertToCSV(exportData);
        this.downloadCSV(csv, 'my-saved-trails.csv');
        this.showNotification('Trails exported successfully!', 'success');
    }

    convertToCSV(data) {
        const headers = Object.keys(data[0]);
        const csvRows = [headers.join(',')];

        for (const row of data) {
            const values = headers.map(header => {
                const value = row[header];
                return `"${value}"`;
            });
            csvRows.push(values.join(','));
        }

        return csvRows.join('\n');
    }

    downloadCSV(csv, filename) {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);
    }

    showNotification(message, type = 'success') {
        if (this.uiManager) {
            this.uiManager.showNotification(message, type);
        } else {
            // Fallback notification
            console.log(`${type.toUpperCase()}: ${message}`);
        }
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

    initializeMap() {
        // Initialize map if map.js is available
        if (typeof MapManager !== 'undefined') {
            try {
                this.mapManager = new MapManager('savedTrailsMap');
                const savedTrailsData = this.getSavedTrailsData();
                this.mapManager.updateSavedTrailsMap(savedTrailsData);
            } catch (error) {
                console.warn('Map initialization failed:', error);
            }
        }
    }
}

// Initialize saved trails app when DOM is loaded
let savedApp;
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure all modules are loaded
    setTimeout(() => {
        savedApp = new SavedTrailsController();
        window.savedApp = savedApp; // Make available globally
    }, 100);
});
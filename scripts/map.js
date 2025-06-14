// scripts/map.js - Interactive Map System using Leaflet
class MapManager {
  constructor() {
    this.maps = {};
    this.markers = {};
    this.currentMap = null;
    this.init();
  }

  init() {
    this.setupMapStyles();
  }

  setupMapStyles() {
    // Add custom map styles
    const style = document.createElement('style');
    style.textContent = `
      .trail-popup {
          font-family: 'Open Sans', sans-serif;
      }
      
      .trail-popup h3 {
          margin: 0 0 0.5rem 0;
          color: #4A7C59;
          font-size: 1.1rem;
      }
      
      .trail-popup p {
          margin: 0.25rem 0;
          font-size: 0.9rem;
      }
      
      .trail-popup .difficulty-badge {
          display: inline-block;
          padding: 0.2rem 0.6rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          margin-top: 0.5rem;
      }
      
      .trail-popup .difficulty-easy { background: #d4edda; color: #155724; }
      .trail-popup .difficulty-moderate { background: #fff3cd; color: #856404; }
      .trail-popup .difficulty-hard { background: #f8d7da; color: #721c24; }
      
      .leaflet-popup-content {
          margin: 1rem;
          line-height: 1.4;
      }
      
      .leaflet-popup-content-wrapper {
          border-radius: 8px;
      }
      
      .map-container {
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      }
    `;
    document.head.appendChild(style);
  }

  createMap(containerId, options = {}) {
    const defaultOptions = {
      center: [39.8283, -98.5795], // Center of USA
      zoom: 4,
      scrollWheelZoom: true,
      doubleClickZoom: true
    };

    const mapOptions = { ...defaultOptions, ...options };

    // Create map instance
    const map = L.map(containerId, {
      center: mapOptions.center,
      zoom: mapOptions.zoom,
      scrollWheelZoom: mapOptions.scrollWheelZoom,
      doubleClickZoom: mapOptions.doubleClickZoom
    });

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(map);

    this.maps[containerId] = map;
    this.markers[containerId] = [];

    return map;
  }

  createTrailMap(containerId, trail) {
    if (!trail.coordinates) {
      console.warn('Trail coordinates not available');
      return null;
    }

    const map = this.createMap(containerId, {
      center: trail.coordinates,
      zoom: 12
    });

    // Add trail marker
    const marker = this.addTrailMarker(map, trail);

    // Store marker reference
    this.markers[containerId].push(marker);

    return map;
  }

  addTrailMarker(map, trail) {
    if (!trail.coordinates) return null;

    // Create custom icon
    const trailIcon = L.divIcon({
      className: 'trail-marker',
      html: `<div style="
          background: #4A7C59;
          color: white;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      ">🥾</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15]
    });

    const marker = L.marker(trail.coordinates, { icon: trailIcon }).addTo(map);

    // Create popup content
    const popupContent = `
        <div class="trail-popup">
            <h3>${trail.name}</h3>
            <p><strong>📍</strong> ${trail.location}</p>
            <p><strong>📏</strong> ${trail.length} miles</p>
            <p><strong>⬆️</strong> ${trail.elevation} ft elevation gain</p>
            <p><strong>⭐</strong> ${trail.rating}/5 rating</p>
            <div class="difficulty-badge difficulty-${trail.difficulty}">
                ${trail.difficulty}
            </div>
        </div>
    `;

    marker.bindPopup(popupContent);

    return marker;
  }

  createOverviewMap(containerId, trails) {
    const map = this.createMap(containerId, {
      center: [39.8283, -98.5795],
      zoom: 4
    });

    const bounds = [];

    trails.forEach(trail => {
      if (trail.coordinates) {
        const marker = this.addTrailMarker(map, trail);
        this.markers[containerId].push(marker);
        bounds.push(trail.coordinates);
      }
    });

    // Fit map to show all trails if we have coordinates
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [20, 20] });
    }

    return map;
  }

  getUserLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve([
            position.coords.latitude,
            position.coords.longitude
          ]);
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  addUserLocationToMap(map, position) {
    const userIcon = L.divIcon({
      className: 'user-marker',
      html: `<div style="
          background: #F2C14E;
          color: #333;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">📍</div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    const marker = L.marker(position, { icon: userIcon }).addTo(map);
    marker.bindPopup('Your Location');

    return marker;
  }

  calculateDistance(pos1, pos2) {
    // Calculate distance between two points using Haversine formula
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(pos2[0] - pos1[0]);
    const dLon = this.toRadians(pos2[1] - pos1[1]);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(pos1[0])) *
        Math.cos(this.toRadians(pos2[0])) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  findNearbyTrails(trails, userPosition, maxDistance = 50) {
    return trails
      .filter((trail) => {
        if (!trail.coordinates) return false;
        const distance = this.calculateDistance(userPosition, trail.coordinates);
        return distance <= maxDistance;
      })
      .map((trail) => ({
        ...trail,
        distance: this.calculateDistance(userPosition, trail.coordinates)
      }))
      .sort((a, b) => a.distance - b.distance);
  }

  addDirections(map, start, end) {
    // Simple straight line - in a real app, you'd use a routing service
    const directionsLine = L.polyline([start, end], {
      color: '#4A7C59',
      weight: 3,
      opacity: 0.7,
      dashArray: '10, 10'
    }).addTo(map);

    return directionsLine;
  }

  destroyMap(containerId) {
    if (this.maps[containerId]) {
      this.maps[containerId].remove();
      delete this.maps[containerId];
      delete this.markers[containerId];
    }
  }

  resizeMap(containerId) {
    if (this.maps[containerId]) {
      setTimeout(() => {
        this.maps[containerId].invalidateSize();
      }, 100);
    }
  }

  // Utility method to initialize maps when modal opens
  initializeModalMap(trail) {
    // Wait for modal to be visible
    setTimeout(() => {
      const mapContainer = document.getElementById('trailMap');
      if (mapContainer && trail) {
        // Clear any existing map
        if (this.maps.trailMap) {
          this.destroyMap('trailMap');
        }

        // Create new map
        this.createTrailMap('trailMap', trail);
      }
    }, 100);
  }
}

// Initialize map manager
const mapManager = new MapManager();

// Export for global access
window.mapManager = mapManager;

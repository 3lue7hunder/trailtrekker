// Trail Data Management Module
class TrailData {
    // Store trails in a static property for reuse after load
    static trails = null;

    // Load trail data from JSON or use default data
    static async loadTrails() {
        if (this.trails) return this.trails; // Return cached trails if already loaded

        try {
            // First try to load from external JSON file
            this.trails = await this.loadFromJSON();
        } catch (error) {
            console.warn('Failed to load external JSON, using embedded data:', error);
            // Fall back to embedded trail data
            this.trails = this.getEmbeddedTrails();
        }

        return this.trails;
    }

    // Try to fetch from trails.json file
    static async loadFromJSON() {
        const response = await fetch('./data/trails.json');
        if (!response.ok) {
            throw new Error(`Failed to load trails.json: ${response.status}`);
        }
        const data = await response.json();
        return data.trails || [];
    }

    // Embedded trail data (using the data from your paste.txt)
    static getEmbeddedTrails() {
        return [
            {
                id: 1,
                name: "Emerald Lake Trail",
                location: "Rocky Mountain National Park",
                length: 3.2,
                difficulty: "moderate",
                elevation: 650,
                rating: 4.8,
                description: "A stunning trail that leads to a pristine alpine lake surrounded by towering peaks. Perfect for photography and peaceful reflection.",
                features: ["scenic-views", "wildlife", "photography"],
                tips: "Best visited early morning to avoid crowds. Bring layers as weather can change quickly.",
                coordinates: [40.3428, -105.6836],
                estimatedTime: "2-3 hours",
                permits: false,
                dogs: true,
                season: "May - October"
            },
            {
                id: 2,
                name: "Cascade Falls Trail",
                location: "Yosemite National Park",
                length: 2.4,
                difficulty: "easy",
                elevation: 300,
                rating: 4.6,
                description: "An easy family-friendly hike to a spectacular 200-foot waterfall. The trail is well-maintained with interpretive signs.",
                features: ["waterfall", "dog-friendly", "family-friendly"],
                tips: "Trail can be muddy near the falls. Waterproof shoes recommended.",
                coordinates: [37.7749, -119.4194],
                estimatedTime: "1.5-2 hours",
                permits: true,
                dogs: true,
                season: "April - November"
            },
            {
                id: 3,
                name: "Devil's Backbone Ridge",
                location: "Angeles National Forest",
                length: 8.1,
                difficulty: "hard",
                elevation: 2100,
                rating: 4.4,
                description: "A challenging ridge hike with breathtaking 360-degree views. Not for beginners, but the reward is worth the effort.",
                features: ["scenic-views", "challenging", "panoramic-views"],
                tips: "Start very early to avoid afternoon heat. Bring plenty of water and sun protection.",
                coordinates: [34.2639, -117.6389],
                estimatedTime: "6-8 hours",
                permits: false,
                dogs: false,
                season: "October - May"
            },
            {
                id: 4,
                name: "Fern Canyon Loop",
                location: "Prairie Creek Redwoods State Park",
                length: 1.8,
                difficulty: "easy",
                elevation: 100,
                rating: 4.7,
                description: "Walk through a magical canyon lined with ferns and towering redwoods. Featured in Jurassic Park movies!",
                features: ["dog-friendly", "unique-geology", "movie-location"],
                tips: "Can be very muddy. Wear waterproof boots and be prepared to cross small streams.",
                coordinates: [41.3885, -124.0389],
                estimatedTime: "1-1.5 hours",
                permits: false,
                dogs: true,
                season: "Year-round"
            },
            {
                id: 5,
                name: "Sunset Peak Trail",
                location: "Mount Tamalpais State Park",
                length: 5.5,
                difficulty: "moderate",
                elevation: 1200,
                rating: 4.5,
                description: "Popular sunset destination with panoramic views of San Francisco Bay. Great for evening hikes.",
                features: ["scenic-views", "sunset-views", "bay-views"],
                tips: "Bring a headlamp for the descent. Gets crowded on weekends.",
                coordinates: [37.9235, -122.5964],
                estimatedTime: "3-4 hours",
                permits: false,
                dogs: true,
                season: "Year-round"
            },
            {
                id: 6,
                name: "Hidden Valley Trail",
                location: "Joshua Tree National Park",
                length: 1.0,
                difficulty: "easy",
                elevation: 50,
                rating: 4.3,
                description: "Short loop through a scenic desert valley with unique rock formations and Joshua trees.",
                features: ["desert", "rock-formations", "short-hike"],
                tips: "Best in early morning or late afternoon. Bring sun protection.",
                coordinates: [33.9424, -116.1669],
                estimatedTime: "30-45 minutes",
                permits: true,
                dogs: false,
                season: "October - April"
            },
            {
                id: 7,
                name: "Mirror Lake Loop",
                location: "Yosemite Valley",
                length: 4.8,
                difficulty: "easy",
                elevation: 200,
                rating: 4.2,
                description: "A gentle walk around a seasonal lake with reflections of Half Dome and surrounding cliffs.",
                features: ["lake", "reflections", "family-friendly", "paved-trail"],
                tips: "Best reflections in spring and early summer when water levels are high.",
                coordinates: [37.7459, -119.5571],
                estimatedTime: "2-3 hours",
                permits: true,
                dogs: false,
                season: "Year-round"
            },
            {
                id: 8,
                name: "Angels Landing",
                location: "Zion National Park",
                length: 5.4,
                difficulty: "hard",
                elevation: 1488,
                rating: 4.9,
                description: "One of the most famous hikes in America, featuring chains for the final ascent to spectacular views.",
                features: ["chains", "extreme-exposure", "iconic-views", "challenging"],
                tips: "Requires timed entry permits. Not recommended for those afraid of heights.",
                coordinates: [37.2692, -112.9481],
                estimatedTime: "4-6 hours",
                permits: true,
                dogs: false,
                season: "March - October"
            },
            {
                id: 9,
                name: "Delicate Arch Trail",
                location: "Arches National Park",
                length: 3.0,
                difficulty: "moderate",
                elevation: 480,
                rating: 4.6,
                description: "The iconic arch featured on Utah's license plate. A must-see natural wonder.",
                features: ["natural-arch", "iconic", "desert", "rock-formations"],
                tips: "No shade on trail. Bring plenty of water and start early in summer.",
                coordinates: [38.7436, -109.4992],
                estimatedTime: "1.5-2.5 hours",
                permits: true,
                dogs: false,
                season: "Year-round"
            },
            {
                id: 10,
                name: "Bear Lake Trail",
                location: "Rocky Mountain National Park",
                length: 0.8,
                difficulty: "easy",
                elevation: 50,
                rating: 4.1,
                description: "A short, accessible trail around a beautiful alpine lake with mountain reflections.",
                features: ["alpine-lake", "accessible", "family-friendly", "short-hike"],
                tips: "Very popular and can be crowded. Arrive early for parking.",
                coordinates: [40.3139, -105.6450],
                estimatedTime: "30 minutes",
                permits: false,
                dogs: true,
                season: "May - October"
            },
            {
                id: 11,
                name: "Mist Trail",
                location: "Yosemite National Park",
                length: 7.0,
                difficulty: "hard",
                elevation: 2000,
                rating: 4.7,
                description: "Climb alongside powerful waterfalls via granite steps cut into the rock.",
                features: ["waterfalls", "granite-steps", "mist", "strenuous"],
                tips: "Trail gets very wet from mist. Bring rain gear and grippy shoes.",
                coordinates: [37.7459, -119.5571],
                estimatedTime: "5-7 hours",
                permits: true,
                dogs: false,
                season: "May - October"
            },
            {
                id: 12,
                name: "Bright Angel Trail",
                location: "Grand Canyon National Park",
                length: 12.0,
                difficulty: "hard",
                elevation: 3020,
                rating: 4.5,
                description: "The most popular trail into the Grand Canyon, offering incredible views at every turn.",
                features: ["canyon-views", "historic", "water-stations", "challenging"],
                tips: "Descending is easy, ascending is the challenge. Turn back when you've used 1/3 of your water.",
                coordinates: [36.0544, -112.0963],
                estimatedTime: "6-8 hours",
                permits: false,
                dogs: false,
                season: "Year-round"
            }
        ];
    }

    // Find trail by its unique ID
    static getTrailById(id) {
        if (!this.trails) return null;
        return this.trails.find(trail => trail.id === id) || null;
    }

    // Search trails by name, location, or features (case-insensitive)
    static searchTrails(query = '', trails = []) {
        if (!query) return trails;
        const searchTerm = query.toLowerCase();
        return trails.filter(trail =>
            trail.name.toLowerCase().includes(searchTerm) ||
            trail.location.toLowerCase().includes(searchTerm) ||
            trail.features.some(feature => feature.toLowerCase().includes(searchTerm))
        );
    }

    // Filter trails by difficulty ('easy', 'moderate', 'hard')
    static filterByDifficulty(difficulty = '', trails = []) {
        if (!difficulty) return trails;
        return trails.filter(trail => trail.difficulty.toLowerCase() === difficulty.toLowerCase());
    }

    // Filter trails by length range: 'short' (<3), 'medium' (3-6), 'long' (>6)
    static filterByLength(lengthRange = '', trails = []) {
        if (!lengthRange) return trails;

        return trails.filter(trail => {
            switch (lengthRange.toLowerCase()) {
                case 'short':
                    return trail.length < 3;
                case 'medium':
                    return trail.length >= 3 && trail.length <= 6;
                case 'long':
                    return trail.length > 6;
                default:
                    return true;
            }
        });
    }

    // Filter trails by feature (case-insensitive)
    static filterByFeatures(feature = '', trails = []) {
        if (!feature) return trails;
        const lowerFeature = feature.toLowerCase();
        return trails.filter(trail =>
            trail.features.some(f => f.toLowerCase() === lowerFeature)
        );
    }

    // Sort trails by property (default 'rating'), order 'asc' or 'desc'
    static sortTrails(trails = [], sortBy = 'rating', order = 'desc') {
        return [...trails].sort((a, b) => {
            let aVal = a[sortBy];
            let bVal = b[sortBy];

            // Normalize strings to lowercase
            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }

            if (order === 'asc') {
                return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
            } else {
                return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
            }
        });
    }

    // Get trails filtered by a feature
    static getTrailsByFeature(feature = '') {
        if (!feature || !this.trails) return [];
        const lowerFeature = feature.toLowerCase();
        return this.trails.filter(trail =>
            trail.features.some(f => f.toLowerCase() === lowerFeature)
        );
    }

    // Compute stats about a set of trails
    static getTrailStats(trails = []) {
        if (!trails.length) return null;

        const totalLength = trails.reduce((sum, trail) => sum + trail.length, 0);
        const avgRating = trails.reduce((sum, trail) => sum + trail.rating, 0) / trails.length;
        const difficulties = trails.reduce((acc, trail) => {
            const diff = trail.difficulty.toLowerCase();
            acc[diff] = (acc[diff] || 0) + 1;
            return acc;
        }, {});

        return {
            count: trails.length,
            totalLength: Math.round(totalLength * 10) / 10,
            averageLength: Math.round((totalLength / trails.length) * 10) / 10,
            averageRating: Math.round(avgRating * 10) / 10,
            difficulties
        };
    }
}
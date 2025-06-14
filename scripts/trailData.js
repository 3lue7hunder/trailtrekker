// Trail Data Management Module
class TrailData {
    static async loadTrails() {
        try {
            // Try to load from API first (if available)
            // For now, we'll use the fallback data
            return await this.loadFallbackData();
        } catch (error) {
            console.error('Failed to load trail data:', error);
            return this.getDefaultTrails();
        }
    }

    static async loadFallbackData() {
        try {
            const response = await fetch('./data/trails.json');
            if (!response.ok) {
                throw new Error('Failed to load trails.json');
            }
            const data = await response.json();
            return data.trails || [];
        } catch (error) {
            console.warn('Fallback data not available, using default trails');
            return this.getDefaultTrails();
        }
    }

    static getDefaultTrails() {
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
                image: "./imgs/emerald-lake.jpg"
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
                image: "./imgs/cascade-falls.jpg"
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
                image: "./imgs/devils-backbone.jpg"
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
                image: "./imgs/fern-canyon.jpg"
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
                image: "./imgs/sunset-peak.jpg"
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
                image: "./imgs/hidden-valley.jpg"
            },
            {
                id: 7,
                name: "Bear Lake Trail",
                location: "Rocky Mountain National Park",
                length: 0.8,
                difficulty: "easy",
                elevation: 50,
                rating: 4.2,
                description: "An accessible paved trail around a beautiful alpine lake with mountain reflections.",
                features: ["accessible", "family-friendly", "lake-views"],
                tips: "Wheelchair accessible. Great for all skill levels.",
                coordinates: [40.3115, -105.6462],
                image: "./imgs/bear-lake.jpg"
            },
            {
                id: 8,
                name: "Angels Landing",
                location: "Zion National Park",
                length: 5.4,
                difficulty: "hard",
                elevation: 1488,
                rating: 4.9,
                description: "One of the most famous hikes in America with chains for the final ascent and incredible views.",
                features: ["iconic", "challenging", "chains", "panoramic-views"],
                tips: "Timed entry permits required. Not recommended for those afraid of heights.",
                coordinates: [37.2669, -112.9482],
                image: "./imgs/angels-landing.jpg"
            },
            {
                id: 9,
                name: "Maroon Bells Trail",
                location: "Aspen, Colorado",
                length: 3.6,
                difficulty: "moderate",
                elevation: 500,
                rating: 4.7,
                description: "Hike to one of the most photographed peaks in North America with stunning fall colors.",
                features: ["scenic-views", "photography", "fall-colors"],
                tips: "Shuttle required in peak season. Best in late September for fall colors.",
                coordinates: [39.0708, -106.9390],
                image: "./imgs/maroon-bells.jpg"
            },
            {
                id: 10,
                name: "Delicate Arch Trail",
                location: "Arches National Park",
                length: 3.0,
                difficulty: "moderate",
                elevation: 480,
                rating: 4.6,
                description: "Hike to Utah's most famous arch and the symbol of the state. No shade, bring water!",
                features: ["iconic", "desert", "rock-formations"],
                tips: "No shade on trail. Best at sunrise or sunset for photos.",
                coordinates: [38.7436, -109.4993],
                image: "./imgs/delicate-arch.jpg"
            }
        ];
    }

    static getTrailById(id) {
        return this.trails?.find(trail => trail.id === id) || null;
    }

    static searchTrails(query, trails) {
        const searchTerm = query.toLowerCase();
        return trails.filter(trail => 
            trail.name.toLowerCase().includes(searchTerm) ||
            trail.location.toLowerCase().includes(searchTerm) ||
            trail.features.some(feature => feature.toLowerCase().includes(searchTerm))
        );
    }

    static filterByDifficulty(difficulty, trails) {
        if (!difficulty) return trails;
        return trails.filter(trail => trail.difficulty === difficulty);
    }

    static filterByLength(lengthRange, trails) {
        if (!lengthRange) return trails;
        
        return trails.filter(trail => {
            switch (lengthRange) {
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

    static filterByFeatures(feature, trails) {
        if (!feature) return trails;
        return trails.filter(trail => trail.features.includes(feature));
    }

    static sortTrails(trails, sortBy = 'rating', order = 'desc') {
        return [...trails].sort((a, b) => {
            let aVal = a[sortBy];
            let bVal = b[sortBy];
            
            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }
            
            if (order === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });
    }

    static getTrailsByFeature(feature) {
        return this.getDefaultTrails().filter(trail => 
            trail.features.includes(feature)
        );
    }

    static getTrailStats(trails) {
        if (!trails || trails.length === 0) return null;
        
        const totalLength = trails.reduce((sum, trail) => sum + trail.length, 0);
        const avgRating = trails.reduce((sum, trail) => sum + trail.rating, 0) / trails.length;
        const difficulties = trails.reduce((acc, trail) => {
            acc[trail.difficulty] = (acc[trail.difficulty] || 0) + 1;
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
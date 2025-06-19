// weather.js - Updated to show current weather only
class WeatherService {
    constructor() {
        this.apiKey = '5a7d9135dd99424080f0abc07c127c3b';
        this.baseUrl = 'https://api.weatherbit.io/v2.0';
        this.cache = new Map();
        this.cacheTimeout = 10 * 60 * 1000; // 10 minutes cache
    }

    // Get current weather by latitude and longitude
    async getCurrentWeather(lat, lon) {
        const cacheKey = `current_${lat}_${lon}`;
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        const url = `${this.baseUrl}/current?lat=${lat}&lon=${lon}&key=${this.apiKey}&units=I`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Weather data unavailable');

            const json = await response.json();
            if (!json.data || json.data.length === 0) throw new Error('No weather data found');

            const weatherData = this.formatCurrentWeather(json.data[0]);
            this.cache.set(cacheKey, { data: weatherData, timestamp: Date.now() });
            return weatherData;
        } catch (error) {
            console.error('Error fetching weather:', error);
            return this.getMockWeatherData();
        }
    }

    formatCurrentWeather(data) {
        return {
            temperature: Math.round(data.temp),
            feelsLike: Math.round(data.app_temp),
            humidity: data.rh,
            description: data.weather.description,
            icon: data.weather.icon,
            windSpeed: Math.round(data.wind_spd * 2.237), // Convert m/s to mph
            windDirection: data.wind_dir,
            visibility: Math.round(data.vis / 1609.34), // meters to miles
            pressure: data.pres,
            uvIndex: data.uv,
            sunrise: new Date(data.sunrise_ts * 1000),
            sunset: new Date(data.sunset_ts * 1000)
        };
    }

    getMockWeatherData() {
        return {
            temperature: 72,
            feelsLike: 75,
            humidity: 65,
            description: 'Partly cloudy',
            icon: 'c02d',
            windSpeed: 8,
            windDirection: 180,
            visibility: 10,
            pressure: 1013,
            uvIndex: 6,
            sunrise: new Date(),
            sunset: new Date()
        };
    }

    // Render current weather data to HTML - UV Index and Visibility removed
    renderCurrentWeather(weatherData, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const formatTime = (date) => {
            return date.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
            });
        };

        container.innerHTML = `
            <div class="weather-current">
                <div class="weather-main">
                    <div class="weather-temp">${weatherData.temperature}°F</div>
                    <div class="weather-desc">${weatherData.description}</div>
                    <div class="weather-feels">Feels like ${weatherData.feelsLike}°F</div>
                </div>
                <div class="weather-details">
                    <div class="weather-detail">
                        <span class="label">Humidity:</span>
                        <span class="value">${weatherData.humidity}%</span>
                    </div>
                    <div class="weather-detail">
                        <span class="label">Wind:</span>
                        <span class="value">${weatherData.windSpeed} mph</span>
                    </div>
                </div>
            </div>
        `;
    }
}

// WeatherManager class to handle weather integration
class WeatherManager {
    constructor() {
        this.weatherService = new WeatherService();
    }

    // Load weather for a specific trail and display in modal - current weather only
    async loadTrailWeather(trail) {
        if (!trail.coordinates || trail.coordinates.length < 2) {
            console.warn('No coordinates available for weather data');
            return;
        }

        const [lat, lon] = trail.coordinates;
        
        try {
            // Load only current weather
            const currentWeather = await this.weatherService.getCurrentWeather(lat, lon);

            // Display weather data
            this.weatherService.renderCurrentWeather(currentWeather, 'currentWeather');
        } catch (error) {
            console.error('Failed to load weather data:', error);
            this.showWeatherError();
        }
    }

    showWeatherError() {
        const currentContainer = document.getElementById('currentWeather');
        
        const errorMessage = '<p class="weather-error">Weather data unavailable</p>';
        
        if (currentContainer) currentContainer.innerHTML = errorMessage;
    }
}

// Initialize weather manager globally
window.weatherManager = new WeatherManager();
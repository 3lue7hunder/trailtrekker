// Weather Service Module
class WeatherService {
    constructor() {
        // Using OpenWeatherMap API (you'll need to get your own API key)
        this.apiKey = 'YOUR_OPENWEATHER_API_KEY'; // Replace with actual API key
        this.baseUrl = 'https://api.openweathermap.org/data/2.5';
        this.cache = new Map();
        this.cacheTimeout = 10 * 60 * 1000; // 10 minutes
    }

    async getCurrentWeather(lat, lon) {
        const cacheKey = `current_${lat}_${lon}`;
        
        // Check cache first
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        try {
            const response = await fetch(
                `${this.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=imperial`
            );
            
            if (!response.ok) {
                throw new Error('Weather data unavailable');
            }
            
            const data = await response.json();
            const weatherData = this.formatCurrentWeather(data);
            
            // Cache the result
            this.cache.set(cacheKey, {
                data: weatherData,
                timestamp: Date.now()
            });
            
            return weatherData;
        } catch (error) {
            console.error('Error fetching weather:', error);
            return this.getMockWeatherData();
        }
    }

    async getForecast(lat, lon, days = 5) {
        const cacheKey = `forecast_${lat}_${lon}_${days}`;
        
        // Check cache first
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        try {
            const response = await fetch(
                `${this.baseUrl}/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=imperial`
            );
            
            if (!response.ok) {
                throw new Error('Forecast data unavailable');
            }
            
            const data = await response.json();
            const forecastData = this.formatForecast(data, days);
            
            // Cache the result
            this.cache.set(cacheKey, {
                data: forecastData,
                timestamp: Date.now()
            });
            
            return forecastData;
        } catch (error) {
            console.error('Error fetching forecast:', error);
            return this.getMockForecastData();
        }
    }

    formatCurrentWeather(data) {
        return {
            temperature: Math.round(data.main.temp),
            feelsLike: Math.round(data.main.feels_like),
            humidity: data.main.humidity,
            description: data.weather[0].description,
            icon: data.weather[0].icon,
            windSpeed: Math.round(data.wind.speed),
            windDirection: data.wind.deg,
            visibility: Math.round(data.visibility / 1609.34), // Convert to miles
            pressure: data.main.pressure,
            uvIndex: data.uvi || 'N/A',
            sunrise: new Date(data.sys.sunrise * 1000),
            sunset: new Date(data.sys.sunset * 1000)
        };
    }

    formatForecast(data, days) {
        const dailyData = {};
        
        // Group by date
        data.list.forEach(item => {
            const date = new Date(item.dt * 1000).toDateString();
            if (!dailyData[date]) {
                dailyData[date] = [];
            }
            dailyData[date].push(item);
        });

        // Get the requested number of days
        const dates = Object.keys(dailyData).slice(0, days);
        
        return dates.map(date => {
            const dayData = dailyData[date];
            const temps = dayData.map(item => item.main.temp);
            const conditions = dayData.map(item => item.weather[0].main);
            
            // Find most common condition
            const conditionCounts = {};
            conditions.forEach(condition => {
                conditionCounts[condition] = (conditionCounts[condition] || 0) + 1;
            });
            const mostCommon = Object.keys(conditionCounts).reduce((a, b) => 
                conditionCounts[a] > conditionCounts[b] ? a : b
            );

            return {
                date: new Date(date),
                high: Math.round(Math.max(...temps)),
                low: Math.round(Math.min(...temps)),
                condition: mostCommon,
                description: dayData[0].weather[0].description,
                icon: dayData[0].weather[0].icon,
                precipitation: dayData.reduce((sum, item) => sum + (item.rain?.['3h'] || 0), 0),
                windSpeed: Math.round(dayData.reduce((sum, item) => sum + item.wind.speed, 0) / dayData.length)
            };
        });
    }

    getMockWeatherData() {
        // Fallback mock data when API is unavailable
        return {
            temperature: 72,
            feelsLike: 75,
            humidity: 65,
            description: 'partly cloudy',
            icon: '02d',
            windSpeed: 8,
            windDirection: 180,
            visibility: 10,
            pressure: 1013,
            uvIndex: 6,
            sunrise: new Date(),
            sunset: new Date()
        };
    }

    getMockForecastData() {
        // Fallback mock forecast data
        const forecast = [];
        for (let i = 0; i < 5; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            
            forecast.push({
                date: date,
                high: 75 + Math.random() * 10,
                low: 60 + Math.random() * 10,
                condition: ['Clear', 'Cloudy', 'Partly Cloudy'][Math.floor(Math.random() * 3)],
                description: 'clear sky',
                icon: '01d',
                precipitation: Math.random() * 0.5,
                windSpeed: 5 + Math.random() * 10
            });
        }
        return forecast;
    }

    getWeatherAdvice(weather, trail) {
        const advice = [];
        
        // Temperature advice
        if (weather.temperature > 85) {
            advice.push("🌡️ Very hot! Start early, bring extra water, and take frequent breaks.");
        } else if (weather.temperature < 40) {
            advice.push("🥶 Cold conditions! Dress in layers and watch for ice on trails.");
        }

        // Wind advice
        if (weather.windSpeed > 20) {
            advice.push("💨 High winds expected. Be cautious on exposed ridges and peaks.");
        }

        // Humidity advice
        if (weather.humidity > 80) {
            advice.push("💧 High humidity will make it feel hotter. Stay hydrated!");
        }

        // Trail-specific advice
        if (trail.difficulty === 'hard' && weather.temperature > 80) {
            advice.push("⚠️ Challenging trail in hot weather - consider postponing or starting very early.");
        }

        if (trail.features.includes('waterfall') && weather.precipitation > 0.1) {
            advice.push("🌧️ Recent rain may make trails muddy and waterfall areas slippery.");
        }

        if (trail.elevation > 1000 && weather.temperature < 50) {
            advice.push("🏔️ Higher elevation will be colder. Bring extra layers!");
        }

        return advice;
    }

    renderWeatherWidget(weather, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="weather-widget">
                <div class="weather-header">
                    <h4>Current Conditions</h4>
                </div>
                <div class="weather-main">
                    <div class="weather-temp">
                        <span class="temp-value">${weather.temperature}°F</span>
                        <span class="temp-feels">Feels like ${weather.feelsLike}°F</span>
                    </div>
                    <div class="weather-condition">
                        <img src="https://openweathermap.org/img/w/${weather.icon}.png" alt="${weather.description}">
                        <span>${weather.description}</span>
                    </div>
                </div>
                <div class="weather-details">
                    <div class="weather-detail">
                        <span class="detail-label">Humidity</span>
                        <span class="detail-value">${weather.humidity}%</span>
                    </div>
                    <div class="weather-detail">
                        <span class="detail-label">Wind</span>
                        <span class="detail-value">${weather.windSpeed} mph</span>
                    </div>
                    <div class="weather-detail">
                        <span class="detail-label">Visibility</span>
                        <span class="detail-value">${weather.visibility} mi</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderForecastWidget(forecast, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="forecast-widget">
                <div class="forecast-header">
                    <h4>5-Day Forecast</h4>
                </div>
                <div class="forecast-days">
                    ${forecast.map(day => `
                        <div class="forecast-day">
                            <div class="forecast-date">
                                ${day.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </div>
                            <img src="https://openweathermap.org/img/w/${day.icon}.png" alt="${day.description}">
                            <div class="forecast-temps">
                                <span class="temp-high">${day.high}°</span>
                                <span class="temp-low">${day.low}°</span>
                            </div>
                            <div class="forecast-condition">${day.condition}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Helper method to get weather for a trail
    async getTrailWeather(trail) {
        if (!trail.coordinates) {
            return this.getMockWeatherData();
        }
        
        const [lat, lon] = trail.coordinates;
        return await this.getCurrentWeather(lat, lon);
    }

    // Helper method to get forecast for a trail
    async getTrailForecast(trail) {
        if (!trail.coordinates) {
            return this.getMockForecastData();
        }
        
        const [lat, lon] = trail.coordinates;
        return await this.getForecast(lat, lon);
    }
}

// Initialize weather service
document.addEventListener('DOMContentLoaded', () => {
    window.weatherService = new WeatherService();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WeatherService;
}
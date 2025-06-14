// weather.js
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

    // Get weather forecast (daily) for given days (default 5)
    async getForecast(lat, lon, days = 5) {
        const cacheKey = `forecast_${lat}_${lon}_${days}`;
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        const url = `${this.baseUrl}/forecast/daily?lat=${lat}&lon=${lon}&days=${days}&key=${this.apiKey}&units=I`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Forecast data unavailable');

            const json = await response.json();
            if (!json.data || json.data.length === 0) throw new Error('No forecast data found');

            const forecastData = this.formatForecast(json.data);
            this.cache.set(cacheKey, { data: forecastData, timestamp: Date.now() });
            return forecastData;
        } catch (error) {
            console.error('Error fetching forecast:', error);
            return this.getMockForecastData();
        }
    }

    formatCurrentWeather(data) {
        return {
            temperature: Math.round(data.temp),
            feelsLike: Math.round(data.app_temp),
            humidity: data.rh,
            description: data.weather.description,
            icon: data.weather.icon,  // Weatherbit icon code
            windSpeed: Math.round(data.wind_spd * 2.237), // Convert m/s to mph
            windDirection: data.wind_dir,
            visibility: Math.round(data.vis / 1609.34), // meters to miles
            pressure: data.pres,
            uvIndex: data.uv,
            sunrise: new Date(data.sunrise_ts * 1000),
            sunset: new Date(data.sunset_ts * 1000)
        };
    }

    formatForecast(dataArray) {
        return dataArray.map(day => ({
            date: new Date(day.valid_date),
            high: Math.round(day.max_temp),
            low: Math.round(day.min_temp),
            condition: day.weather.description,
            icon: day.weather.icon,
            precipitation: day.pop, // probability of precipitation %
            windSpeed: Math.round(day.wind_spd * 2.237) // m/s to mph
        }));
    }

    getMockWeatherData() {
        return {
            temperature: 72,
            feelsLike: 75,
            humidity: 65,
            description: 'Partly cloudy',
            icon: 'c02d',  // Example Weatherbit icon
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
        const forecast = [];
        for (let i = 0; i < 5; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);

            forecast.push({
                date: date,
                high: 75 + Math.round(Math.random() * 10),
                low: 60 + Math.round(Math.random() * 10),
                condition: ['Clear sky', 'Cloudy', 'Partly cloudy'][Math.floor(Math.random() * 3)],
                icon: 'c01d',
                precipitation: Math.round(Math.random() * 100),
                windSpeed: 5 + Math.round(Math.random() * 10)
            });
        }
        return forecast;
    }
}

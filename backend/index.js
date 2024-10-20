
const express = require('express');
const axios = require('axios');
const cron = require('node-cron');
const connectDB = require('./db'); // Import MongoDB connection
const cors = require('cors'); // Import CORS
require('dotenv').config();

const API_KEY = process.env.WEATHER_API_KEY;
const cities = ['Delhi', 'Mumbai', 'Chennai', 'Bangalore', 'Kolkata', 'Hyderabad'];

// Connect to MongoDB
connectDB();

// Create an Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Use CORS middleware
app.use(cors());
app.use(express.json()); // To parse JSON requests

// Define MongoDB schema for daily weather summaries
const mongoose = require('mongoose');
const weatherSchema = new mongoose.Schema({
  city: String,
  date: { type: Date, default: Date.now },
  avgTemp: Number,
  maxTemp: Number,
  minTemp: Number,
  dominantCondition: String,
});

const WeatherSummary = mongoose.model('WeatherSummary', weatherSchema);

// User-configurable thresholds
const userThresholds = {
  temperature: 35, // Alert if temp exceeds 35°C
  consecutiveBreaches: 2, // Number of consecutive breaches required for alert
};

let cityData = {};

// Initialize the city data object
cities.forEach(city => {
  cityData[city] = {
    tempReadings: [],
    weatherConditions: [],
    maxTemp: -Infinity,
    minTemp: Infinity,
    breachCount: 0 // Track consecutive breaches
  };
});

// Function to convert Kelvin to Celsius
function convertToCelsius(kelvin) {
  return kelvin - 273.15;
}

// Fetch weather data for a city
async function fetchWeatherData(city) {
  try {
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`);
    const data = response.data;

    const tempCelsius = convertToCelsius(data.main.temp).toFixed(2);
    const weatherCondition = data.weather[0].main;

    // Update city's data with this reading
    cityData[city].tempReadings.push(Number(tempCelsius));
    cityData[city].weatherConditions.push(weatherCondition);
    cityData[city].maxTemp = Math.max(cityData[city].maxTemp, tempCelsius);
    cityData[city].minTemp = Math.min(cityData[city].minTemp, tempCelsius);

    console.log(`Weather in ${city}: ${tempCelsius}°C, Condition: ${weatherCondition}`);

    // Check if the temperature exceeds the user threshold
    checkTemperatureAlert(city, tempCelsius);
  } catch (error) {
    console.error(`Error fetching weather data for ${city}:`, error.message);
  }
}

// Threshold for temperature alert (example: 35°C)
const temperatureThreshold = 35;

// Track breaches for consecutive alerts
const breachCount = {};

// Function to process and check thresholds
function checkTemperatureAlert(city, temperature) {
  if (temperature > temperatureThreshold) {
    if (!breachCount[city]) {
      breachCount[city] = 1; // Initialize breach count
    } else {
      breachCount[city]++;
    }

    // Trigger alert after two consecutive breaches
    if (breachCount[city] >= 2) {
      console.log(`⚠️ ALERT: Temperature exceeded threshold in ${city}: ${temperature}°C`);
      breachCount[city] = 0; // Reset the counter after triggering an alert
    }
  } else {
    breachCount[city] = 0; // Reset count if temperature is back to normal
  }
}

// Schedule API calls every 2 minutes( can changed to any time  interval)
cron.schedule('*/2 * * * *', () => {
  console.log('Fetching weather data for cities...');
  cities.forEach(city => fetchWeatherData(city));
});

// Calculate the dominant weather condition
function calculateDominantWeather(conditions) {
  const conditionCount = conditions.reduce((acc, condition) => {
    acc[condition] = (acc[condition] || 0) + 1;
    return acc;
  }, {});

  return Object.keys(conditionCount).reduce((a, b) => conditionCount[a] > conditionCount[b] ? a : b);
}

// Schedule daily summary at midnight
cron.schedule('0 0 * * *', () => {
  console.log('Generating daily weather summary...');

  cities.forEach(async city => {
    const { tempReadings, weatherConditions, maxTemp, minTemp } = cityData[city];

    if (tempReadings.length > 0) {
      const avgTemp = (tempReadings.reduce((sum, temp) => sum + temp, 0) / tempReadings.length).toFixed(2);
      const dominantWeather = calculateDominantWeather(weatherConditions);

      console.log(`\n--- ${city} Daily Weather Summary ---`);
      console.log(`Average Temperature: ${avgTemp}°C`);
      console.log(`Maximum Temperature: ${maxTemp}°C`);
      console.log(`Minimum Temperature: ${minTemp}°C`);
      console.log(`Dominant Weather Condition: ${dominantWeather}`);
      console.log('------------------------------------\n');

      // Save daily summary to MongoDB
      const weatherSummary = new WeatherSummary({
        city,
        avgTemp,
        maxTemp,
        minTemp,
        dominantCondition: dominantWeather,
      });

      try {
        await weatherSummary.save();
        console.log(`Saved daily summary for ${city} to MongoDB.`);
      } catch (err) {
        console.error(`Error saving summary for ${city}:`, err);
      }

      // Reset city data for the next day
      cityData[city] = {
        tempReadings: [],
        weatherConditions: [],
        maxTemp: -Infinity,
        minTemp: Infinity,
        breachCount: 0,
      };
    }
  });
});

// Define a route to get weather summaries
app.get('/weather-summaries', async (req, res) => {
  try {
    const summaries = await WeatherSummary.find(); // Fetch all summaries from MongoDB
    res.json(summaries); // Send them as a JSON response
  } catch (error) {
    console.error('Error fetching weather summaries:', error);
    res.status(500).send('Server error');
  }
});

// Temporary route to insert sample data
//adding for testing purpose can be removed when the real data gets stored on db
app.post('/add-sample-data', async (req, res) => {
  try {
    const sampleData = [
      { city: 'Delhi', avgTemp: 32, maxTemp: 35, minTemp: 30, dominantCondition: 'Clear' },
      { city: 'Mumbai', avgTemp: 30, maxTemp: 33, minTemp: 28, dominantCondition: 'Cloudy' },
      { city: 'Chennai', avgTemp: 34, maxTemp: 36, minTemp: 32, dominantCondition: 'Sunny' },
      { city: 'Bangalore', avgTemp: 28, maxTemp: 30, minTemp: 25, dominantCondition: 'Rain' },
      { city: 'Kolkata', avgTemp: 31, maxTemp: 33, minTemp: 29, dominantCondition: 'Haze' },
      { city: 'Hyderabad', avgTemp: 29, maxTemp: 31, minTemp: 27, dominantCondition: 'Mist' },
    ];

    await WeatherSummary.insertMany(sampleData);
    res.status(200).send('Sample data added successfully.');
  } catch (error) {
    res.status(500).send('Error adding sample data: ' + error.message);
  }
});

// Define a route to get current weather data
app.get('/current-weather', (req, res) => {
  const currentWeatherData = cities.map(city => {
    const { tempReadings, weatherConditions, maxTemp, minTemp } = cityData[city];
    
    // Get the latest temperature and condition
    const latestTemp = tempReadings.length > 0 ? tempReadings[tempReadings.length - 1] : 'N/A'; // Default to 'N/A'
    const latestCondition = weatherConditions.length > 0 ? weatherConditions[weatherConditions.length - 1] : 'N/A'; // Default to 'N/A'

    return {
      city,
      latestTemp,
      latestCondition,
      maxTemp: maxTemp === -Infinity ? 'N/A' : maxTemp, // Default if maxTemp is -Infinity
      minTemp: minTemp === Infinity ? 'N/A' : minTemp, // Default if minTemp is Infinity
    };
  });

  res.json(currentWeatherData);
  console.log(currentWeatherData);
});




//start the server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
module.exports={app,convertToCelsius};
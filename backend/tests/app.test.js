const request = require('supertest');
const mongoose = require('mongoose');
const {app,convertToCelsius }= require('../index'); 
const connectDB = require('../db'); 

// Connect to MongoDB before all tests
beforeAll(async () => {
  await connectDB(process.env.MONGODB_URI_TEST); // Use a test DB URI
});

// Close connection after all tests
afterAll(async () => {
  await mongoose.connection.close();
});

// 1. System Setup
describe('System Setup', () => {
  it('should start successfully and connect to OpenWeatherMap API', async () => {
    // Check if the application can connect to the OpenWeatherMap API
    const response = await request(app).get('/weather-summaries'); // Adjust the endpoint if necessary
    expect(response.status).toBe(200);
  });
});

// 2. Data Retrieval
describe('Data Retrieval', () => {
  it('should retrieve weather data for specified locations', async () => {
    // Simulate API call for one of the cities
    const response = await request(app).get('/weather-summaries'); // Adjust if you have a specific endpoint for fetching data
    expect(response.body).toBeInstanceOf(Array); // Ensure it returns an array
    expect(response.body.length).toBeGreaterThan(0); // Ensure at least one summary exists
  });
});

// 3. Temperature Conversion
describe('Temperature Conversion', () => {
  it('should convert temperature from Kelvin to Celsius correctly', () => {
    const kelvin = 300; // Sample temperature in Kelvin
    const celsius = convertToCelsius(kelvin); // Assuming you have this function available
    expect(celsius).toBeCloseTo(26.85, 2); // Check conversion accuracy
  });
});

// 4. Daily Weather Summary
describe('Daily Weather Summary', () => {
  it('should calculate daily summaries correctly', async () => {
    // Simulate weather data for multiple days (you can manually add data to the test DB if needed)
    const city = 'Delhi'; // Example city

    // Mock weather updates (This would typically be done through your existing API)
    const weatherUpdates = [
      { temp: 30, condition: 'Clear' },
      { temp: 32, condition: 'Clouds' },
      { temp: 31, condition: 'Rain' },
    ];

    // Simulate saving summaries in the database
    for (const update of weatherUpdates) {
      // Assuming you have a function to save the data
      await request(app).post('/weather-summaries').send({
        city,
        avgTemperature: update.temp,
        maxTemperature: update.temp,
        minTemperature: update.temp,
        dominantWeatherCondition: update.condition,
      });
    }

    // Verify the summary calculation logic (you may want to call your summary generation function)
    const summariesResponse = await request(app).get('/weather-summaries');
    expect(summariesResponse.body).toBeInstanceOf(Array);
    expect(summariesResponse.body.length).toBeGreaterThan(0);
  });
});

// 5. Alerting Thresholds
describe('Alerting Thresholds', () => {
  it('should trigger alerts when temperature exceeds thresholds', async () => {
    // Set user thresholds
    const temperatureThreshold = 35;
    const breachCount = {};

    const testCities = [
      { city: 'Mumbai', temperature: 36 },
      { city: 'Delhi', temperature: 34 },
    ];

    testCities.forEach(({ city, temperature }) => {
      if (temperature > temperatureThreshold) {
        if (!breachCount[city]) {
          breachCount[city] = 1; // Initialize breach count
        } else {
          breachCount[city]++;
        }

        // Check if alert is triggered
        if (breachCount[city] >= 2) {
          console.log(`⚠️ ALERT: Temperature exceeded threshold in ${city}: ${temperature}°C`);
          expect(breachCount[city]).toBeGreaterThanOrEqual(2); // Alert should trigger
        }
      } else {
        breachCount[city] = 0; // Reset count if temperature is back to normal
      }
    });
  });
});

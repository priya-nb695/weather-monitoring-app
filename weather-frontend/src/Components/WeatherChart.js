// src/WeatherChart.js
import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const cities = ['Delhi', 'Mumbai', 'Chennai', 'Bangalore', 'Kolkata', 'Hyderabad'];

const WeatherChart = () => {
    const [summaries, setSummaries] = useState([]);
    const [currentWeather, setCurrentWeather] = useState({
        latestTemp: "loading...",
        latestCondition: "loading...",
        maxTemp: -Infinity,
        minTemp: Infinity

    });
    const [selectedCity, setSelectedCity] = useState('Delhi');

    useEffect(() => {
        // Fetch the daily summaries
        const fetchWeatherData = async () => {
            try {
                let response = await fetch('http://localhost:3001/weather-summaries') ;
                if (!response.ok) {
                    // If the  data not in db  try the second one
                    response = await fetch('http://localhost:3001/add-sample-data');
                }
                const data = await response.json();
                setSummaries(data);
            } catch (error) {
                console.error('Error fetching weather data:', error);
            }
        };

        fetchWeatherData();
    }, []);

    useEffect(() => {
        // Fetch the current weather for the selected city
        const fetchCurrentWeather = async () => {
            try {
                const response = await fetch('http://localhost:3001/current-weather');
                const data = await response.json();
                
                // Find the current weather for the selected city
                const cityWeather = data.find(city => city.city === selectedCity);
                if (cityWeather) {
                    setCurrentWeather({
                        latestTemp: cityWeather.latestTemp ? `${cityWeather.latestTemp}°C` : 'N/A',
                        latestCondition: cityWeather.latestCondition || 'N/A'
                    });
                } else {
                    setCurrentWeather({
                        latestTemp: 'N/A',
                        latestCondition: 'N/A'
                    });
                }
                setCurrentWeather(cityWeather || {});
            } catch (error) {
                console.error('Error fetching current weather:', error);
            }
        };

        fetchCurrentWeather();
    }, [selectedCity]); // Refetch current weather when the city changes

    const data = {
        labels: summaries.map(summary => summary.city),
        datasets: [
            {
                label: 'Average Temperature (°C)',
                data: summaries.map(summary => summary.avgTemp),
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
            {
                label: 'Maximum Temperature (°C)',
                data: summaries.map(summary => summary.maxTemp),
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
            },
            {
                label: 'Minimum Temperature (°C)',
                data: summaries.map(summary => summary.minTemp),
                backgroundColor: 'rgba(255, 206, 86, 0.2)',
                borderColor: 'rgba(255, 206, 86, 1)',
                borderWidth: 1,
            },
        ],
    };

    return (
        <div>
            <h1>Weather Monitoring</h1>
            
            <label htmlFor="citySelect">Select City: </label>
            <select
                id="citySelect"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
            >
                {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                ))}
            </select>

            {currentWeather && (
                <div>
                    <h2>Current Weather in {selectedCity}</h2>
                    <p>Temperature: {currentWeather.latestTemp ? `${currentWeather.latestTemp}°C` : 'N/A'}</p>
                    <p>Condition: {currentWeather.latestCondition || 'N/A'}</p>
                    <p>Date: {new Date().toLocaleString()}</p>


                    {currentWeather.latestTemp === 'N/A' && currentWeather.latestCondition === 'N/A' && (
                       
                       <div>
                        <p style={{ color: 'red', fontWeight: 'bold' }}>
                            Note: No readings have been collected yet.
                        </p>
                        <p style={{ color: 'red', fontWeight: 'bold' }}>
                           Wait for some time then select the city to see the Results .
                       </p>
                       </div>
                    )}
                </div>
            )}

            <Bar data={data} options={{ scales: { y: { beginAtZero: true } } }} />
        </div>
    );
};

export default WeatherChart;

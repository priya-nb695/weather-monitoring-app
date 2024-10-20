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

const WeatherChart = () => {
    const [summaries, setSummaries] = useState([]);

    useEffect(() => {
        const fetchWeatherData = async () => {
            try {
                const response = await fetch('http://localhost:3000/weather-summaries'); // Adjust the URL if necessary
                const data = await response.json();
                setSummaries(data);
            } catch (error) {
                console.error('Error fetching weather data:', error);
            }
        };

        fetchWeatherData();
    }, []);

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
            <Bar data={data} options={{ scales: { y: { beginAtZero: true } } }} />
        </div>
    );
};

export default WeatherChart;

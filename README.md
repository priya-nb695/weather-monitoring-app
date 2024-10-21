## Project Title: Real-Time Data Processing System for Weather Monitoring with Rollups and Aggregates

## Description
This project implements a real-time data processing system that monitors weather conditions in various metro cities of India, processes the data, and provides daily rollups and aggregates. The system continuously retrieves data from the OpenWeatherMap API and triggers alerts based on user-defined thresholds

## Installation Instructions
1. Clone the repository: `https://github.com/priya-nb695/weather-monitoring-app.git`
   
    git clone https://github.com/priya-nb695/weather-monitoring-app.git

2. Install Monogodb for storing 

   https://www.mongodb.com/try/download/community    

3. Navigate to the root directory and install dependencies: 
   
    cd  weather-monitoring-system
    
4. Navigate to Backend

     cd backend 
     npm install
     (if needed additional library use below commands ) 
     npm install express axios node-cron mongoose cors dotenv
     npm install --save-dev nodemon supertest jest
   
    # Setup Environment Variables (env file)  in backend  : Create a .env file with the following fields:
    .env ---> with this 
     ex:   WEATHER_API_KEY=your_api_key
           PORT=3001

5. Navigate to the frontend directory and install dependencies
   
    cd weather-frontend
    npm install
    (if needed additional library use below command)
    npm i  react-chartjs-2 chart.js


6. Start the backend server:
   
   cd backend
   node index.js
  
7. Start the frontend app:

   cd weather-frontend
   npm start

8. To test backend 
   cd backend
   npm test


   
# Usage Instructions

Start the backend server first then frontend 

The  data will be fecthed in every 2 mins and it can be seen in the backend dir console and in the UI its shown as current weather data (if the  readingis  NA , wait for second reading  then change the city and check)
The user can select the city from the provided dropdown

The  data(the aggregrated data like avg, min, max) will be stored in database at midnight of every day 
The UI will fetch the stored data from backend and The Visualization has been implemented to  display  the Results in the bar graphs.
hover the mouse on the bargraph  to see the avg, min, max tempeature of the city of the previous day (because it saves the data of that day in midnight)

(If the data not saved  in db it will use sample to show result )


# Security Considerations

The project uses dotenv to manage sensitive data, such as the OpenWeatherMap API key, which is stored in an environment file (.env). This prevents exposure of the API key in the source code.

User inputs for setting alerting thresholds and other configurations can be validated to avoid injection attacks. This is especially important when dealing with user-configurable thresholds.

CORS Protection.

Additionally, it’s recommended to enable SSL/TLS encryption for MongoDB connections in a production environment to prevent man-in-the-middle attacks.

HTTPS should be used in production.

# Performance Considerations

Efficient API Polling:I used node-cron to schedule API calls to OpenWeatherMap at regular intervals (e.g., every 5 minutes). The interval is configurable to balance between real-time updates and minimizing unnecessary API calls to reduce overhead.

Asynchronous Data Fetching:I leveraged axios for asynchronous API calls to ensure that the application remains non-blocking when fetching real-time weather data. This enhances overall responsiveness.

Database Indexing (MongoDB):Indexing was applied to key fields such as city and date in the weather summaries collection, which speeds up the retrieval of data for rollups and aggregates, enhancing query performance as the dataset grows.
Scalability:

The system is built in a modular fashion, making it easy to scale horizontally by adding more nodes to handle higher traffic and larger datasets. We also designed the system to handle multiple cities across India, so scaling to more locations or other countries would be seamless.
Data Aggregation and Summarization:

By summarizing weather data into daily aggregates (e.g., average, min/max temperatures), we reduced the amount of data processed for historical insights, which optimizes both storage and query performance for historical reports and visualizations.

# Contributing
Feel free to submit pull requests or report issues.

# Technologies Used:
Javascript,React, Node.js, Express,MongoDB,Axios,Supertest,Jest, react-chartjs.

# Future Improvements
User Authentication and Authorization.
Weather Forecasts Integration.
Machine Learning for Weather Predictions.
API Rate Limiting.
Caching.

# Error Handling: 
App handles common errors usin try catch logic.
Console logs the API Request Errors.
Console logs the Database Connection Errors. 
Console logs the Threshold Breach Handling.




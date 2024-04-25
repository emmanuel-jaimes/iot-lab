// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "",
    authDomain: "iot-project-8aba5.firebaseapp.com",
    databaseURL: "https://iot-project-8aba5-default-rtdb.firebaseio.com",
    // After deploying, view app at [projectId].web.app
    projectId: "iot-project-8aba5",  
    storageBucket: "iot-project-8aba5.appspot.com",
    messagingSenderId: "1082736731064",
    appId: "1:1082736731064:web:58e91dea471104eb8be54d"
  };

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  // Reference to Firebase database
  const database = firebase.database();

  // Function to fetch temperature data from Firebase and update HTML
  // Function to update displayed temperature and fluid level
  function updateTemperature() {
      const temperatureRef = database.ref('temperature');
      temperatureRef.get('value', function(snapshot) {
          const temperature = snapshot.val();
          document.getElementById('temperatureLabel').innerText = temperature + " °C";
          const fluidHeight = temperature * 3; // Adjust this value to fit your scale
          document.getElementById('fluid').style.height = fluidHeight + "px";
      }, function(error) {
          console.error("Error fetching temperature:", error);
          document.getElementById('temperatureLabel').innerText = "Error fetching temperature";
      });
  }

  function updateHumidity() {
    const humidityRef = database.ref('humidity');
    humidityRef.on('value', function(snapshot) {
      const humidity = snapshot.val();
      document.getElementById('humidityLabel').innerText = humidity + " %"; 
      const humidHeight = humidity * 3;
      document.getElementById('humidity-bar').style.height = humidHeight + "px";
    }, function(error) {
      console.error("Error fetching humidity:", error);
      document.getElementById('humidityLabel').innerText = "Error fetching humidity";
    });
  }

  // Call displayTemperature function when DOM content is loaded
  document.addEventListener('DOMContentLoaded', function() {
    updateTemperature();
    updateHumidity();
  });

  // Function to fetch weather data from OpenWeatherMap API
//   function fetchWeatherData(city) {
//       const apiKey = '';
//       const apiUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=33.44&lon=-94.04&appid=${apiKey}`;

//       fetch(apiUrl)
//       .then(response => response.json())
//       .then(data => {
//         // Extract current weather data
//         const currentTemperature = data.main.temp;
//         const currentHumidity = data.main.humidity;
//         const currentDescription = data.weather[0].description;

//         // Update HTML to display current weather data
//         document.getElementById('weather-temperature').innerText = currentTemperature + " °C";
//         document.getElementById('weather-humidity').innerText = currentHumidity + " %";
//         document.getElementById('weather-description').innerText = currentDescription;
//       })
//       .catch(error => {
//         console.error('Error fetching weather data:', error);
//         // Display error message or handle error gracefully
//       });
// }

// // Call fetchWeatherData function with city name (e.g., "London")
// fetchWeatherData("London");

const weatherContainer = document.getElementById("weather");
const city = document.getElementById("city");
const error = document.getElementById('error');

const units = 'imperial'; //can be imperial or metric
let temperatureSymobol = units == 'imperial' ? "°F" : "°C";

async function fetchWeather() {
    try {
        weatherContainer.innerHTML = '';
        error.innerHTML = '';
        city.innerHTML = '';


        const cnt = 10;
        const cityInputtedByUser = document.getElementById('cityInput').value;

        const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cityInputtedByUser}&appid=${apiKey}&units=${units}&cnt=${cnt}`;


        const response = await fetch(apiUrl);
        const data = await response.json();

        //Display error if user types invalid city or no city
        if (data.cod == '400' || data.cod == '404') {
            error.innerHTML = `Not valid city. Please input another city`;
            return;
        }
        //Display weather data for each 3 hour increment
        data.list.forEach(hourlyWeatherData => {
            const hourlyWeatherDataDiv = createWeatherDescription(hourlyWeatherData);
            weatherContainer.appendChild(hourlyWeatherDataDiv);
        });

        // Display city name based on latitude and longitude
        city.innerHTML = `Hourly Weather for ${data.city.name}`;

    } catch (error) {
        console.log(error);
    }
}

function convertToLocalTime(dt) {

    // Create a new Date object by multiplying the Unix timestamp by 1000 to convert it to milliseconds
    // Will produce a time in the local timezone of user's computer
    const date = new Date(dt * 1000);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based, so add 1
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours() % 12 || 12).padStart(2, '0'); // Convert 24-hour to 12-hour format
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const period = date.getHours() >= 12 ? 'PM' : 'AM'; // Determine AM/PM

    // Formatted date string in the format: YYYY-MM-DD hh:mm:ss AM/PM
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} ${period}`;

}

function createWeatherDescription(weatherData) {
    const { main, dt } = weatherData;

    const description = document.createElement("div");
    const convertedDateAndTime = convertToLocalTime(dt);

    // '2023-11-07 07:00:00 PM'
    description.innerHTML = `
        <div class = "weather_description">${main.temp}${temperatureSymobol} - ${convertedDateAndTime.substring(10)} - ${convertedDateAndTime.substring(5, 10)} </div>
    `;
    return description;
}
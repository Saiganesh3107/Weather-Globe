// Fetch weather by city name
async function fetchWeather(location) {
  const apiKey = "094b545dde613af5667ba10639a224f8";
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`;
  const response = await fetch(url);
  if (response.ok) return await response.json();
  else throw new Error("Failed to fetch weather data");
}

// Fetch weather by coordinates
async function fetchWeatherByCoords(lat, lon) {
  const apiKey = "094b545dde613af5667ba10639a224f8";
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  const response = await fetch(url);
  if (response.ok) return await response.json();
  else throw new Error("Failed to fetch weather by coordinates");
}

// Reverse geocode using OpenCage
async function getPlaceName(lat, lng) {
  const apiKey = "80f97b0383c946c1b3b5fafdf5e66b43"; // ⛳️ Replace this with your actual OpenCage API key
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${apiKey}`;

  console.log("Reverse geocoding URL:", url); // for debugging

  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 401) {
      console.error("❌ Invalid OpenCage API Key. Get yours from https://opencagedata.com/dashboard");
    } else {
      console.error(`Reverse geocoding failed: ${response.status}`);
    }
    throw new Error("Failed to fetch place name");
  }

  const data = await response.json();
  return data.results[0]?.formatted || "Unknown Location";
}

// Display the weather
function dispplayWeather(data, placeName = "") {
  const weatherDisplay = document.getElementById("weather-display");
  const temperature = document.getElementById("temperature");
  const condition = document.getElementById("condition");
  const windSpeed = document.getElementById("wind-speed");
  const humidity = document.getElementById("humidity");
  const locationName = document.getElementById("location-name");
  const body = document.body;

  const temp = data.main.temp;
  const weatherMain = data.weather[0].main;
  const iconCode = data.weather[0].icon;
  const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

  temperature.textContent = temp;
  condition.innerHTML = `${weatherMain} <img src="${iconUrl}" alt="${weatherMain}" style="vertical-align: middle;" />`;
  windSpeed.textContent = `Wind Speed: ${data.wind.speed}m/s`;
  humidity.textContent = `Humidity: ${data.main.humidity}%`;

  if (placeName) {
    locationName.textContent = `Location: ${placeName}`;
    locationName.style.display = "block";
  }

  weatherDisplay.style.display = "block";

  // Change background color by weather
  switch (weatherMain.toLowerCase()) {
    case "rain":
      body.style.backgroundColor = "#a3c0dd";
      break;
    case "clouds":
      body.style.backgroundColor = "#cfcfcf";
      break;
    case "clear":
      body.style.backgroundColor = "#fef3bd";
      break;
    case "snow":
      body.style.backgroundColor = "#e6f7ff";
      break;
    case "thunderstorm":
      body.style.backgroundColor = "#6b6b6b";
      break;
    default:
      body.style.backgroundColor = "#f0f1f6";
  }
}

// Toggle element visibility
function toggleElementVisibility(id, show) {
  const element = document.getElementById(id);
  element.style.display = show ? "block" : "none";
}

// Declare map and marker
let map, marker;

document.addEventListener("DOMContentLoaded", () => {
  const searchButton = document.getElementById("search-button");
  const locationInput = document.getElementById("location-input");

  // Initialize Leaflet map
  map = L.map("map").setView([20, 0], 2);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);

  // On map click
  map.on("click", async function (e) {
    const { lat, lng } = e.latlng;

    if (marker) map.removeLayer(marker);
    marker = L.marker([lat, lng]).addTo(map);

    toggleElementVisibility("loading", true);
    toggleElementVisibility("error", false);

    try {
      const [weatherData, placeName] = await Promise.all([
        fetchWeatherByCoords(lat, lng),
        getPlaceName(lat, lng),
      ]);

      toggleElementVisibility("loading", false);
      dispplayWeather(weatherData, placeName);
    } catch (err) {
      console.error(err);
      toggleElementVisibility("error", true);
      toggleElementVisibility("loading", false);
    }
  });

  // On search button click
  searchButton.addEventListener("click", async () => {
    const location = locationInput.value;
    toggleElementVisibility("loading", true);
    toggleElementVisibility("error", false);

    try {
      const weatherData = await fetchWeather(location);
      toggleElementVisibility("loading", false);

      const { lat, lon } = weatherData.coord;
      const placeName = weatherData.name;

      if (marker) map.removeLayer(marker);
      marker = L.marker([lat, lon]).addTo(map);
      map.setView([lat, lon], 8);

      dispplayWeather(weatherData, placeName);
    } catch (err) {
      console.error(err);
      toggleElementVisibility("error", true);
      toggleElementVisibility("loading", false);
    }
  });
});

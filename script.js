const searchInput = document.querySelector(".search-input");
const locationButton = document.querySelector(".location-button");
const currentWeatherDiv = document.querySelector(".current-weather");
const hourlyWeatherDiv = document.querySelector(".hourly-weather .weather-list");

const API_KEY = "4e2feb10d6ee4e4090a190735242008";


const weatherCodes = {
    clear: [1000],
    clouds: [1003, 1006, 1009],
    mist: [1030, 1135, 1147],
    rain: [1063, 1150, 1153, 1168, 1171, 1180, 1183, 1198, 1201, 1240, 1243, 1246, 1273, 1276],
    moderate_heavy_rain: [1186, 1189, 1192, 1195, 1243, 1246],
    snow: [1066, 1069, 1072, 1114, 1117, 1204, 1207, 1210, 1213, 1216, 1219, 1222, 1225, 1237, 1249, 1252, 1255, 1258, 1261, 1264, 1279, 1282],
    thunder: [1087, 1279, 1282],
    thunder_rain: [1273, 1276],
}

const displayHourlyForecast = (hourlyData) => {

    const currentHour = new Date().setMinutes(0,0,0);
    const next24Hours = currentHour + 24 * 60 * 60 * 1000;


    //filter the hourly data to only include the next 24 hours
    const next24HoursData = hourlyData.filter(({time}) => {
        const forecastTime = new Date(time).getTime();
        return forecastTime >= currentHour && forecastTime <= next24Hours;
    });

    //console.log(next24HoursData);
// Generate HTML for each hourly forecast and display it
    hourlyWeatherDiv.innerHTML = next24HoursData.map(item => {
        const temperature = Math.floor(item.temp_c);
        const time = item.time.split(" ")[1].substring(0, 5);
        const weatherIcon = Object.keys(weatherCodes).find(icon => weatherCodes[icon].includes(item.condition.code));

        return`<li class="weather-item">
                        <p class="time">${time}</p>
                        <img src="${weatherIcon}.svg" class="weather-icon">
                        <p class="temperature">${temperature}°</p>
                    </li>`;
    }).join("");

    //console.log(hourlyWeatherHTML);

}

const getWeatherDetails = async (API_URL) =>{

    window.innerWidth <= 768 && searchInput.blur();
    document.body.classList.remove("show-no-result");
    // const API_URL = `http://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${cityName}&days=2`;

    try{
        //fetch weather data from API and parse the response as JSON
        const response = await fetch(API_URL);
        const data = await response.json();

        //Extract the current weather details
        const temperature = Math.floor(data.current.temp_c);
        const description = data.current.condition.text;
       // const icon = data.current.condition.icon;
        const weatherIcon = Object.keys(weatherCodes).find(icon => weatherCodes[icon].includes(data.current.condition.code));

        //updating the current weather conditions and display them
        currentWeatherDiv.querySelector(".temperature").innerHTML = `${temperature}<span>°C</span>`;
        currentWeatherDiv.querySelector(".description").innerText = description;
       // currentWeatherDiv.querySelector(".weather-icon").src = icon;
        currentWeatherDiv.querySelector(".weather-icon").src = `${weatherIcon}.svg`;

       // Combine hourly data from today and tomorrow
        const combineHourlyData = [...data.forecast.forecastday[0].hour,...data.forecast.forecastday[1].hour];
        displayHourlyForecast(combineHourlyData);
        //console.log(combineHourlyData);
        //console.log(data);
        searchInput.value = data.location.name;
    }catch(error){
        console.log(error);
        document.body.classList.add("show-no-result");
    }
}

//set up the request for a specific city

const setupWeatherRequest = (cityName) => {
    const API_URL = `http://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${cityName}&days=2`;
    getWeatherDetails(API_URL);
}

//Handle user input in search box
searchInput.addEventListener("keyup" , (e)=>{
    const cityName = searchInput.value.trim() ;

    if(e.key == "Enter" && cityName){
        setupWeatherRequest(cityName);
    }
});

//get users co-ordinates
locationButton.addEventListener("click" , ()=> {
    navigator.geolocation.getCurrentPosition(position =>{
        //console.log(position);
        const { latitude , longitude} = position.coords;
        const API_URL = `http://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${latitude},${longitude}&days=2`;
        getWeatherDetails(API_URL);


    } , error =>{
        alert("location access denied . please enable permissions to use this  feature")
    });
})

setupWeatherRequest("NEW DELHI");
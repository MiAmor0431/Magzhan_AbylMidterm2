const content = document.querySelector(".content");
const weather_info = document.querySelector(".weather_info");
const not_found = document.querySelector(".not_found");
const city = document.querySelector(".city");
const days1 = document.querySelector(".days");
let weather, humidity, weather_name, weather_celsius, wind_speed;
let tempFahrenheit, tempCelsius;
let celsius_days = [];
let fahrenheit_days = [];
let HTML;

async function getWeather() {
    const cityName = city.value.trim();
    const apiKey = 'ae3b37dfdd75115f175410d1774c594c';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`;

    try {
        const response = await fetch(url);
        const weatherData = await response.json();
        console.log(weatherData);

        if (weatherData.cod === 200) {
            tempCelsius = (weatherData.main.temp - 273.15).toFixed(2);
            tempFahrenheit = ((weatherData.main.temp * 9/5) - 459.67).toFixed(2);
            weather_celsius = Math.floor(tempCelsius);

            const weatherMain = weatherData.weather[0].main;
            weather_name = weatherMain;
            wind_speed = weatherData.wind.speed;
            humidity = weatherData.main.humidity;

            switch (weatherMain) {
                case 'Clear':
                    weather = '/assets/clear-day.svg';
                    break;
                case 'Clouds':
                    weather = '/assets/cloudy.svg';
                    break;
                case 'Rain':
                    weather = '/assets/heavy-showers.svg';
                    break;
                case 'Thunderstorm':
                    weather = '/assets/thunderstorm-showers.svg';
                    break;
                case 'Snow':
                    weather = '/assets/snow.svg';
                    break;
                case 'Drizzle':
                    weather = '/assets/drizzle.svg';
                    break;
                case 'Fog':
                    weather = '/assets/fog.svg';
                    break;
                default:
                    weather = '/assets/Cloud.svg';
                    break;
            }

            if (weather_info) {
                weather_info.style.display = "flex";
            }
            not_found.innerHTML = '';
            days(cityName, apiKey);

        } else {
            content.style.height = '200px';
            setTimeout(() => {
                not_found.innerHTML = `<div class="not_found">Error: We can't find that city. :(</div>`;
            }, 500);
            console.error(`Error: ${weatherData.message}`);
            document.getElementById('temperature').textContent = `Error: ${weatherData.message}`;
        }
    } catch (error) {
        console.error('Fetch error:', error);
        document.getElementById('temperature').textContent = 'Error fetching data.';
    }
}

document.querySelector('.button-search').addEventListener('click', (event) => {
    event.preventDefault();
    weather_info.style.display = "none";
    days1.style.display = "none";
    if (city.value.trim().length < 1) {
        alert('Please enter a city');
        return;
    }

    getWeather().then(() => {
        if (weather_info && weather) {
            content.style.height = '600px';
            days1.style.display = "flex";
            setTimeout(() => {
                weather_info.innerHTML = `
                    <img class="weather_icon" src="${weather}" alt="Weather icon">
                    <div class="temp">
                        <div class="temperature">
                            <p class="first_temp">${weather_celsius}</p>
                            <p class="temp_type">ºC</p>
                        </div>
                        <p class="weather_name">${weather_name}</p>
                    </div>
                    <div class="details">
                        <div class="humidity">
                            <img class="humidity_icon" src="/assets/icon%20_humidity.svg" alt="">
                            <div>
                                <p class="humidity_percent">${humidity}%</p>
                                <p>Humidity</p>
                            </div>
                        </div>
                        <div class="humidity">
                            <img class="speed_icon" src="/assets/windy.svg" alt="">
                            <div>
                                <p class="speed_num">${wind_speed} Km/h</p>
                                <p>Wind Speed</p>
                            </div>
                        </div>
                    </div>
                `;
            }, 650);
            HTML
        }
    });
});

document.querySelector('.button_change').addEventListener('click', (event) => {
    const tempToggleButton = document.querySelector('.button_change');
    const isCelsius = tempToggleButton.innerText === "ºC";

    tempToggleButton.innerText = isCelsius ? "ºF" : "ºC";

    document.querySelector('.first_temp').innerText = isCelsius ? `${Math.floor(tempFahrenheit)}` : `${Math.floor(tempCelsius)}`;
    document.querySelector('.temp_type').innerText = isCelsius ? "ºF" : "ºC";

    document.querySelectorAll('.day').forEach((dayElement, index) => {
        const tempNum = dayElement.querySelector('.temp_num');
        const tempType = dayElement.querySelector('.temp_type1');

        if (isCelsius) {
            tempNum.innerText = fahrenheit_days[index];
            tempType.innerText = "ºF";
        } else {
            tempNum.innerText = celsius_days[index];
            tempType.innerText = "ºC";
        }
    });
});


async function days(cityName, apiKey) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}`;

    try {
        const response = await fetch(url);
        const weatherData = await response.json();
        console.log(weatherData);
        if (weatherData.cod == 200) {
            const daysContainer = document.querySelector('.days');
            daysContainer.innerHTML = '';
            const forecastList = weatherData.list;
            const displayedDays = [];

            celsius_days = [];
            fahrenheit_days = [];


            forecastList.forEach(forecast => {
                const forecastDate = new Date(forecast.dt_txt).toDateString();

                if (!displayedDays.includes(forecastDate)) {
                    displayedDays.push(forecastDate);

                    const dayTempCelsius = Math.floor(forecast.main.temp - 273.15);
                    const dayTempFahrenheit = Math.floor((forecast.main.temp * 9 / 5) - 459.67);
                    celsius_days.push(dayTempCelsius);
                    fahrenheit_days.push(dayTempFahrenheit);

                    const weatherMain = forecast.weather[0].main;
                    let weatherIcon;
                    switch (weatherMain) {
                        case 'Clear':
                            weatherIcon = '/assets/clear-day.svg';
                            break;
                        case 'Clouds':
                            weatherIcon = '/assets/cloudy.svg';
                            break;
                        case 'Rain':
                            weatherIcon = '/assets/heavy-showers.svg';
                            break;
                        case 'Thunderstorm':
                            weatherIcon = '/assets/thunderstorm-showers.svg';
                            break;
                        case 'Snow':
                            weatherIcon = '/assets/snow.svg';
                            break;
                        case 'Drizzle':
                            weatherIcon = '/assets/drizzle.svg';
                            break;
                        case 'Fog':
                            weatherIcon = '/assets/fog.svg';
                            break;
                        default:
                            weatherIcon = '/assets/Cloud.svg';
                            break;
                    }

                    HTML = `<div class="day">
                            <p class="day_name">${forecastDate.split(' ')[0]}</p>
                            <img class="day_icon" src="${weatherIcon}" alt="${weatherMain}">
                            <div class="day_temp">
                                <p class="temp_num">${dayTempCelsius}</p>
                                <p class="temp_type temp_type1">ºC</p>
                            </div>
                        </div>`;
                    daysContainer.insertAdjacentHTML(`beforeend`, HTML);
                }
            });
        }
    } catch (error) {
        console.error('Error fetching forecast data:', error);
        document.getElementById('temperature').textContent = 'Error fetching data.';
    }
}


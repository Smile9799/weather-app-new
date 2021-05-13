let city = document.querySelector('.weather_city');
let day = document.querySelector('.weather_day');
let _humidity = document.querySelector('.weather_indicator--humidity>.value');
let wind = document.querySelector('.weather_indicator--wind>.value');
let pressure = document.querySelector('.weather_indicator--pressure>.value');
let image = document.querySelector('.weather_image');
let temperature = document.querySelector('.weather_temperature>.value');
let search = document.querySelector('.weather_search');
let forecastBlock = document.querySelector('.weather_forecast');
let suggestions = document.querySelector('#suggestions');
let weatherAPIKey = 'ab1967aaf2d14d0d82e223823210805';


let weatherBaseEndPoint = `https://api.weatherapi.com/v1/forecast.json?key=${weatherAPIKey}`;
let cityBaseEndPoint = 'https://api.teleport.org/api/cities/?search=';


let getWeatherByCityName =async (cityString) =>{
    let city;
    if(cityString.includes(',')){
        city = cityString.substring(0, cityString.indexOf(','))+cityString.substring(cityString.lastIndexOf(','));
    }else{
        city = cityString;
    }
    let endPoint = weatherBaseEndPoint + '&q='+city+'&days=3&aqi=no&alerts=no';
    let response = await fetch(endPoint);
    if(response.status !== 200){
        alert("City not found");
        return;
    }
    let weather = await response.json();
    
    return weather;
}
window.addEventListener('load',async ()=>{
    let weather = await getWeatherByCityName('Johannesburg');
    updateCurrentWeather(weather);
});
search.addEventListener('keydown',async (e)=>{
    if(e.keyCode == 13){
        let weather = await getWeatherByCityName(search.value);
        if(!weather){
            return;
        }
        updateCurrentWeather(weather);
    }
});

search.addEventListener('input',async ()=>{
    let endPoint = cityBaseEndPoint + search.value;
    let results =await(await fetch(endPoint)).json();
    suggestions.innerHTML = '';
    let cities = results._embedded['city:search-results'];
    let length = cities.length > 5 ? 5 : cities.length;
    for(let i=0; i<length; i++){
        let option = document.createElement('option');
        option.value =cities[i].matching_full_name;
        suggestions.appendChild(option);
    }
});

let dayOfWeek = ()=>{
    return new Date().toLocaleDateString('en-EN',{'weekday':'long'});
}

let updateForecast = (forecasts)=>{
    forecastBlock.innerHTML = '';
    forecasts.forEach(d =>{
        let iconUrl = d.day.condition.icon;
        let maxTemp = d.day.maxtemp_c > 0 ? '+' + Math.round(d.day.maxtemp_c) : Math.round(d.day.maxtemp_c);
        let minTemp =  d.day.mintemp_c > 0 ? '+' + Math.round(d.day.mintemp_c) : Math.round(d.day.mintemp_c);
        let day = d.date
        let alt = d.day.condition.text;

        let forecastItem = `
        <article class="weather_forecast_item">
        <img src="${iconUrl}" alt="${alt}" class="weather_forecast_icon">
        <h3 class="weather_forecast_day">${day}</h3>
        <p class="weather_forecast_temperature"><span class="value">${maxTemp}&deg;C / ${minTemp}</span>&deg;C</p>
        </article>
        `;
        forecastBlock.insertAdjacentHTML('beforeend',forecastItem);
    });
}

let updateCurrentWeather = (data)=>{
    city.textContent = data.location.name +', '+data.location.country;
    day.textContent = data.location.localtime;
    _humidity.textContent = data.current.humidity;
    wind.textContent = data.current.wind_dir + ' ,' +data.current.wind_kph;
    pressure.textContent = data.current.pressure_mb;
    temperature.textContent = data.current.temp_c>0 ? '+' +Math.round(data.current.temp_c) : Math.round(data.current.temp_c);
    image.src = data.current.condition.icon;

    let forecastList = data.forecast.forecastday;
    let daily = [];
    forecastList.forEach(day=>{
        daily.push(day);
    });
    updateForecast(daily);
}
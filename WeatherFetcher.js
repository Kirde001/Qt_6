var apiKey = "53f2e1b43a53b9ec86018cdf1e816cfa"
var baseUrl = "https://api.openweathermap.org/data/2.5/weather"
var forecastUrl = "https://api.openweathermap.org/data/2.5/forecast"

function convertToFahrenheit(celsius) {
    return Math.round((celsius * 9/5 + 32) * 10) / 10;
}

function fetchWeather(city) {
    if (!city) {
        errorMessage.text = qsTr("Введите город")
        errorMessage.visible = true
        return
    }

    // Fetch current weather
    var xhr = new XMLHttpRequest()
    var url = baseUrl + "?q=" + encodeURIComponent(city) +
              "&appid=" + apiKey + "&units=metric&lang=ru"

    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                var response = JSON.parse(xhr.responseText)
                cityName.text = qsTr("Город: ") + response.name

                var tempC = response.main.temp
                var tempF = convertToFahrenheit(tempC)
                temperature.text = qsTr("Температура: ") +
                    (useCelsius ? tempC + "°C" : tempF + "°F")

                description.text = qsTr("Описание: ") + response.weather[0].description
                humidity.text = qsTr("Влажность: ") + response.main.humidity + "%"
                wind.text = qsTr("Ветер: ") + response.wind.speed + " м/с"
                errorMessage.visible = false
                weatherBlock.opacity = 1.0
                fetchForecast(city)
            } else {
                errorMessage.text = qsTr("Ошибка: проверьте название города")
                errorMessage.visible = true
                weatherBlock.opacity = 0.0
                forecastBlock.opacity = 0.0
            }
        }
    }

    xhr.open("GET", url)
    xhr.send()
}

function fetchForecast(city) {
    var xhr = new XMLHttpRequest()
    var url = forecastUrl + "?q=" + encodeURIComponent(city) +
              "&appid=" + apiKey + "&units=metric&lang=ru"

    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                var response = JSON.parse(xhr.responseText)
                var dailyForecasts = processForecastData(response.list)
                forecastModel.clear()

                for (var i = 0; i < dailyForecasts.length; i++) {
                    forecastModel.append({
                        date: dailyForecasts[i].date,
                        temp: dailyForecasts[i].temp,
                        tempF: dailyForecasts[i].tempF,
                        desc: dailyForecasts[i].desc
                    })
                }
                forecastBlock.opacity = 1.0
            } else {
                errorMessage.text = qsTr("Ошибка при загрузке прогноза")
                errorMessage.visible = true
                forecastBlock.opacity = 0.0
            }
        }
    }

    xhr.open("GET", url)
    xhr.send()
}

function processForecastData(list) {
    var dailyData = {}
    var currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    for (var i = 0; i < list.length; i++) {
        var item = list[i]
        var itemDate = new Date(item.dt * 1000)
        var dayKey = itemDate.toISOString().split('T')[0]

        if (itemDate.getDate() === currentDate.getDate()) continue

        if (!dailyData[dayKey]) {
            dailyData[dayKey] = {
                temps: [],
                tempsF: [],
                desc: item.weather[0].description
            }
        }
        dailyData[dayKey].temps.push(item.main.temp)
        dailyData[dayKey].tempsF.push(convertToFahrenheit(item.main.temp))
    }

    var result = []
    var keys = Object.keys(dailyData).sort()
    for (var i = 0; i < keys.length && i < 4; i++) {
        var key = keys[i]
        var temps = dailyData[key].temps
        var tempsF = dailyData[key].tempsF
        var avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length
        var avgTempF = tempsF.reduce((a, b) => a + b, 0) / tempsF.length

        result.push({
            date: new Date(key).toLocaleDateString('ru-RU', { weekday: 'long' }),
            temp: Math.round(avgTemp * 10) / 10,
            tempF: Math.round(avgTempF * 10) / 10,
            desc: dailyData[key].desc
        })
    }

    return result
}

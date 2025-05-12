.pragma library

var forecastData = []
var cityData = {}
var appSettings
var cityName, temperature, description, humidity, wind
var forecastModel, weatherBlock, forecastBlock, errorMessage

function setContext(settings, cityNameId, temperatureId, descriptionId, humidityId, windId, forecastModelId, weatherBlockId, forecastBlockId, errorMessageId) {
    appSettings = settings
    cityName = cityNameId
    temperature = temperatureId
    description = descriptionId
    humidity = humidityId
    wind = windId
    forecastModel = forecastModelId
    weatherBlock = weatherBlockId
    forecastBlock = forecastBlockId
    errorMessage = errorMessageId
}

function fetchWeather(city) {
    console.log("Fetching weather for:", city)

    // Пример заглушки
    cityData = {
        city: city,
        temperature: appSettings.tempUnit === "celsius" ? "25" : "77",
        description: "Ясно",
        humidity: "40%",
        wind: "5 м/с"
    }

    forecastData = [
        { date: "2025-05-13", temp: "23", tempF: "73", desc: "Солнечно" },
        { date: "2025-05-14", temp: "21", tempF: "69", desc: "Облачно" },
        { date: "2025-05-15", temp: "22", tempF: "71", desc: "Дождь" },
        { date: "2025-05-16", temp: "24", tempF: "75", desc: "Ясно" }
    ]

    updateUI()
}

function updateUI() {
    cityName.text = "Город: " + cityData.city
    temperature.text = "Температура: " + cityData.temperature + (appSettings.tempUnit === "celsius" ? "°C" : "°F")
    description.text = "Описание: " + cityData.description
    humidity.text = "Влажность: " + cityData.humidity
    wind.text = "Ветер: " + cityData.wind

    forecastModel.clear()
    for (var i = 0; i < forecastData.length; i++) {
        forecastModel.append(forecastData[i])
    }

    weatherBlock.opacity = 1.0
    forecastBlock.opacity = 1.0
    errorMessage.visible = false
}

function exportToCSV() {
    var csv = "Date,Temperature (C),Temperature (F),Description\n"
    for (var i = 0; i < forecastData.length; i++) {
        var row = forecastData[i]
        csv += `${row.date},${row.temp},${row.tempF},${row.desc}\n`
    }

    var io = new XMLHttpRequest()
    io.open("PUT", "forecast.csv")
    io.send(csv)
    console.log("CSV экспортирован.")
}

function importFromCSV() {
    var xhr = new XMLHttpRequest()
    xhr.open("GET", "forecast.csv")
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                var lines = xhr.responseText.split("\n")
                forecastModel.clear()
                forecastData = []
                for (var i = 1; i < lines.length; i++) {
                    var cols = lines[i].split(",")
                    if (cols.length >= 4) {
                        var entry = {
                            date: cols[0],
                            temp: cols[1],
                            tempF: cols[2],
                            desc: cols[3]
                        }
                        forecastData.push(entry)
                        forecastModel.append(entry)
                    }
                }
                forecastBlock.opacity = 1.0
            } else {
                console.log("Ошибка при импорте CSV:", xhr.status)
            }
        }
    }
    xhr.send()
}

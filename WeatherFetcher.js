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
        csv += `${row.date},${row.temp},${row.tempF},${row.desc}\

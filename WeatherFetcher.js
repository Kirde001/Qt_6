var forecastData = []
var currentWeatherData = null

function fetchWeather(city) {
    // Dummy data for demonstration
    currentWeatherData = {
        city: city,
        temp: 15,
        tempF: 59,
        desc: "Облачно",
        humidity: "75%",
        wind: "5 м/с"
    }
    
    forecastData = [
        { date: "2025-05-12", temp: 15, tempF: 59, desc: "Облачно" },
        { date: "2025-05-13", temp: 17, tempF: 62.6, desc: "Солнечно" },
        { date: "2025-05-14", temp: 13, tempF: 55.4, desc: "Дождь" },
        { date: "2025-05-15", temp: 16, tempF: 60.8, desc: "Ясно" }
    ]

    // Update current weather UI
    cityName.text = "Город: " + currentWeatherData.city
    temperature.text = "Температура: " + (useCelsius ? currentWeatherData.temp + "°C" : currentWeatherData.tempF + "°F")
    description.text = "Описание: " + currentWeatherData.desc
    humidity.text = "Влажность: " + currentWeatherData.humidity
    wind.text = "Ветер: " + currentWeatherData.wind
    weatherBlock.opacity = 1.0

    // Update forecast
    forecastModel.clear()
    for (var i = 0; i < forecastData.length; i++) {
        forecastModel.append(forecastData[i])
    }
    forecastBlock.opacity = 1.0
    errorMessage.visible = false
}

function exportToCSV(fileUrl) {
    try {
        // Создаем CSV содержимое
        var csv = "City,Temperature (C),Temperature (F),Description,Humidity,Wind\n";
        if (currentWeatherData) {
            csv += `"${currentWeatherData.city}",${currentWeatherData.temp},${currentWeatherData.tempF},"${currentWeatherData.desc}","${currentWeatherData.humidity}","${currentWeatherData.wind}"\n`;
        }
        
        csv += "\nForecast Data\nDate,Temperature (C),Temperature (F),Description\n";
        for (var i = 0; i < forecastData.length; i++) {
            var row = forecastData[i];
            csv += `"${row.date}",${row.temp},${row.tempF},"${row.desc}"\n`;
        }

        // Получаем путь к файлу
        var path = fileUrl.toString();
        // Удаляем префикс "file:///" для платформы Windows или "file://" для других
        path = path.replace(/^(file:\/{3})|(qrc:\/{2})|(http:\/{2})/, "");
        path = decodeURIComponent(path);

        // Создаем объект File для записи
        var file = Qt.openUrlExternally("file://" + path);
        if (!file) {
            throw new Error("Не удалось создать файл");
        }

        // Альтернативный способ записи через XMLHttpRequest
        var xhr = new XMLHttpRequest();
        xhr.open("PUT", "file://" + path, false);
        xhr.send(csv);

        if (xhr.status === 0 || xhr.status === 200) {
            console.log("Файл успешно сохранен:", path);
        } else {
            throw new Error("Ошибка при записи файла. Статус: " + xhr.status);
        }
    } catch (e) {
        console.error("Ошибка при экспорте:", e);
        errorMessage.text = "Ошибка экспорта: " + e.message;
        errorMessage.visible = true;
    }
}

function importFromCSV(fileUrl) {
    try {
        // Получаем путь к файлу
        var path = fileUrl.toString();
        path = path.replace(/^(file:\/{3})|(qrc:\/{2})|(http:\/{2})/, "");
        path = decodeURIComponent(path);

        // Читаем файл через XMLHttpRequest
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "file://" + path, false);
        xhr.send();

        if (xhr.status !== 0 && xhr.status !== 200) {
            throw new Error("Не удалось прочитать файл. Статус: " + xhr.status);
        }

        var text = xhr.responseText;
        var sections = text.split("\n\n");

        // Парсим текущую погоду
        if (sections.length > 0 && sections[0].includes("City")) {
            var currentLines = sections[0].split("\n");
            if (currentLines.length > 1) {
                var currentCols = currentLines[1].split(",");
                if (currentCols.length >= 6) {
                    currentWeatherData = {
                        city: currentCols[0].replace(/"/g, ''),
                        temp: parseFloat(currentCols[1]),
                        tempF: parseFloat(currentCols[2]),
                        desc: currentCols[3].replace(/"/g, ''),
                        humidity: currentCols[4].replace(/"/g, ''),
                        wind: currentCols[5].replace(/"/g, '')
                    };
                    
                    // Обновляем UI
                    cityInput.text = currentWeatherData.city;
                    cityName.text = "Город: " + currentWeatherData.city;
                    temperature.text = "Температура: " + (useCelsius ? currentWeatherData.temp + "°C" : currentWeatherData.tempF + "°F");
                    description.text = "Описание: " + currentWeatherData.desc;
                    humidity.text = "Влажность: " + currentWeatherData.humidity;
                    wind.text = "Ветер: " + currentWeatherData.wind;
                    weatherBlock.opacity = 1.0;
                }
            }
        }

        // Парсим прогноз
        if (sections.length > 1 && sections[1].includes("Forecast Data")) {
            forecastModel.clear();
            forecastData = [];
            var forecastLines = sections[1].split("\n");
            for (var i = 1; i < forecastLines.length; i++) {
                if (forecastLines[i].trim() === "") continue;
                var forecastCols = forecastLines[i].split(",");
                if (forecastCols.length >= 4) {
                    var entry = {
                        date: forecastCols[0].replace(/"/g, ''),
                        temp: parseFloat(forecastCols[1]),
                        tempF: parseFloat(forecastCols[2]),
                        desc: forecastCols[3].replace(/"/g, '')
                    };
                    forecastData.push(entry);
                    forecastModel.append(entry);
                }
            }
            forecastBlock.opacity = 1.0;
        }

        console.log("Импорт завершен успешно");
    } catch (e) {
        console.error("Ошибка при импорте:", e);
        errorMessage.text = "Ошибка импорта: " + e.message;
        errorMessage.visible = true;
    }
}

function parseCSVLine(line) {
    var result = [];
    var inQuotes = false;
    var currentField = "";
    
    for (var i = 0; i < line.length; i++) {
        var char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(currentField);
            currentField = "";
        } else {
            currentField += char;
        }
    }
    
    result.push(currentField);
    return result;
}

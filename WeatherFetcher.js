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
function exportToCSV(file) {
    try {
        if (!file) {
            throw new Error("Не указан файл для сохранения");
        }

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

        // Получаем путь как строку
        var path = file.toString();
        
        // Для Linux: удаляем "file://" префикс
        if (path.startsWith("file://")) {
            path = path.substring(7);
        }
        
        // Декодируем URI компоненты
        path = decodeURIComponent(path);
        
        console.log("Сохраняем в файл:", path);

        // Создаем объект File для записи
        var fileHandle = new XMLHttpRequest();
        fileHandle.open("PUT", "file://" + path, false);
        fileHandle.send(csv);

        if (fileHandle.status === 0 || fileHandle.status === 200) {
            console.log("Файл успешно сохранен:", path);
            showMessage("Файл сохранен: " + path, "green");
        } else {
            throw new Error("Ошибка при записи файла. Статус: " + fileHandle.status);
        }
    } catch (e) {
        console.error("Ошибка при экспорте:", e);
        showMessage("Ошибка экспорта: " + e.message, "red");
    }
}

function importFromCSV(file) {
    try {
        if (!file) {
            throw new Error("Не указан файл для загрузки");
        }

        // Получаем путь как строку
        var path = file.toString();
        
        // Для Linux: удаляем "file://" префикс
        if (path.startsWith("file://")) {
            path = path.substring(7);
        }
        
        path = decodeURIComponent(path);
        console.log("Загружаем из файла:", path);

        // Читаем файл
        var fileHandle = new XMLHttpRequest();
        fileHandle.open("GET", "file://" + path, false);
        fileHandle.send();

        if (fileHandle.status !== 0 && fileHandle.status !== 200) {
            throw new Error("Не удалось прочитать файл. Статус: " + fileHandle.status);
        }

        var text = fileHandle.responseText;
        // ... остальная часть функции импорта ...
    } catch (e) {
        console.error("Ошибка при импорте:", e);
        showMessage("Ошибка импорта: " + e.message, "red");
    }
}

// Вспомогательная функция для показа сообщений
function showMessage(text, color) {
    errorMessage.text = text;
    errorMessage.color = color;
    errorMessage.visible = true;
    Qt.callLater(function() {
        errorMessage.visible = false;
    }, 3000);
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

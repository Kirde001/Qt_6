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
function exportToCSV(filePath) {
    try {
        if (!filePath) {
            throw new Error("Не указан путь для сохранения");
        }

        // 1. Подготовка данных CSV
        var csvContent = prepareCSVData();
        
        // 2. Обработка пути файла
        var cleanPath = processFilePath(filePath);
        
        // 3. Запись файла
        writeFile(cleanPath, csvContent);
        
        showMessage("Файл успешно сохранен: " + cleanPath, "green");
    } catch (e) {
        console.error("Ошибка при экспорте:", e);
        showMessage("Ошибка экспорта: " + e.message, "red");
    }
}

function importFromCSV(filePath) {
    try {
        if (!filePath) {
            throw new Error("Не указан файл для загрузки");
        }

        // 1. Обработка пути файла
        var cleanPath = processFilePath(filePath);
        
        // 2. Чтение файла
        var fileContent = readFile(cleanPath);
        
        // 3. Парсинг данных
        parseCSVData(fileContent);
        
        showMessage("Данные успешно загружены", "green");
    } catch (e) {
        console.error("Ошибка при импорте:", e);
        showMessage("Ошибка импорта: " + e.message, "red");
    }
}

// Вспомогательные функции:

function prepareCSVData() {
    var csv = "City,Temperature (C),Temperature (F),Description,Humidity,Wind\n";
    
    if (currentWeatherData) {
        csv += `"${currentWeatherData.city}",${currentWeatherData.temp},${currentWeatherData.tempF},"${currentWeatherData.desc}","${currentWeatherData.humidity}","${currentWeatherData.wind}"\n`;
    }
    
    csv += "\nForecast Data\nDate,Temperature (C),Temperature (F),Description\n";
    forecastData.forEach(row => {
        csv += `"${row.date}",${row.temp},${row.tempF},"${row.desc}"\n`;
    });
    
    return csv;
}

function processFilePath(filePath) {
    // Удаляем префикс "file://" если есть
    if (filePath.startsWith("file://")) {
        filePath = filePath.substring(7);
    }
    
    // Декодируем URI-компоненты (например, %20 → пробел)
    filePath = decodeURIComponent(filePath);
    
    // Убедимся, что путь не пустой
    if (!filePath.trim()) {
        throw new Error("Получен пустой путь к файлу");
    }
    
    return filePath;
}

function writeFile(path, content) {
    var xhr = new XMLHttpRequest();
    xhr.open("PUT", "file://" + path, false);
    xhr.send(content);
    
    if (xhr.status !== 0 && xhr.status !== 200) {
        throw new Error("Ошибка записи файла. Статус: " + xhr.status);
    }
}

function readFile(path) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "file://" + path, false);
    xhr.send();
    
    if (xhr.status !== 0 && xhr.status !== 200) {
        throw new Error("Ошибка чтения файла. Статус: " + xhr.status);
    }
    
    return xhr.responseText;
}

function parseCSVData(content) {
    var sections = content.split("\n\n");
    
    // Парсинг текущей погоды
    if (sections[0].includes("City")) {
        var currentLines = sections[0].split("\n");
        if (currentLines.length > 1) {
            var cols = currentLines[1].split(",");
            currentWeatherData = {
                city: cols[0].replace(/"/g, ''),
                temp: parseFloat(cols[1]),
                tempF: parseFloat(cols[2]),
                desc: cols[3].replace(/"/g, ''),
                humidity: cols[4].replace(/"/g, ''),
                wind: cols[5].replace(/"/g, '')
            };
            updateCurrentWeatherUI();
        }
    }
    
    // Парсинг прогноза
    if (sections[1] && sections[1].includes("Forecast Data")) {
        forecastModel.clear();
        forecastData = [];
        
        sections[1].split("\n").slice(1).forEach(line => {
            if (line.trim()) {
                var cols = line.split(",");
                var entry = {
                    date: cols[0].replace(/"/g, ''),
                    temp: parseFloat(cols[1]),
                    tempF: parseFloat(cols[2]),
                    desc: cols[3].replace(/"/g, '')
                };
                forecastData.push(entry);
                forecastModel.append(entry);
            }
        });
        forecastBlock.opacity = 1.0;
    }
}

function updateCurrentWeatherUI() {
    cityInput.text = currentWeatherData.city;
    cityName.text = "Город: " + currentWeatherData.city;
    temperature.text = "Температура: " + (useCelsius ? currentWeatherData.temp + "°C" : currentWeatherData.tempF + "°F");
    description.text = "Описание: " + currentWeatherData.desc;
    humidity.text = "Влажность: " + currentWeatherData.humidity;
    wind.text = "Ветер: " + currentWeatherData.wind;
    weatherBlock.opacity = 1.0;
}

function showMessage(text, color) {
    errorMessage.text = text;
    errorMessage.color = color;
    errorMessage.visible = true;
    Qt.callLater(function() {
        errorMessage.visible = false;
    }, 3000);
}

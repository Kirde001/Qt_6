var forecastData = []

function fetchWeather(city) {
    // Dummy data for demonstration
    forecastData = [
        { date: "2025-05-12", temp: 15, tempF: 59, desc: "Облачно" },
        { date: "2025-05-13", temp: 17, tempF: 62.6, desc: "Солнечно" },
        { date: "2025-05-14", temp: 13, tempF: 55.4, desc: "Дождь" },
        { date: "2025-05-15", temp: 16, tempF: 60.8, desc: "Ясно" }
    ]

    forecastModel.clear()
    for (var i = 0; i < forecastData.length; i++) {
        forecastModel.append(forecastData[i])
    }
    forecastBlock.opacity = 1.0
}

function exportToCSV(fileUrl) {
    var csv = "Date,Temperature (C),Temperature (F),Description\n"
    for (var i = 0; i < forecastData.length; i++) {
        var row = forecastData[i]
        csv += `${row.date},${row.temp},${row.tempF},${row.desc}\n`
    }

    var file = Qt.openFileHandle(fileUrl, "w")
    if (file) {
        file.write(csv)
        file.close()
        console.log("CSV успешно экспортирован:", fileUrl)
    } else {
        console.log("Не удалось открыть файл для записи.")
    }
}

function importFromCSV(fileUrl) {
    var file = Qt.openFileHandle(fileUrl, "r")
    if (!file) {
        console.log("Не удалось открыть файл для чтения.")
        return
    }

    var text = file.readAll()
    file.close()

    var lines = text.split("\n")
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
}

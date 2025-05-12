import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Layouts 1.15
import QtCore
import Qt.labs.settings 1.0
import "WeatherFetcher.js" as WeatherFetcher

ApplicationWindow {
    visible: true
    width: 400
    height: 700
    title: qsTr("Погодный информатор")

    Settings {
        id: appSettings
        property string lastCity: ""
        property string tempUnit: "celsius"
    }

    property bool useCelsius: appSettings.tempUnit === "celsius"

FileDialog {
    id: saveDialog
    title: "Сохранить как CSV"
    nameFilters: ["CSV files (*.csv)"]
    fileMode: FileDialog.SaveFile
    defaultSuffix: "csv"
    folder: StandardPaths.writableLocation(StandardPaths.DocumentsLocation)
    onAccepted: {
        WeatherFetcher.exportToCSV(saveDialog.fileUrl)
    }
}

FileDialog {
    id: loadDialog
    title: "Открыть CSV файл"
    nameFilters: ["CSV files (*.csv)"]
    fileMode: FileDialog.OpenFile
    folder: StandardPaths.writableLocation(StandardPaths.DocumentsLocation)
    onAccepted: {
        WeatherFetcher.importFromCSV(loadDialog.fileUrl)
    }
}

    Rectangle {
        anchors.fill: parent
        color: "#f0f0f0"

        ColumnLayout {
            anchors.centerIn: parent
            spacing: 15
            width: parent.width * 0.9

            TextField {
                id: cityInput
                placeholderText: qsTr("Введите город")
                Layout.preferredWidth: 300
                font.pointSize: 16
                background: Rectangle {
                    color: "#ffffff"
                    radius: 5
                    border.color: "#cccccc"
                }
            }

            RowLayout {
                Layout.fillWidth: true
                spacing: 10

                Text {
                    text: qsTr("Единицы измерения:")
                    font.pointSize: 14
                    color: "#333"
                }

                Button {
                    text: qsTr("°C")
                    font.pointSize: 14
                    highlighted: useCelsius
                    onClicked: {
                        appSettings.tempUnit = "celsius"
                        if (cityInput.text) {
                            WeatherFetcher.fetchWeather(cityInput.text)
                        }
                    }
                    background: Rectangle {
                        color: useCelsius ? "#4caf50" : "#e0e0e0"
                        radius: 5
                    }
                }

                Button {
                    text: qsTr("°F")
                    font.pointSize: 14
                    highlighted: !useCelsius
                    onClicked: {
                        appSettings.tempUnit = "fahrenheit"
                        if (cityInput.text) {
                            WeatherFetcher.fetchWeather(cityInput.text)
                        }
                    }
                    background: Rectangle {
                        color: !useCelsius ? "#4caf50" : "#e0e0e0"
                        radius: 5
                    }
                }
            }

            Button {
                text: qsTr("Обновить погоду")
                font.pointSize: 16
                Layout.preferredWidth: 300
                background: Rectangle {
                    color: "#4caf50"
                    radius: 5
                }
                onClicked: {
                    WeatherFetcher.fetchWeather(cityInput.text)
                    appSettings.lastCity = cityInput.text
                }
            }

            RowLayout {
                spacing: 10
                Layout.alignment: Qt.AlignHCenter

                Button {
                    text: "Экспорт в CSV"
                    onClicked: saveDialog.open()
                }

                Button {
                    text: "Импорт из CSV"
                    onClicked: loadDialog.open()
                }
            }

            ColumnLayout {
                id: weatherBlock
                spacing: 10
                opacity: 0.0

                Behavior on opacity {
                    NumberAnimation { duration: 500 }
                }

                Text { id: cityName; text: qsTr("Город: -"); font.pointSize: 18; font.bold: true; color: "#333" }
                Text { id: temperature; text: qsTr("Температура: -"); font.pointSize: 18; color: "#ff5722"; font.bold: true }
                Text { id: description; text: qsTr("Описание: -"); font.pointSize: 14; color: "#757575" }
                Text { id: humidity; text: qsTr("Влажность: -"); font.pointSize: 14; color: "#757575" }
                Text { id: wind; text: qsTr("Ветер: -"); font.pointSize: 14; color: "#757575" }
            }

            ColumnLayout {
                id: forecastBlock
                spacing: 10
                opacity: 0.0
                Layout.fillWidth: true

                Behavior on opacity {
                    NumberAnimation { duration: 500 }
                }

                Text {
                    text: qsTr("Прогноз на 4 дня")
                    font.pointSize: 16
                    font.bold: true
                    color: "#333"
                    Layout.alignment: Qt.AlignHCenter
                }

                ListModel { id: forecastModel }

                ListView {
                    id: forecastView
                    Layout.fillWidth: true
                    Layout.preferredHeight: contentHeight
                    model: forecastModel
                    spacing: 5
                    clip: true

                    delegate: Rectangle {
                        width: forecastView.width
                        height: 60
                        color: "#ffffff"
                        radius: 5
                        border.color: "#cccccc"

                        RowLayout {
                            anchors.fill: parent
                            anchors.margins: 10
                            spacing: 10

                            Text { text: model.date; font.pointSize: 12; color: "#333"; Layout.preferredWidth: parent.width * 0.4; elide: Text.ElideRight }
                            Text { text: useCelsius ? model.temp + "°C" : model.tempF + "°F"; font.pointSize: 12; color: "#ff5722"; font.bold: true; Layout.preferredWidth: parent.width * 0.2 }
                            Text { text: model.desc; font.pointSize: 12; color: "#757575"; Layout.preferredWidth: parent.width * 0.4; elide: Text.ElideRight }
                        }
                    }
                }
            }

            Text {
                id: errorMessage
                color: "red"
                font.pointSize: 12
                wrapMode: Text.Wrap
                visible: false
                width: parent.width * 0.8
                horizontalAlignment: Text.AlignHCenter
            }
        }

        Component.onCompleted: {
            if (appSettings.lastCity !== "") {
                cityInput.text = appSettings.lastCity
                WeatherFetcher.fetchWeather(appSettings.lastCity)
            }
        }
    }
}

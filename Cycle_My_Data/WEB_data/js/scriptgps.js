
// シートIDと範囲の指定
const SPREADSHEET_ID = "XXXXX";
const RANGE = "XX";
const sheetEndpoint =
    `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=AIzaSyA9Ze_7LsgKU6i8HyFG28Oiqt4gy2eOZSg`;

// プルダウンデータの読み込み
const dateSelect = document.getElementById("date");
fetch(sheetEndpoint)
    .then(response => response.json())
    .then(data => {
        const rows = data.values;
        const dateValues = rows.slice(1).map(row => row[0]);
        dateValues.forEach(value => {
            const option = document.createElement("option");
            option.value = value;
            option.text = value;
            dateSelect.appendChild(option);
        });
    })
    .catch(error => console.error(error));

// 選択時MAPの切り替え
dateSelect.addEventListener("change", () => {
    const selectedDate = dateSelect.value;
    if (!selectedDate) return;

    fetch(sheetEndpoint)
        .then(response => response.json())
        .then(data => {
            const rows = data.values;
            const locationData = rows.filter(row => row[0] === selectedDate)[0];
            const lat = parseFloat(locationData[1]);
            const lng = parseFloat(locationData[2]);
            console.log(lat);
            console.log(lng);
            const map = new google.maps.Map(document.getElementById("map"), {
                center: {
                    lat: lat,
                    lng: lng
                },
                zoom: 15
            });
            const marker = new google.maps.Marker({
                position: {
                    lat: lat,
                    lng: lng
                },
                map: map,
                title: selectedDate
            });
        })
        .catch(error => console.error(error));
});


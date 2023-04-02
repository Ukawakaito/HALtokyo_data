
// シートIDと範囲の指定
const SPREADSHEET_ID = "XXXXX";
const RANGE = "XX";
const gps_1 = "";
const gps_2 = "";
const sheetEndpoint =
    `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=XXXXX`;

// プルダウンデータの読み込み
const dateSelect = document.getElementById("date");
const settext1 = document.getElementById("gps1");
const settext2 = document.getElementById("gps2");
const settext3 = document.getElementById("acce");
const settext4 = document.getElementById("temp");
const settext5 = document.getElementById("pres");
const settext6 = document.getElementById("alti");
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

// 選択時データの切り替え
dateSelect.addEventListener("change", () => {
    const selectedDate = dateSelect.value;
    if (!selectedDate) return;

    fetch(sheetEndpoint)
        .then(response => response.json())
        .then(data => {
            const rows = data.values;
            const locationData = rows.filter(row => row[0] === selectedDate)[0];
            const gps_1 = parseFloat(locationData[1]);
            const gps_2 = parseFloat(locationData[2]); 
            const acce_1 = parseFloat(locationData[8]);
            const temp_1 = parseFloat(locationData[10]); 
            const pres_1 = parseFloat(locationData[11]);
            const alti_1 = parseFloat(locationData[12]);
            console.log(gps_1);
            console.log(gps_2);


            settext1.textContent = gps_1;
            settext2.textContent = gps_2;
            settext3.textContent = acce_1+'m/s';
            settext4.textContent = temp_1+'%';
            settext5.textContent = pres_1+'hPa';
            settext6.textContent = alti_1+'m';


        

        })
        .catch(error => console.error(error));
});


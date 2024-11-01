const SPREADSHEET_ID = '17WauDCQFdEWkaWQTQdtVb_baaEY6unkoFOKQBHU1zUA';
const RANGE = 'Trang tính1!A2:D100';
const API_KEY = 'AIzaSyAdt8shqQItNOs-U6l4n_lmfjOHZhIoI2c';

const comp = "07:00:00";
const stuNum = 60;

let attend = 0;
let late = 0;
let absent = 0;

function getDataFromSheet() {
    const sheetUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${API_KEY}`;

    console.log(sheetUrl);

    fetch(sheetUrl)
        .then(response => response.json())
        .then(data => {
            console.log(data);

            if (data.values) {
                const rows = data.values;
                if (rows.length) {
                    rows.forEach(row => {
                        const timeVal = row[3]?.trim();
                        if (timeVal) {
                            if (timeVal <= comp) {
                                attend++;
                            } else {
                                late++;
                            }
                        }
                    });
                    absent = stuNum - late - attend;

                    document.getElementById('attendedStu').innerHTML = `<h3>${attend}</h3>`;
                    document.getElementById('lateStu').innerHTML = `<h3>${late}</h3>`;
                    document.getElementById('absentStu').innerHTML = `<h3>${absent}</h3>`;
                }
            }
        })
        .catch(error => {
            console.error('Error: ', error);
            document.getElementById('attendedStu').innerHTML = 'Không thể lấy dữ liệu: ' + error.message;
        });
}

document.addEventListener("DOMContentLoaded", getDataFromSheet);

function getNamesFromSheet() {
    const sheetUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${API_KEY}`;

    fetch(sheetUrl)
        .then(response => response.json())
        .then(data => {
            const rows = data.values;
            const nameListElement = document.getElementById('nameList');
            nameListElement.innerHTML = '';

            if (rows.length) {
                rows.forEach(row => {

                    const nameB = row[1] || 'Chưa có tên';
                    const nameC = row[2] || 'Chưa có tên';

                    const listItem = document.createElement('li');
                    listItem.textContent = `${nameB} - ${nameC}`;
                    nameListElement.appendChild(listItem);
                });
            }
        })
        .catch(error => {
            console.error('Error: ', error);
            document.getElementById('nameList').innerHTML = 'Không thể lấy dữ liệu: ' + error.message;
        });
}

document.addEventListener("DOMContentLoaded", getNamesFromSheet);

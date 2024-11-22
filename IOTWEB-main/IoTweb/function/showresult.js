const SPREADSHEET_ID = '1PfmnkHnWmpQnzte6_hbE78ZIppOOhmKabH8JY_-GC-8';
const ATTENDANCE_RANGE = 'Attendance!A2:F';
const USER_DATA_RANGE = 'User_Data!A2:A';
const API_KEY = 'AIzaSyAdt8shqQItNOs-U6l4n_lmfjOHZhIoI2c';

const comp = "14:00:00";

let attend = 0;
let late = 0;
let absent = 0;

// Hàm lấy số hàng trong bảng User_Data
function getStuNum() {
    const sheetUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${USER_DATA_RANGE}?key=${API_KEY}`;
    return fetch(sheetUrl)
        .then(response => response.json())
        .then(data => {
            if (data.values) {
                return data.values.length; // Trả về số hàng trong bảng User_Data
            }
            return 0; // Nếu không có dữ liệu, trả về 0
        })
        .catch(error => {
            console.error('Error fetching User_Data: ', error);
            return 0; // Trả về 0 nếu xảy ra lỗi
        });
}

function getDataFromSheet() {
    getStuNum().then(stuNum => {
        const sheetUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${ATTENDANCE_RANGE}?key=${API_KEY}`;

        fetch(sheetUrl)
            .then(response => response.json())
            .then(data => {
                console.log(data);

                if (data.values) {
                    const rows = data.values;

                    if (rows.length > 0) {
                        const firstScanMap = new Map(); // Dùng để lưu lần quét đầu tiên của mỗi sinh viên
                        rows.forEach(row => {
                            const studentID = row[0]?.trim(); // Giả sử cột đầu tiên là mã sinh viên
                            const timeVal = row[3]?.trim();

                            if (studentID && timeVal && !firstScanMap.has(studentID)) {
                                // Lưu lần quét đầu tiên cho mỗi sinh viên
                                firstScanMap.set(studentID, timeVal);

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
                console.error('Error fetching Attendance data: ', error);
                document.getElementById('attendedStu').innerHTML = 'Không thể lấy dữ liệu: ' + error.message;
            });
    });
}

document.addEventListener("DOMContentLoaded", getDataFromSheet);

function getNamesFromSheet() {
    const sheetUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${ATTENDANCE_RANGE}?key=${API_KEY}`;

    fetch(sheetUrl)
        .then(response => response.json())
        .then(data => {
            const rows = data.values;
            const nameListElement = document.getElementById('nameList');
            nameListElement.innerHTML = '';

            const uniqueItems = new Set();

            if (data.values) {
                if (rows.length) {
                    rows.forEach(row => {
                        const msv = row[5];
                        const name = row[0];
                        const itemKey = `${msv} - ${name}`;
                        uniqueItems.add(itemKey);
                    });

                    const sortedItems = Array.from(uniqueItems).sort();

                    sortedItems.forEach(item => {
                        const listItem = document.createElement('li');
                        listItem.textContent = item;
                        nameListElement.appendChild(listItem);
                    });
                }
            }
        })
        .catch(error => {
            console.error('Error: ', error);
            document.getElementById('nameList').innerHTML = 'Không thể lấy dữ liệu: ' + error.message;
        });
}

document.addEventListener("DOMContentLoaded", getNamesFromSheet);

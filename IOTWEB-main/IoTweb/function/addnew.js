const SPREADSHEET_ID = '1PfmnkHnWmpQnzte6_hbE78ZIppOOhmKabH8JY_-GC-8';
const USER_DATA_RANGE = 'User_Data!A2:D100';
const API_KEY = 'AIzaSyAdt8shqQItNOs-U6l4n_lmfjOHZhIoI2c';

const btnAddUser = document.querySelector(".btnAddUser");

async function addNewUser(name, uid, note, msv) {
    const sheetUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${USER_DATA_RANGE}:append?valueInputOption=USER_ENTERED&key=${API_KEY}`;

    const data = {
        values: [
            [name, uid, note, msv]
        ]
    };

    try {
        const res = await fetch(sheetUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (res.ok) {
            alert('Dữ liệu đã được thêm vào dòng trống tiếp theo!');
        } else {
            const errorData = await res.json();
            console.error('Lỗi khi gửi dữ liệu:', errorData);
            alert('Có lỗi xảy ra khi thêm dữ liệu.');
        }
    } catch (error) {
        console.error('Lỗi kết nối:', error);
        alert('Có lỗi xảy ra khi kết nối với Google Sheets.');
    }
}

document.addEventListener("DOMContentLoaded", () => {
    btnAddUser.addEventListener("click", () => {
        const name = document.getElementById("stuName").value;
        const uid = document.getElementById("stuUID").value;
        const msv = document.getElementById("stuMSV").value;

        if (name && uid && msv) {
            addNewUser(name, uid, "UID has been registered in this row", msv);
        } else {
            alert("Vui lòng điền đủ thông tin!");
        }
    });
});

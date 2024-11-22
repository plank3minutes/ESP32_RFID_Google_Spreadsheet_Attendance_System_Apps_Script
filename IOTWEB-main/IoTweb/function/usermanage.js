const btnAdd = document.querySelector(".btnAdd");

btnAdd.addEventListener("click", (e) => {
    window.location.href = "../addview/addnew.html";
});

const SPREADSHEET_ID = '1RmXKr_6_ZiTzwT2YEVGmr89zPHdB7vForOzhWmWj_cs';
const RANGE = 'User_Data!A:D';
const API_KEY = 'AIzaSyAdt8shqQItNOs-U6l4n_lmfjOHZhIoI2c';

async function fetchUserData() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        displayUserData(data.values);
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu từ Google Sheets:', error);
    }
}

function displayUserData(rows) {
    const tableBody = document.getElementById('userTable').querySelector('tbody');
    tableBody.innerHTML = '';  // Xóa các hàng cũ nếu có

    rows.slice(1).forEach(row => {  // Bỏ qua dòng đầu tiên (tiêu đề)
        const [name, uid, , msv] = row;

        const tr = document.createElement('tr');

        // Cột MSV
        const msvTd = document.createElement('td');
        msvTd.textContent = msv;
        tr.appendChild(msvTd);

        // Cột Name
        const nameTd = document.createElement('td');
        nameTd.textContent = name;
        tr.appendChild(nameTd);

        // Cột UID
        const uidTd = document.createElement('td');
        uidTd.textContent = uid;
        tr.appendChild(uidTd);

        // Cột Actions
        const actionsTd = document.createElement('td');

        // Nút Edit
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.classList.add('edit-btn');
        editButton.onclick = () => editUser(msv, name, uid);
        actionsTd.appendChild(editButton);

        // Nút Delete
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('delete-btn');
        deleteButton.onclick = () => deleteUser(msv);
        actionsTd.appendChild(deleteButton);

        tr.appendChild(actionsTd);

        tableBody.appendChild(tr);
    });
}

function editUser(msv, name, uid) {
    
}

function deleteUser(msv) {
    if (confirm(`Bạn có chắc chắn muốn xóa user với MSV: ${msv}?`)) {
        alert(`Xóa user với MSV: ${msv}`);
        // Thêm mã xử lý xóa tại đây
    }
}

// Gọi hàm lấy dữ liệu khi tải trang
fetchUserData();
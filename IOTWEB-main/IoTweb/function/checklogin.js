const inputUsername = document.querySelector(".username");
const inputPassword = document.querySelector(".password");
const btnLogin = document.querySelector(".btnLogin");

// validation form login

btnLogin.addEventListener("click", (e) => {
    e.preventDefault();
    if (inputUsername.value === "" || inputPassword.value === "") {
        alert("vui lòng không để trống");
    } else {
        const user = JSON.parse(localStorage.getItem(inputUsername.value));
        if (
            "admin" === inputUsername.value &&
            "123456" === inputPassword.value
        ) {
            //alert("Đăng Nhập Thành Công");
            window.location.href = "../homeview/homeview.html";
        } else {
            alert("Đăng Nhập Thất Bại");
        }
    }
});
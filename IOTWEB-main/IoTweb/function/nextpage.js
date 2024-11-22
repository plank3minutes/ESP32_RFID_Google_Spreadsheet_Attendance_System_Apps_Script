const btnResult = document.querySelector(".btnresult");
const btnUser = document.querySelector(".btnshowuser");

btnResult.addEventListener("click", (e) => {
    window.location.href = "../resultview/resultview.html";
});

btnUser.addEventListener("click", (e) => {
   window.location.href = "../userview/userview.html";
});
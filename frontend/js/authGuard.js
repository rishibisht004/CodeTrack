const currentPage = window.location.pathname.split("/").pop();

const loggedInUser = localStorage.getItem("codeTrackUser");

const publicPages = [
    "",
    "index.html",
    "login.html",
    "register.html"
];

if (!loggedInUser && !publicPages.includes(currentPage)) {
    window.location.href = "login.html";
}

if (
    loggedInUser &&
    (currentPage === "login.html" ||
     currentPage === "register.html")
) {
    window.location.href = "dashboard.html";
}
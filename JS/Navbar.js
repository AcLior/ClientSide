$(document).ready(function () {
    $("#navbar-placeholder").load("../Html/navbar.html", function () {
        const user = JSON.parse(localStorage.getItem("loggedInUser"));
        const greeting = $("#userGreeting");
        const logoutBtn = $("#logoutBtn");
        const editBtn = $("#editProfileBtn");


        if (user && user.name) {
            greeting.text(`👋 Hello, ${user.name}`);
            logoutBtn.show();
            editBtn.show();
        } else {
            greeting.text("🎟 Guest Mode");
            logoutBtn.hide();
            editBtn.hide();
        }

        logoutBtn.on("click", function () {
            localStorage.removeItem("loggedInUser");
            window.location.href = "menu.html";
        });
        editBtn.on("click", () => {
            window.location.href = "EditProfile.html";

        });
    });
});

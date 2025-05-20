(function () {
    const publicPages = ["Index.html", "", "Menu.html"];
    const currentPage = window.location.pathname.split("/").pop();

    const user = JSON.parse(localStorage.getItem("loggedInUser"));

    // אם אין משתמש בכלל, או שהוא לא פעיל – שלח ל־Menu.html
    if (!user || user.active === false) {
        localStorage.removeItem("loggedInUser");
        localStorage.removeItem("userId");
        if (!publicPages.includes(currentPage)) {
            window.location.href = "Menu.html";
        }
    }
})();

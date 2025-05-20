$(document).ready(function () {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    if (!loggedInUser) {
        alert("🛑 No user logged in. Redirecting...");
        window.location.href = "Menu.html";
        return;
    }

    // ממלא את השדות
    $("#editName").val(loggedInUser.name);
    $("#editEmail").val(loggedInUser.email);
    $("#editPassword").val("");

    $("#editProfileForm").on("submit", function (e) {
        e.preventDefault();

        const name = $("#editName").val().trim();
        const email = $("#editEmail").val().trim();
        const password = $("#editPassword").val().trim();

        // אימותים בסיסיים
        const nameRegex = /^[A-Za-z]{2,}$/;
        if (!nameRegex.test(name)) {
            alert("❌ Name must be at least 2 letters and contain only letters.");
            return;
        }

        const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (password.length > 0 && !passwordRegex.test(password)) {
            alert("❌ Password must be at least 8 characters, include uppercase and number.");
            return;
        }

        const updatedUser = {
            id: loggedInUser.id,
            name: name,
            email: email,
            password: password.length > 0 ? password : loggedInUser.password,
            active: true
        };

        const apiUrl = `https://proj.ruppin.ac.il/cgroup8/test2/tar1/api/Users/${updatedUser.id}`;
        ajaxCall("PUT", apiUrl, JSON.stringify(updatedUser),
            function (serverUser) { // ✨ נקבל מהשרת את המשתמש המעודכן
                alert("✅ Profile updated successfully!");
                localStorage.setItem("loggedInUser", JSON.stringify(serverUser)); // ❗ שומר את המשתמש מהשרת, לא את מה שהמשתמש הקליד
                window.location.href = "Index.html";
            },
            function () {
                alert("❌ Failed to update profile.");
            }
        );

    });
});

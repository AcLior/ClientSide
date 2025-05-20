$(document).ready(function () {
    // החלפת טפסים
    window.toggleForms = function (view) {
        $("#loginDiv, #registerDiv, #loggedInDiv").hide();
        $("#googleBtnContainer").hide();

        if (view === "login") {
            $("#loginDiv").show();
            $("#googleBtnContainer").show();
        } else if (view === "register") {
            $("#registerDiv").show();
        } else if (view === "loggedIn") {
            $("#loggedInDiv").show();
        }
    };

    // לוגין
    $("#loginForm").on("submit", function (e) {
        e.preventDefault();

        const email = $("#loginEmail").val().trim();
        const password = $("#loginPassword").val().trim();
        const loginData = { email, password };

        ajaxCall("POST", "https://proj.ruppin.ac.il/cgroup8/test2/tar1/api/Users/login", JSON.stringify(loginData),
            function (serverUser) {
                if (!serverUser.active) {
                    alert("⛔ Your account is inactive. Please contact the admin.");
                    return;
                }
                localStorage.setItem("loggedInUser", JSON.stringify(serverUser));
                localStorage.setItem("userId", serverUser.id);
                window.location.href = "Index.html";
            },
            function () {
                alert("❌ Incorrect email or password.");
            }
        );
    });

    // הרשמה
    $("#registerForm").on("submit", function (e) {
        e.preventDefault();

        const name = $("#regName").val().trim();
        const email = $("#regEmail").val().trim();
        const password = $("#regPassword").val().trim();

        const nameRegex = /^[A-Za-z]{2,}$/;
        if (!nameRegex.test(name)) {
            alert("❌ Name must be at least 2 letters and contain only letters.");
            return;
        }

        const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
            alert("❌ Password must be at least 8 characters, include uppercase and number.");
            return;
        }

        const newUser = { name, email, password, active: true };

        ajaxCall("POST", "https://proj.ruppin.ac.il/cgroup8/test2/tar1/api/Users/register", JSON.stringify(newUser),
            function () {
                // לאחר רישום, נבצע login
                ajaxCall("POST", "https://proj.ruppin.ac.il/cgroup8/test2/tar1/api/Users/login", JSON.stringify(newUser),
                    function (serverUser) {
                        if (!serverUser.active) {
                            alert("⛔ Your account is inactive. Please contact the admin.");
                            return;
                        }
                        localStorage.setItem("loggedInUser", JSON.stringify(serverUser));
                        localStorage.setItem("userId", serverUser.id);
                        window.location.href = "Index.html";
                    },
                    function () {
                        alert("⚠️ Registered, but login failed.");
                    }
                );
            },
            function () {
                alert("❌ Registration failed. Email might already be used.");
            }
        );
    });

    // התנתקות
    window.logout = function () {
        localStorage.removeItem("loggedInUser");
        localStorage.removeItem("userId");
        toggleForms("login");
    };

    // התחברות עם גוגל
    window.handleGoogleLogin = function (response) {
        const idToken = response.credential;
        const userInfo = parseJwt(idToken);

        const user = {
            name: userInfo.name || "GoogleUser",
            email: userInfo.email,
            password: "google",
            active: true
        };

        ajaxCall("POST", "https://proj.ruppin.ac.il/cgroup8/test2/tar1/api/Users/register", JSON.stringify(user),
            function () {
                // אחרי רישום ננסה להתחבר
                ajaxCall("POST", "https://proj.ruppin.ac.il/cgroup8/test2/tar1/api/Users/login", JSON.stringify(user),
                    function (serverUser) {
                        if (!serverUser.active) {
                            alert("⛔ Your account is inactive. Please contact the admin.");
                            return;
                        }
                        localStorage.setItem("loggedInUser", JSON.stringify(serverUser));
                        localStorage.setItem("userId", serverUser.id);
                        window.location.href = "Index.html";
                    },
                    function () {
                        alert("⚠️ Google login failed after registration.");
                    }
                );
            },
            function () {
                // אם המשתמש כבר קיים – נבצע login
                ajaxCall("POST", "https://proj.ruppin.ac.il/cgroup8/test2/tar1/api/Users/login", JSON.stringify(user),
                    function (serverUser) {
                        if (!serverUser.active) {
                            alert("⛔ Your account is inactive. Please contact the admin.");
                            return;
                        }
                        localStorage.setItem("loggedInUser", JSON.stringify(serverUser));
                        localStorage.setItem("userId", serverUser.id);
                        window.location.href = "Index.html";
                    },
                    function () {
                        alert("❌ Google login failed.");
                    }
                );
            }
        );
    };

    // פענוח טוקן של גוגל
    function parseJwt(token) {
        const base64Url = token.split('.')[1];
        const base64 = atob(base64Url);
        return JSON.parse(decodeURIComponent(escape(base64)));
    }

    // טופס התחברות כברירת מחדל
    toggleForms("login");
});

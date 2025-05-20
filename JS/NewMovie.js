$(document).ready(function () {

    $("#movieForm").on("submit", function (e) {
        e.preventDefault();
        $("input").removeClass("invalid");

        const movie = {
            url: $("#url").val().trim(),
            primaryTitle: $("#primaryTitle").val().trim(),
            description: $("#description").val().trim(),
            primaryImage: $("#primaryImage").val().trim(),
            year: parseInt($("#year").val()),
            releaseDate: $("#releaseDate").val(),
            language: $("#language").val().trim(),
            budget: parseFloat($("#budget").val()),
            grossWorldWide: parseFloat($("#grossWorldwide").val()) || 0,
            genres: $("#genres").val().trim(),
            isAdult: $("#isAdult").is(":checked"),
            runtimeMinutes: parseInt($("#runtimeMinutes").val()),
            averageRating: 0,
            numVotes: 0,
            priceToRent: Math.floor(Math.random() * 21) + 10, //  מחיר רנדומלי בין 10 ל-30
            
        };

        let isValid = true;
        let messages = [];
        const currentYear = new Date().getFullYear();

        // Validation
        if (!movie.primaryTitle) {
            isValid = markInvalid("#primaryTitle");
            messages.push("Primary Title is required.");
        }

        if (!movie.primaryImage || !isValidURL(movie.primaryImage)) {
            isValid = markInvalid("#primaryImage");
            messages.push("Primary Image must be a valid URL.");
        }

        if (!movie.year || isNaN(movie.year) || movie.year < 1800 || movie.year > currentYear) {
            isValid = markInvalid("#year");
            messages.push(`Year must be between 1800 and ${currentYear}.`);
        }

        if (!movie.releaseDate) {
            isValid = markInvalid("#releaseDate");
            messages.push("Release Date is required.");
        } else {
            const releaseDateObj = new Date(movie.releaseDate);
            if (releaseDateObj > new Date()) {
                isValid = markInvalid("#releaseDate");
                messages.push("Release Date cannot be in the future.");
            }
        }

        if (!movie.language) {
            isValid = markInvalid("#language");
            messages.push("Language is required.");
        }

        if (!movie.runtimeMinutes || isNaN(movie.runtimeMinutes) || movie.runtimeMinutes <= 0) {
            isValid = markInvalid("#runtimeMinutes");
            messages.push("Runtime Minutes must be a positive number.");
        }
        
        if (movie.budget < 100000 || isNaN(movie.budget)) {
            isValid = markInvalid("#budget");
            messages.push("Budget must be at least 100,000.");
        }

        if (!movie.genres) {
            isValid = markInvalid("#genres");
            messages.push("Genres are required.");
        }

        if (!isValid) {
            alert("❌ Please fix the following issues:\n\n" + messages.join("\n"));
            return;
        }

        // ✅ Submit to server
        ajaxCall(
            "POST",
            "https://proj.ruppin.ac.il/cgroup8/test2/tar1/api/Movies",
            JSON.stringify(movie),
            function () {
                alert("✅ Movie added successfully!");
                $("#movieForm")[0].reset(); // Clear form
            },
            function () {
                alert("❌ Failed to add movie.");
            }
        );
    });

    function markInvalid(selector) {
        $(selector).addClass("invalid");
        return false;
    }

    function isValidURL(str) {
        try {
            new URL(str);
            return true;
        } catch {
            return false;
        }
    }
});

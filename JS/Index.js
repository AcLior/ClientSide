let currentPage = 1;
const pageSize = 9;
let selectedMovie = null;

$(document).ready(function () {
    loadMovies();

    $("#applyFiltersBtn").on("click", function () {
        currentPage = 1;
        loadMovies();
    });

    $("#clearBtn").on("click", function () {
        $("#titleFilter").val("");
        $("#startDate").val("");
        $("#endDate").val("");
        currentPage = 1;
        loadMovies();
    });

    $("#nextPageBtn").on("click", function () {
        currentPage++;
        loadMovies();
    });

    $("#prevPageBtn").on("click", function () {
        if (currentPage > 1) {
            currentPage--;
            loadMovies();
        }
    });

    // סגירת מודאל
    $(".close").on("click", function () {
        $("#rentModal").fadeOut();
    });

    // חישוב מחיר בעת שינוי תאריכים
    $("#rentStartDate, #rentEndDate").on("change", function () {
        const start = new Date($("#rentStartDate").val());
        const end = new Date($("#rentEndDate").val());

        if (!isNaN(start) && !isNaN(end) && end >= start) {
            const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
            const total = days * selectedMovie.priceToRent;
            $("#totalPrice").text(total.toFixed(2));
        } else {
            $("#totalPrice").text("0");
        }
    });

    // שליחת בקשת השכרה
    $("#confirmRentBtn").on("click", function () {
        const userId = JSON.parse(localStorage.getItem("userId"));

        if (!userId) {
            alert("You must be logged in to rent.");
            window.location.href = "Menu.html";
            return;
        }

        const rentStart = $("#rentStartDate").val();
        const rentEnd = $("#rentEndDate").val();
        const totalPrice = parseFloat($("#totalPrice").text());

        const today = new Date();
        today.setHours(0, 0, 0, 0); // מנקה את השעה לצורך השוואת תאריכים
        const startDate = new Date(rentStart);
        startDate.setHours(0, 0, 0, 0);

        if (startDate < today) {
            alert("❌ Start date cannot be in the past.");
            return;
        }

        if (!rentStart || !rentEnd || totalPrice === 0) {
            alert("Please fill valid dates.");
            return;
        }

        const rentData = {
            userId: parseInt(userId),
            movieId: selectedMovie.id,
            rentStart,
            rentEnd,
            totalPrice
        };

        ajaxCall("POST", "https://proj.ruppin.ac.il/cgroup8/test2/tar1/api/Movies/rent", JSON.stringify(rentData),
            function () {
                alert("🎉 Movie rented!");
                $("#rentModal").fadeOut();
            },
            function () {
                alert("❌ Failed to rent movie.");
            });
    });

});

function loadMovies() {
    const title = $("#titleFilter").val();
    const startDate = $("#startDate").val();
    const endDate = $("#endDate").val();

    const query = new URLSearchParams({
        page: currentPage,
        pageSize: pageSize,
        title: title || "",
        startDate: startDate || "",
        endDate: endDate || ""
    });

    ajaxCall(
        "GET",
        `https://proj.ruppin.ac.il/cgroup8/test2/tar1/api/Movies/filter?${query.toString()}`,
        null,
        renderMovies,
        function () {
            alert("❌ Failed to load movies.");
        }
    );
}

function renderMovies(response) {
    const movies = response.movies;
    const totalCount = response.totalCount;
    const container = $("#movies-container");
    container.empty();
    $("#pageNumber").text(currentPage);

    if (!movies || movies.length === 0) {
        container.append("<p>No movies found.</p>");
        $("#nextPageBtn").hide();
        return;
    }

    movies.forEach((movie) => {
        const card = $(`
            <div class="movie-card">
                <img src="${movie.primaryImage}" alt="${movie.primaryTitle}" />
                <div class="movie-details">
                    <h3>${movie.primaryTitle}</h3>
                    <p><strong>Genres:</strong> ${movie.genres}</p>
                    <p><strong>Release Date:</strong> ${movie.releaseDate?.split("T")[0]}</p>
                    <p><strong>Language:</strong> ${movie.language}</p>
                    <p><strong>Runtime:</strong> ${movie.runtimeMinutes} minutes</p>
                    <p><strong>Rating:</strong> ${movie.averageRating} ⭐ (${movie.numVotes} votes)</p>
                    <p class="description">${movie.description}</p>
                    <button class="rent-btn">Rent me</button>
                </div>
            </div>
        `);

        card.find(".rent-btn").on("click", function () {
            openRentModal(movie);
        });

        container.append(card);
    });

    const totalPages = Math.ceil(totalCount / pageSize);

    if (currentPage >= totalPages) {
        $("#nextPageBtn").hide();
    } else {
        $("#nextPageBtn").show();
    }

    if (currentPage <= 1) {
        $("#prevPageBtn").hide();
    } else {
        $("#prevPageBtn").show();
    }
}

function openRentModal(movie) {
    selectedMovie = movie;
    $("#rentMovieTitle").text(movie.primaryTitle);

    const today = new Date().toISOString().split("T")[0];
    $("#rentStartDate").val("").attr("min", today);
    $("#rentEndDate").val("").attr("min", today);
    $("#totalPrice").text("0");

    $("#rentModal").fadeIn();
}

let allTitles = [];
let selectedMovieId = null;
let rentMovieId = null;
let rentPricePerDay = 0;

$(document).ready(function () {
    loadMyMovies();

    $("#closeTransfer").on("click", () => $("#transferModal").fadeOut());
    $("#closeRent").on("click", () => $("#rentModal").fadeOut());

    $("#confirmTransferBtn").on("click", () => {
        const newUserId = $("#userSelect").val();
        if (newUserId && selectedMovieId) {
            transferMovie(selectedMovieId, newUserId);
            $("#transferModal").fadeOut();
        } else {
            alert("Please select a user.");
        }
    });

    $("#confirmRentBtn").on("click", () => {
        const start = $("#rentStart").val();
        const end = $("#rentEnd").val();

        if (!isValidRentalDates(start, end)) {
            alert("❌ Invalid dates. Rent must start today and end within 14 days.");
            return;
        }

        const user = JSON.parse(localStorage.getItem("loggedInUser"));
        const days = (new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24);
        const totalPrice = days * rentPricePerDay;

        const rentObj = {
            userId: user.id,
            movieId: rentMovieId,
            rentStart: start,
            rentEnd: end,
            totalPrice
        };
        console.log(rentObj);

        ajaxCall("POST", "https://proj.ruppin.ac.il/cgroup8/test2/tar1/api/Movies/rent", JSON.stringify(rentObj),
            () => {
                alert("✅ Movie rented!");
                $("#rentModal").fadeOut();
                loadMyMovies();
            },
            () => {
                alert("❌ You already have this movie rented.");
            });

    });

    $("#rentStart, #rentEnd").on("change", updateTotalPrice);
});

function loadMyMovies() {
    const userId = localStorage.getItem("userId");
    if (!userId) {
        alert("You must be logged in.");
        return;
    }

    ajaxCall("GET", `https://proj.ruppin.ac.il/cgroup8/test2/tar1/api/Movies/rented/${userId}`, null,
        movies => {
            renderMovies(movies);
            allTitles = movies.map(m => m.primaryTitle);
            $("#titleFilter").autocomplete({ source: allTitles });
        },
        () => alert("No currently rented movies found."));
}

function renderMovies(movies) {
    const container = $("#my-movies-container");
    container.empty();

    if (!movies || movies.length === 0) {
        container.append(`<p class="no-rentals">📭 You currently have no active rentals.</p>`);
        return;
    }

    movies.forEach(movie => {
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
                    <button class="delete-btn">DELETE</button>
                    <button class="transfer-btn">TRANSFER</button>
                </div>
            </div>
        `);

        card.find(".delete-btn").on("click", () => deleteMovie(movie.id));
        card.find(".transfer-btn").on("click", () => {
            selectedMovieId = movie.id;
            loadUsers();
            $("#transferModal").fadeIn();
        });

        container.append(card);
    });
}

function loadUsers() {
    const userId = localStorage.getItem("userId");
    ajaxCall("GET", `https://proj.ruppin.ac.il/cgroup8/test2/tar1/api/Users/AllActive?currentUserId=${userId}`,
        null,
        users => {
            const select = $("#userSelect").empty();
            select.append(`<option disabled selected>Select user</option>`);
            users.forEach(user => {
                select.append(`<option value="${user.id}">${user.name} (Email: ${user.email})</option>`);
            });
        },
        () => alert("Failed to load users list."));
}

function deleteMovie(id) {
    ajaxCall("DELETE", `https://proj.ruppin.ac.il/cgroup8/test2/tar1/api/Movies/${id}`, null,
        () => {
            alert("Movie deleted successfully!");
            location.reload();
        },
        () => alert("Failed to delete movie."));
}


function transferMovie(movieId, newUserId) {
    const fromUserId = localStorage.getItem("userId");
    const data = { fromUserId: parseInt(fromUserId), toUserId: parseInt(newUserId), movieId };

    ajaxCall("POST", "https://proj.ruppin.ac.il/cgroup8/test2/tar1/api/Movies/transfer", JSON.stringify(data),
        () => {
            alert("Movie transferred successfully!");
            location.reload();
        },
        () => alert("Failed to transfer movie."));
}

function openRentModal(movieId, pricePerDay) {
    rentMovieId = movieId;
    rentPricePerDay = pricePerDay;

    const today = new Date().toISOString().split("T")[0];
    const maxDate = new Date();
    maxDate.setDate(new Date().getDate() + 14);
    const maxStr = maxDate.toISOString().split("T")[0];

    $("#rentStart, #rentEnd").val("").attr("min", today).attr("max", maxStr);
    $("#totalPrice").text("₪0");
    $("#rentModal").fadeIn();
}

function updateTotalPrice() {
    const start = new Date($("#rentStart").val());
    const end = new Date($("#rentEnd").val());
    const days = (end - start) / (1000 * 60 * 60 * 24);
    $("#totalPrice").text(isNaN(days) || days <= 0 ? "₪0" : `₪${(days * rentPricePerDay).toFixed(2)}`);
}

function isValidRentalDates(startStr, endStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // לנטרל את השעה

    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 14);

    const start = new Date(startStr);
    const end = new Date(endStr);

    return (
        !isNaN(start) &&
        !isNaN(end) &&
        start >= today &&
        end > start &&
        end <= maxDate
    );
}


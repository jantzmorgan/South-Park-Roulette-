// =========================
// 1. HTML ELEMENTS
// =========================

const pickBtn = document.getElementById("pickBtn");
const result = document.getElementById("result");

const classicMode = document.getElementById("classicMode");

const saveBtn = document.getElementById("saveBtn");
const paramountBtn = document.getElementById("paramountBtn");

const favoritesList = document.getElementById("favoritesList");
const recentList = document.getElementById("recentList");

const sortRatingBtn = document.getElementById("sortRatingBtn");
const sortSeasonBtn = document.getElementById("sortSeasonBtn");

const allEpisodesList = document.getElementById("allEpisodesList");

const episodeSearchInput = document.getElementById("episodeSearchInput");
const seasonFilterSelect = document.getElementById("seasonFilterSelect");
const clearFiltersBtn = document.getElementById("clearFiltersBtn");

const episodeCountText = document.getElementById("episodeCountText");


// =========================
// 2. APP DATA
// =========================

const SHEET_URL =
	"https://docs.google.com/spreadsheets/d/e/2PACX-1vToO6SuAuBCuix_uCVVaCA64RMSFrxYRcIIP06bgahJTIdQUNzY-dokfWG57zN-kg8JG-RuJ4sf1OZg/pub?output=csv";

let episodes = [];
let currentEpisode = null;

let favorites =
	JSON.parse(localStorage.getItem("favorites")) || [];

let recentEpisodes =
	JSON.parse(localStorage.getItem("recentEpisodes")) || [];


// =========================
// 3. EVENT LISTENERS
// =========================

pickBtn.addEventListener("click", pickEpisode);

saveBtn.addEventListener("click", saveFavorite);

paramountBtn.addEventListener("click", openCurrentEpisode);

sortRatingBtn.addEventListener("click", sortFavoritesByRating);

sortSeasonBtn.addEventListener("click", sortFavoritesBySeason);

episodeSearchInput.addEventListener("input", renderEpisodeLibrary);

seasonFilterSelect.addEventListener("change", renderEpisodeLibrary);

clearFiltersBtn.addEventListener("click", clearFilters);


// =========================
// 4. RANDOM EPISODE PICKER
// =========================

function pickEpisode() {

	if (episodes.length === 0) {
		result.innerHTML = "Loading episodes...";
		return;
	}

	let availableEpisodes = episodes;

	if (classicMode.checked) {
		availableEpisodes =
			episodes.filter(episode => episode.season <= 8);
	}

	if (availableEpisodes.length === 0) {
		result.innerHTML = "No episodes found.";
		return;
	}

	const randomIndex =
		Math.floor(Math.random() * availableEpisodes.length);

	const episode = availableEpisodes[randomIndex];

	selectEpisode(episode);
}


// =========================
// 5. SELECT EPISODE
// =========================

function selectEpisode(episode) {

	currentEpisode = episode;

	result.innerHTML = `
		<div>
			<div>
				Season ${episode.season},
				Episode ${episode.number}
			</div>

			<br>

			<strong>
				${cleanTitle(episode.name)}
			</strong>
		</div>
	`;

	paramountBtn.textContent =
		`Open S${episode.season}E${episode.number}`;

	addRecentEpisode(episode);

	scrollToTopSmooth();
}


// =========================
// 6. OPEN CURRENT EPISODE
// =========================

function openCurrentEpisode() {

	if (!currentEpisode || !currentEpisode.driveUrl) {

		result.innerHTML =
			"No Drive link found for this episode.";

		return;
	}

	window.location.href =
		currentEpisode.driveUrl.trim();
}


// =========================
// 7. FAVORITES
// =========================

function saveFavorite() {

	if (!currentEpisode) {

		result.innerHTML =
			"Pick an episode first.";

		return;
	}

	const alreadySaved =
		favorites.some(
			episode => episode.id === currentEpisode.id
		);

	if (alreadySaved) {

		result.innerHTML =
			"This episode is already saved.";

		return;
	}

	favorites.push({
		id: currentEpisode.id,
		name: currentEpisode.name,
		season: currentEpisode.season,
		number: currentEpisode.number,
		driveUrl: currentEpisode.driveUrl,
		rating: 0,
		goat: false
	});

	saveFavorites();

	renderFavorites();
}


// =========================
// 8. RENDER FAVORITES
// =========================

function renderFavorites() {

	favoritesList.innerHTML = "";

	if (favorites.length === 0) {

		favoritesList.innerHTML = `
			<div class="recent-card">
				No favorites yet.
			</div>
		`;

		return;
	}

	favorites.forEach((episode, index) => {

		const card =
			document.createElement("div");

		card.className = "favorite-card";

		card.innerHTML = `
			<h3>
				${cleanTitle(episode.name)}
			</h3>

			<p>
				Season ${episode.season},
				Episode ${episode.number}
			</p>

			<div class="stars">
				${createStarButtons(episode, index)}
			</div>

			<button
				class="goat-btn
				${episode.goat ? "goat-active" : ""}"

				onclick="toggleGoat(${index})"
			>
				GOAT
			</button>

			<div class="favorite-actions">

				<button
					class="open-fav-btn"
					onclick="openFavorite(${index})"
				>
					Open
				</button>

				<button
					class="remove-btn"
					onclick="removeFavorite(${index})"
				>
					Remove
				</button>

			</div>
		`;

		favoritesList.appendChild(card);
	});
}


// =========================
// 9. STAR BUTTONS
// =========================

function createStarButtons(episode, index) {

	return [1, 2, 3, 4, 5]
		.map(number => {

			const star =
				number <= episode.rating ?
				"⭐" :
				"☆";

			return `
				<button
					onclick="rateEpisode(${index}, ${number})"
				>
					${star}
				</button>
			`;

		})
		.join("");
}


// =========================
// 10. FAVORITE ACTIONS
// =========================

function openFavorite(index) {

	const episode = favorites[index];

	if (!episode || !episode.driveUrl) {
		return;
	}

	window.location.href =
		episode.driveUrl.trim();
}

function removeFavorite(index) {

	favorites.splice(index, 1);

	saveFavorites();

	renderFavorites();
}

function rateEpisode(index, rating) {

	favorites[index].rating = rating;

	saveFavorites();

	renderFavorites();
}

function toggleGoat(index) {

	favorites[index].goat = !favorites[index].goat;

	saveFavorites();

	renderFavorites();
}

function saveFavorites() {

	localStorage.setItem(
		"favorites",
		JSON.stringify(favorites)
	);
}


// =========================
// 11. RECENT EPISODES
// =========================

function addRecentEpisode(episode) {

	recentEpisodes =
		recentEpisodes.filter(
			item => item.id !== episode.id
		);

	recentEpisodes.unshift({
		id: episode.id,
		name: episode.name,
		season: episode.season,
		number: episode.number,
		driveUrl: episode.driveUrl
	});

	recentEpisodes =
		recentEpisodes.slice(0, 10);

	saveRecentEpisodes();

	renderRecentEpisodes();
}

function renderRecentEpisodes() {

	recentList.innerHTML = "";

	if (recentEpisodes.length === 0) {

		recentList.innerHTML = `
			<div class="recent-card">
				No recently picked episodes.
			</div>
		`;

		return;
	}

	recentEpisodes.forEach(episode => {

		const card =
			document.createElement("div");

		card.className = "recent-card";

		card.innerHTML = `
			<strong>
				${cleanTitle(episode.name)}
			</strong>

			<br><br>

			Season ${episode.season},
			Episode ${episode.number}
		`;

		card.addEventListener(
			"click",
			function() {

				card.classList.add("tap-bounce");

				setTimeout(function() {
					card.classList.remove("tap-bounce");
				}, 250);

				selectEpisode(episode);
			}
		);

		recentList.appendChild(card);
	});
}

function saveRecentEpisodes() {

	localStorage.setItem(
		"recentEpisodes",
		JSON.stringify(recentEpisodes)
	);
}


// =========================
// 12. SORT FAVORITES
// =========================

function sortFavoritesByRating() {

	favorites.sort(function(a, b) {

		if (b.goat !== a.goat) {
			return Number(b.goat) - Number(a.goat);
		}

		return b.rating - a.rating;
	});

	saveFavorites();

	renderFavorites();
}

function sortFavoritesBySeason() {

	favorites.sort(function(a, b) {

		if (a.season === b.season) {
			return a.number - b.number;
		}

		return a.season - b.season;
	});

	saveFavorites();

	renderFavorites();
}


// =========================
// 13. LOAD GOOGLE SHEET
// =========================

async function loadEpisodesFromSheet() {

	try {

		const response =
			await fetch(SHEET_URL);

		const csvText =
			await response.text();

		const rows =
			csvText
			.trim()
			.split("\n")
			.slice(1);

		episodes = rows.map(function(row) {

			const columns =
				row.split(",");

			return {
				id: `s${columns[0]}e${columns[1]}`,

				season: Number(columns[0]),

				number: Number(columns[1]),

				name: columns[2]
					.replace(/\.(mkv|mp4)$/i, ""),

				driveUrl: columns[3]
					.trim()
			};
		});

		buildSeasonFilter();

		renderEpisodeLibrary();

		console.log(
			"Episodes loaded:",
			episodes
		);

	} catch (error) {

		console.error(error);

		result.innerHTML =
			"Could not load episodes.";
	}
}


// =========================
// 14. BUILD SEASON FILTER
// =========================

function buildSeasonFilter() {

	const seasons = [
		...new Set(
			episodes.map(
				episode => episode.season
			)
		)
	];

	seasons.sort((a, b) => a - b);

	seasons.forEach(function(season) {

		const option =
			document.createElement("option");

		option.value = season;

		option.textContent =
			`Season ${season}`;

		seasonFilterSelect.appendChild(option);
	});
}


// =========================
// 15. RENDER EPISODE LIBRARY
// =========================

function renderEpisodeLibrary() {

	allEpisodesList.innerHTML = "";

	const searchValue =
		episodeSearchInput.value
		.toLowerCase()
		.trim();

	const selectedSeason =
		seasonFilterSelect.value;

	let filteredEpisodes =
		episodes.filter(function(episode) {

			const matchesSearch =
				episode.name
				.toLowerCase()
				.includes(searchValue);

			const matchesSeason =
				selectedSeason === "all" ||
				String(episode.season) ===
				selectedSeason;

			return matchesSearch && matchesSeason;
		});

	filteredEpisodes.sort(function(a, b) {
		if (a.season === b.season) {
			return a.number - b.number;
		}

		return a.season - b.season;
	});

	episodeCountText.textContent =
		`${filteredEpisodes.length} episodes`;

	filteredEpisodes.forEach(function(episode) {

		const card =
			document.createElement("div");

		card.className = "library-card";

		card.innerHTML = `
			<h3>
				${cleanTitle(episode.name)}
			</h3>

			<p>
				Season ${episode.season},
				Episode ${episode.number}
			</p>

			<div class="library-actions-row">

				<button
					class="library-open-btn"
				>
					Open
				</button>

				<button
					class="remove-btn"
				>
					Select
				</button>

			</div>
		`;

		const buttons =
			card.querySelectorAll("button");

		const openButton = buttons[0];

		const selectButton = buttons[1];

		openButton.addEventListener(
			"click",
			function() {

				window.location.href =
					episode.driveUrl.trim();
			}
		);

		selectButton.addEventListener(
			"click",
			function() {

				selectEpisode(episode);
			}
		);

		allEpisodesList.appendChild(card);
	});
}


// =========================
// 16. CLEAR FILTERS
// =========================

function clearFilters() {

	episodeSearchInput.value = "";

	seasonFilterSelect.value = "all";

	renderEpisodeLibrary();
}


// =========================
// 17. HELPERS
// =========================

function cleanTitle(title) {

	return title.replace(/"/g, "");
}

function scrollToTopSmooth() {

	window.scrollTo({
		top: 0,
		behavior: "smooth"
	});
}


// =========================
// 18. START APP
// =========================

renderFavorites();

renderRecentEpisodes();

loadEpisodesFromSheet();
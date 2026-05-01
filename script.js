const button = document.getElementById("pickBtn");
const result = document.getElementById("result");
const classicMode = document.getElementById("classicMode");
const saveBtn = document.getElementById("saveBtn");
const favoritesList = document.getElementById("favoritesList");
const recentList = document.getElementById("recentList");
const sortRatingBtn = document.getElementById("sortRatingBtn");
const sortSeasonBtn = document.getElementById("sortSeasonBtn");
const paramountBtn = document.getElementById("paramountBtn");
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vToO6SuAuBCuix_uCVVaCA64RMSFrxYRcIIP06bgahJTIdQUNzY-dokfWG57zN-kg8JG-RuJ4sf1OZg/pub?output=csv";

let episodes = [];
let currentEpisode = null;
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let recentEpisodes = JSON.parse(localStorage.getItem("recentEpisodes")) || [];

saveBtn.addEventListener("click", saveFavorite);
renderFavorites();

button.addEventListener("click", pickEpisode);

sortRatingBtn.addEventListener("click", sortFavoritesByRating);
sortSeasonBtn.addEventListener("click", sortFavoritesBySeason);
renderRecentEpisodes();
paramountBtn.addEventListener("click", openEpisodeFile);

async function pickEpisode() {
	if (episodes.length === 0) {
		result.innerHTML = "Loading episodes...";
		return;
	}
	result.innerHTML = "Picking...";

	let episodeList = episodes;

	if (classicMode.checked) {
		episodeList = episodes.filter(episode => episode.season <= 8);
	}

	const randomNumber = Math.floor(Math.random() * episodeList.length);
	const episode = episodeList[randomNumber];

	currentEpisode = episode;

	paramountBtn.textContent =
		`Open S${episode.season}E${episode.number} in Drive`;

	addRecentEpisode(episode);

	result.innerHTML = `
    Season ${episode.season}, Episode ${episode.number}<br>
    <strong>${episode.name}</strong>
  `;
}

function saveFavorite() {
	if (!currentEpisode) {
		result.innerHTML = "Pick an episode first!";
		return;
	}

	const exists = favorites.some(ep => ep.id === currentEpisode.id);

	if (!exists) {
		favorites.push({
			id: currentEpisode.id,
			name: currentEpisode.name,
			driveUrl: currentEpisode.driveUrl,
			season: currentEpisode.season,
			number: currentEpisode.number,
			rating: 0
		});

		localStorage.setItem("favorites", JSON.stringify(favorites));
		renderFavorites();
	}
}

function openFavorite(index) {
	window.open(favorites[index].driveUrl, "_blank");
}

function rateEpisode(index, rating) {
	favorites[index].rating = rating;
	localStorage.setItem("favorites", JSON.stringify(favorites));
	renderFavorites();
}

function removeFavorite(index) {
	favorites.splice(index, 1);
	localStorage.setItem("favorites", JSON.stringify(favorites));
	renderFavorites();
}

function renderFavorites() {
	favoritesList.innerHTML = "";

	favorites.forEach((ep, index) => {
		const card = document.createElement("div");
		card.className = "favorite-card";

		card.innerHTML = `
      <h3>${ep.name}</h3>
      <p>Season ${ep.season}, Episode ${ep.number}</p>

      <div class="stars">
        ${[1,2,3,4,5].map(num => `
          <button onclick="rateEpisode(${index}, ${num})">
            ${num <= ep.rating ? "⭐" : "☆"}
          </button>
        `).join("")}
      </div>

      <div class="favorite-actions">
  <button class="open-fav-btn">
  Open
</button>

  <button class="remove-btn" onclick="removeFavorite(${index})">
    Remove
  </button>
</div>
    `;
const openBtn = card.querySelector(".open-fav-btn");

openBtn.addEventListener("click", () => {
  if (!ep.driveUrl) {
    alert("No Drive link saved for this favorite.");
    return;
  }

  window.open(ep.driveUrl, "_blank");
});

		favoritesList.appendChild(card);
	});
}

function addRecentEpisode(episode) {
	recentEpisodes.unshift({
		id: episode.id,
		name: episode.name,
		season: episode.season,
		number: episode.number,
		driveUrl: episode.driveUrl
	});

	recentEpisodes = recentEpisodes.slice(0, 10);

	localStorage.setItem(
		"recentEpisodes",
		JSON.stringify(recentEpisodes)
	);

	renderRecentEpisodes();
}

function renderRecentEpisodes() {
	recentList.innerHTML = "";

	recentEpisodes.forEach(ep => {
		const div = document.createElement("div");
		div.className = "recent-card";

		div.innerHTML = `
      <strong>${ep.name.replace(/"/g, '')}</strong>
      <br>
      Season ${ep.season}, Episode ${ep.number}
    `;

		div.addEventListener("click", () => {
			div.classList.add("tap-bounce");

			setTimeout(() => {
				div.classList.remove("tap-bounce");
			}, 250);

			currentEpisode = ep;

			paramountBtn.textContent =
				`Open S${ep.season}E${ep.number} in Drive`;

			result.innerHTML = `
        Season ${ep.season}, Episode ${ep.number}
        <br>
        <strong>${ep.name.replace(/"/g, '')}</strong>
      `;
		});

		recentList.appendChild(div);
	});
}

function sortFavoritesByRating() {
	favorites.sort((a, b) => b.rating - a.rating);
	localStorage.setItem("favorites", JSON.stringify(favorites));
	renderFavorites();
}

async function loadEpisodesFromSheet() {
	const response = await fetch(SHEET_URL);
	const data = await response.text();

	const rows = data.trim().split("\n").slice(1);

	episodes = rows.map(row => {
		const cols = row.split(",");

		return {
			id: `s${cols[0]}e${cols[1]}`,
			season: Number(cols[0]),
			number: Number(cols[1]),
			name: cols[2].replace(/\.(mkv|mp4)$/i, ""),
			driveUrl: cols[3]
		};
	});

	console.log("Episodes loaded:", episodes);
}

function openEpisodeFile() {
	if (!currentEpisode || !currentEpisode.driveUrl) {
		result.innerHTML = "No Drive link for this episode.";
		return;
	}

	window.open(currentEpisode.driveUrl, "_blank");
}

function sortFavoritesBySeason() {
	favorites.sort((a, b) => {
		if (a.season === b.season) {
			return a.number - b.number;
		}

		return a.season - b.season;
	});

	localStorage.setItem("favorites", JSON.stringify(favorites));
	renderFavorites();
}

loadEpisodesFromSheet();
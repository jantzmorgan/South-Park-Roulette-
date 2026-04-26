const button = document.getElementById("pickBtn");
const result = document.getElementById("result");
const classicMode = document.getElementById("classicMode");

button.addEventListener("click", pickEpisode);

async function pickEpisode() {
  result.innerHTML = "Picking...";

  const response = await fetch("https://api.tvmaze.com/shows/112/episodes");
  const episodes = await response.json();

  let episodeList = episodes;

if (classicMode.checked) {
  episodeList = episodes.filter(episode => episode.season <= 8);
}

const randomNumber = Math.floor(Math.random() * episodeList.length);
const episode = episodeList[randomNumber];

  result.innerHTML = `
    Season ${episode.season}, Episode ${episode.number}<br>
    <strong>${episode.name}</strong>
  `;
}
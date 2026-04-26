const button = document.getElementById("pickBtn");
const result = document.getElementById("result");

button.addEventListener("click", pickEpisode);

async function pickEpisode() {
  result.innerHTML = "Picking...";

  const response = await fetch("https://api.tvmaze.com/shows/112/episodes");
  const episodes = await response.json();

  const randomNumber = Math.floor(Math.random() * episodes.length);
  const episode = episodes[randomNumber];

  result.innerHTML = `
    Season ${episode.season}, Episode ${episode.number}<br>
    <strong>${episode.name}</strong>
  `;
}

/*
  Name: Yasmin Castro
  Date: 10/15/2026
  CSC 372-01

  This file handles the JavaScript for the TVmaze Show Gallery. 
  It allows users to search for TV shows and displays info from the TVmaze API.
*/

let searchForm = document.querySelector("#search-form");
let searchInput = document.querySelector("#search-input");
let statusMessage = document.querySelector("#status-message");
let showGallery = document.querySelector("#show-gallery");

/**
 * Will handle a search submitted input.
 * parameter here is event
 */
function handleSearch(event) {
  event.preventDefault();

  let searchText = searchInput.value.trim();

  if (searchText === "") {
    showGallery.innerHTML = "";
    statusMessage.textContent = "Please enter a TV show name!";
    return;
  }

  searchShows(searchText);
}

searchForm.addEventListener("submit", handleSearch);

/**
 * Searches the TVmaze API for the shows info.
 */
async function searchShows(searchText) {
  showGallery.innerHTML = "";
  statusMessage.textContent = "Searching for shows...";

  try {
    let url = "https://api.tvmaze.com/search/shows?q=" +
      encodeURIComponent(searchText);

    let response = await fetch(url);

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("Too many requests. Please try again later.");
      }
      throw new Error("HTTP error: " + response.status);
    }

    let data = await response.json();
    let shows = data.slice(0, 10);

    if (shows.length === 0) {
      statusMessage.textContent = "No TV shows found!";
      return;
    }

    statusMessage.textContent = "Found " + shows.length + " TV shows";
    displayShows(shows);

  } catch (error) {
    statusMessage.textContent = "Unable to load shows. " + error.message;
  }
}



/**
 * Creates card for each single TV show in the search results (10 max ofc).
 * parameter here will be shows
 */
function displayShows(shows) {
  for (let result of shows) {
    let show = result.show;

    let card = document.createElement("article");
    card.classList.add("show-card");

    let title = document.createElement("h2");
    title.textContent = show.name;
    card.appendChild(title);

    let summary = document.createElement("p");

    if (show.summary) {
        let parser = new DOMParser();
        let documentText = parser.parseFromString(show.summary, "text/html");
        summary.textContent = documentText.body.textContent;
    } else {
        summary.textContent = "Summary: Not available";
    }

    card.appendChild(summary);

    let premiere = document.createElement("p");
    premiere.textContent = "Premiered: " +
      (show.premiered || "Not available");
    card.appendChild(premiere);

    let updated = document.createElement("p");

    if (show.updated) {
      let updateDate = new Date(show.updated * 1000);
      updated.textContent = "Last updated: " +
        updateDate.toLocaleString();
    } else {
      updated.textContent = "Last updated: Not available";
    }

    card.appendChild(updated);

    let genres = document.createElement("p");

    if (show.genres && show.genres.length > 0) {
      genres.textContent = "Genres: " + show.genres.join(", ");
    } else {
      genres.textContent = "Genres: Not available";
    }

    card.appendChild(genres);

    let rating = document.createElement("p"); //double check this section

    if (show.rating && show.rating.average !== null) {
      rating.textContent = "Average rating: " + show.rating.average;
    } else {
      rating.textContent = "Average rating: Not available";
    }

    card.appendChild(rating);

    let link = document.createElement("a");
    link.href = show.url;
    link.textContent = "View on TVmaze";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    card.appendChild(link);

    showGallery.appendChild(card);

    displayCast(show.id, card);
  }
}


/**
 * Gets and displays the main cast for the TV shows.
 */
async function displayCast(showId, card) {
  let castTitle = document.createElement("h3");
  castTitle.textContent = "Main Cast:";
  card.appendChild(castTitle);

  let castInfo = document.createElement("p");
  castInfo.textContent = "Loading cast...";
  card.appendChild(castInfo);

  try {
    let url = "https://api.tvmaze.com/shows/" + showId + "/cast";
    let response = await fetch(url);

    if (!response.ok) {
      throw new Error("Unable to retrieve cast.");
    }

    let cast = await response.json();

    if (cast.length === 0) {
      castInfo.textContent = "Cast: Not available";
      return;
    }

    castInfo.textContent = "";

    let castList = document.createElement("ul");

    for (let i = 0; i < cast.length && i < 5; i++) {
      let member = document.createElement("li");

      let actorName = cast[i].person.name;
      let characterName = cast[i].character.name;

      member.textContent = actorName + " as " + characterName;
      castList.appendChild(member);
    }

    card.appendChild(castList);

  } catch (error) {
    castInfo.textContent = "Cast: Not available";
  }


}

searchShows("Spider-Man"); //When page first loads, searches for a default show snd display the results.
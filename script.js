
/**
 * Schedule API URL.
 */
const scheduleUrlBase = "https://www.finnkino.fi/xml/Schedule/?area="; // Itse Finnkino API

/**
 * Show data API URL.
 */
const showDataUrlBase = "https://www.omdbapi.com/?&apikey=962f2d2c&t="; // OMDB Api

/**
 * Request format JSON.
 */
const FORMAT_JSON = 'JSON'; // Mikäli JSON

/**
 * Request format XML.
 */
const FORMAT_XML = 'XML'; // Mikäli XML

/**
 * Start the program.
 */
init(); // Aloita skripti

/**
 * Function for starting the program.
 */
function init() {
  makeGetRequest('https://www.finnkino.fi/xml/TheatreAreas/', FORMAT_XML, function (data) { // Kutsu funktio "makeGetRequest" annetuilla parametreillä. 
    let theatreAreas = data.getElementsByTagName('TheatreArea');
    createTheaterDropDown(theatreAreas); // Kutsu funktio createTheatherDropdown
    document.getElementById("areas").addEventListener("change", theaterAreaEventListener);
  });
}

/**
 * Function for creating the theater dropdown.
 *
 * @param {HTMLCollection} theaters
 *   A collection of theater XML objects.
 */
function createTheaterDropDown(theaters) {
  let select = document.getElementById("areas");

  for (let i = 0; i < theaters.length; i++) {
    let option = document.createElement("option");
    option.value = getTagTextContent(theaters[i], 'ID')
    option.textContent = getTagTextContent(theaters[i], 'Name')
    select.appendChild(option);
  }
}

/**
 * Event listener for the theater area dropdown.
 *
 * @param {object} event
 *   The event listener event.
 */
function theaterAreaEventListener(event) {
  let target = event.target.value;

  if (target === "1029") {
    document.getElementById("movies").innerHTML = "Pick a theatre to display movies!";
    return;
  }

  makeGetRequest(scheduleUrlBase + target, FORMAT_XML, function (data) {
    document.getElementById("movies").innerHTML = "";

    let shows = data.getElementsByTagName('Show'); 
    shows = removeDuplicateShows(shows); // Pois duplicatet

    for (let i = 0; i < shows.length; i++) {
      getShowData(shows[i]);
    }
  });
}

/**
 * Function for removing duplicate shows.
 *
 * @param {HTMLCollection} shows
 *   A collection of show XML objects.
 */
function removeDuplicateShows(shows) {
  let foundTitles = [];
  let nonDuplicateShows = [];

  for (let i = 0; i < shows.length; i++) {
    let title = getTagTextContent(shows[i], 'Title') // Kutsu funktio annetuilla parametreillä

    if (!foundTitles.includes(title)) {
      nonDuplicateShows.push(shows[i]);
      foundTitles.push(title);
    }
  }
  return nonDuplicateShows;
}

/**
 * Function for removing duplicate shows.
 *
 * @param {object} show
 *   A show XML objects.
 */
function getShowData(show) {
  const title  = getTagTextContent(show, 'Title');
  const poster = getTagTextContent(show, 'EventMediumImagePortrait');
  let plot   = 'Plot not found.';
  let actors = 'Actors not found.';
  let status = 'error'

  makeGetRequest(showDataUrlBase + title, FORMAT_JSON, function (data) {
    if (!data.Error) {
      plot = data['Plot'];
      actors = data['Actors'];
      status = 'no-error'
    }
    createMovieElement(title, poster, plot, actors, status);
  });
}

/**
 * Function for creating a movie element.
 *
 * @param {string} title
 *   The movie title.
 * @param {string} poster
 *   The movie poster URL.
 * @param {string} plot
 *   The movie plot.
 * @param {string} actors
 *   The movie actors.
 * @param {string} status
 *   The movie status class.
 */
function createMovieElement(title, poster, plot, actors, status) {
  let containerElement = createElement('div', ['movie', status]);
  let titleElement     = createElement('h2',  ['title'], title);
  let posterElement    = createElement('img', ['poster'], title, poster, title);
  let plotElement      = createElement('div', ['plot'], plot);
  let actorsElement    = createElement('div', ['actors'] , actors);
  let movieContainer   = createElement('div', ['movie-container']);

  movieContainer.append(posterElement, titleElement, plotElement, actorsElement);
  containerElement.append(movieContainer);
  document.querySelector('#movies').append(containerElement);
}

/**
 * Function for creating an element.
 *
 * @param {string} type
 *   The element type.
 * @param {array} classes
 *   An array of classes.
 * @param {string} content
 *   The text content.
 * @param {string} src
 *   The src attribute.
 * @param {string} alt
 *   The alt attribute.
 */
function createElement(type, classes, content = "", src = "", alt = "") {
  let element = document.createElement(type);
  element.classList.add(...classes);

  if (content) {
    element.textContent = content;
  }

  if (src) {
    element.setAttribute("src", src);
  }

  if (alt) {
    element.setAttribute("alt", alt);
  }

  return element;
}

/**
 * Function for making a GET request.
 *
 * @param {string} url
 *   The request URL
 * @param {string} requestType
 *   The request type (XML or JSON).
 * @param {function} callback
 *   The callback function.
 */
function makeGetRequest(url, requestType, callback) {
  let xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status !== 200) {
        console.log('ERROR' + xhr.status);
      }
      if (requestType === FORMAT_XML) {
        return callback(xhr.responseXML);
      }
      return callback(JSON.parse(xhr.responseText));
    }
  };
  xhr.send();
}

/**
 * Function for getting the text content of a XML node.
 *
 * @param {object} element
 *   An XML object element.
 * @param {string} tag
 *   The tag name.
 */
function getTagTextContent(element, tag) {
  return element.getElementsByTagName(tag)[0].textContent;
}
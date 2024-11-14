const apiKey = '93125ca0e428e22f184b319c26b5a573';
const apiBaseUrl = 'https://api.themoviedb.org/3';
const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

let cartoons = document.getElementsByClassName('movie-item');
let films = document.getElementsByClassName('movie-item');
let banners = document.getElementById('movieBanner');
let popup_container = document.querySelector('.popup_container');
const main_grid = document.getElementById('main_grid');
const banner_click = document.querySelector('.show-selection');


function movies(query, movieDiv) {
    const url = `${apiBaseUrl}/search/movie?query=${encodeURIComponent(query)}&api_key=${apiKey}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.results && data.results.length > 0) {
                console.log(data.results);
                console.log(data);
                displayMovieData(data.results[0], movieDiv);
            } else {
                movieDiv.innerHTML = `<p>${query} not found.</p>`;
            }
        })
        .catch(error => console.error('Error fetching data:', error));
}
function searchBanner(query, movieDiv) {
    const url = `${apiBaseUrl}/search/movie?query=${encodeURIComponent(query)}&api_key=${apiKey}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log('API Response:', data);

            if (data.results && data.results.length > 0) {
                const movie = data.results[0];
                const title = movie.title || 'No Title Available';
                const description = movie.overview || 'No Description Available';
                const posterPath = movie.poster_path
                    ? `${imageBaseUrl}${movie.poster_path}`
                    : 'placeholder.jpg';

                movieDiv.setAttribute('data-id', movie.id);

                movieDiv.innerHTML = `<div class="banner-content">
                                        <h2>${title}</h2>
                                        <p>${description}</p>
                                        <button class="show-selection">Watch Now</button>
                                       </div>`;
                movieDiv.style.backgroundImage = `url(${posterPath})`;
                movieDiv.style.backgroundSize = 'cover';
                movieDiv.style.backgroundPosition = 'center';
                console.log('Background image applied to:', movieDiv);

                const watchNowButton = movieDiv.querySelector('.show-selection');
                watchNowButton.addEventListener('click', () => {
                    show_popup(movie).then(() =>
                        console.log("Popup displayed successfully!")
                    );
                });

            } else {
                movieDiv.innerHTML = `<p>${query} not found.</p>`;
                console.warn(`${query} not found.`);
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

function displayMovieData(movie, movieDiv) {
    const title = movie.title || 'No Title Available';
    const posterPath = movie.poster_path ? `${imageBaseUrl}${movie.poster_path}` : 'placeholder.jpg';
    const rating = movie.vote_average.toFixed(1);
    const year = movie.release_date.split('-')[0];

    movieDiv.setAttribute('data-id', movie.id);

    movieDiv.innerHTML = `
        <img src="${posterPath}" alt="${title}" />
        <h4>${title}</h4>
        <div class="movie_info">
            <p class="rating">${rating}</p>
            <p class="year">${year}</p>
        </div>
    `;
}


let latestSearchResult = null;

document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && latestSearchResult) {
        show_popup(latestSearchResult);
    }
});

function search(name) {
    const url = `${apiBaseUrl}/search/movie?query=${encodeURIComponent(name)}&api_key=${apiKey}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.results && data.results.length > 0) {
                const movieTitles = data.results.map(item => item.title);
                showSuggestions(movieTitles);

                latestSearchResult = data.results[0];
            } else {
                clearSuggestions();
                latestSearchResult = null;
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            clearSuggestions();
            latestSearchResult = null;
        });
}


function showSuggestions(titles) {
    const suggestionsList = document.getElementById('suggestions');
    suggestionsList.innerHTML = '';

    titles.forEach(title => {
        const listItem = document.createElement('li');
        listItem.textContent = title;
        listItem.addEventListener('click', function() {
            document.getElementById('searchInput').value = title;
            clearSuggestions();
        });
        suggestionsList.appendChild(listItem);
    });
}
function clearSuggestions() {
    document.getElementById('suggestions').innerHTML = '';
}


document.addEventListener('DOMContentLoaded', () => {
    Array.from(cartoons).forEach(cartoon => {
        const cartoonTitle = cartoon.textContent.trim();
        movies(cartoonTitle, cartoon);
    });
    Array.from(films).forEach(film => {
        const cartoonTitle = film.textContent.trim();
        movies(cartoonTitle, film);
    });
    searchBanner('Spider Man: Homecoming', banners);
    click_effect_on_item(Array.from(films));
});

document.getElementById('searchInput').addEventListener('input', function() {
    const movieName = document.getElementById('searchInput').value;
    if (movieName.length > 2) {
        search(movieName);
    } else {
        clearSuggestions();
    }
});


function click_effect_on_item(films) {
    films.forEach(film => {
        film.addEventListener('click', () => show_popup(film));
    });
}

async function show_popup(film) {
    popup_container.classList.add('show');

    const movie_id = typeof film === 'object' && film.getAttribute
        ? film.getAttribute('data-id')  // when `film` is an HTML element with data-id
        : film.id;    const movie = await search_by_id(movie_id);
    if (movie) {
        const posterUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;

        popup_container.style.background = `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0,0,0,1)), url(${posterUrl})`;
        popup_container.style.backgroundSize = 'cover';
        popup_container.style.backgroundPosition = 'top';

        popup_container.innerHTML = `
            <button class="x" aria-label="Close popup">&#10006;</button>
            <div class="content_popup">
                <div class="left">
                    <div class="poster_img">
                        <img src="${posterUrl}" alt="Movie Poster">
                    </div>
                    <div class="single_info">
                        <span>Add to favorite: </span>
                        <button class="heart_icon" aria-label="Add to favorites">&#9829;</button>
                    </div>
                </div>
                <div class="right">
                    <h1>${movie.title}</h1>
                    <h3>${movie.tagline || 'No tagline available'}</h3> 
                    <div class="single_info_container">
                        <div class="single_info">
                            <span>Language:</span>
                            <span>${movie.spoken_languages[0]?.name || 'N/A'}</span> 
                        </div>
                        <div class="single_info">
                            <span>Length:</span>
                            <span>${movie.runtime ? movie.runtime : 'N/A'} minutes</span>  
                        </div>
                        <div class="single_info">
                            <span>Rate:</span>
                            <span>${movie.vote_average ? movie.vote_average : 'N/A'} / 10</span> 
                        </div>
                        <div class="single_info">
                            <span>Budget:</span>
                            <span>${movie.budget ? movie.budget : 'N/A'}$</span> 
                        </div>
                        <div class="single_info">
                            <span>Release date:</span>
                            <span>${movie.release_date || 'N/A'}</span> 
                        </div>
                    </div>
                    <div class="genres">
                        <h2>Genres</h2>
                        <ul>
                            ${movie.genres.map(genre => `<li>${genre.name}</li>`).join('')}  
                        </ul>
                    </div>
                    <div class="overview">
                        <h2>Overview</h2>
                        <p>${movie.overview || 'No overview available'}</p>  
                    </div>
                </div>
            </div>
        `;

        const x_icon = document.querySelector('.x');
        x_icon.addEventListener('click', () => {
            popup_container.classList.remove('show');
        });

        const heart_icon = document.querySelector('.heart_icon');

        if (get_LS().includes(movie_id)) {
            heart_icon.classList.add('change_icon');
        } else {
            heart_icon.classList.remove('change_icon');
        }

        const cloned_heart_icon = heart_icon.cloneNode(true);
        heart_icon.parentNode.replaceChild(cloned_heart_icon, heart_icon);

        cloned_heart_icon.addEventListener('click', () => {
            if (cloned_heart_icon.classList.contains('change_icon')) {
                remove_LS(movie_id);
                cloned_heart_icon.classList.remove('change_icon');
            } else {
                add_to_LS(movie_id);
                cloned_heart_icon.classList.add('change_icon');
            }
            fetch_favorites_movies();
        });

    } else {
        console.error('Movie data not found.');
    }
}

function get_LS() {
    const movies_ids = JSON.parse(localStorage.getItem('data-id'));
    return movies_ids === null ? [] : movies_ids;
}

function add_to_LS(id) {
    const movies_ids = get_LS();
    if (!movies_ids.includes(id)) {  // Check for duplicates
        localStorage.setItem('data-id', JSON.stringify([...movies_ids, id]));
    }
}

function remove_LS(id) {
    const movies_ids = get_LS();
    localStorage.setItem('data-id', JSON.stringify(movies_ids.filter(e => e !== id)));
}

async function fetch_favorites_movies() {
    main_grid.innerHTML = `<h1 class="title_favorite">My favorite films</h1> <div class="favorite_list"></div>`;
    const favoriteListContainer = document.querySelector('.favorite_list');
    favoriteListContainer.innerHTML = '';  // Clear existing items

    const movies_LS = get_LS();
    for (let i = 0; i < movies_LS.length; i++) {
        const movie_id = movies_LS[i];
        let movie = await search_by_id(movie_id);
        add_favorites_to_dom_from_LS(movie);
    }
}

function add_favorites_to_dom_from_LS(movie_data) {
    const movieItem = document.createElement('div');
    movieItem.classList.add('movie-item');
    movieItem.setAttribute('data-id', movie_data.id);
    movieItem.innerHTML = `
        <img src="https://image.tmdb.org/t/p/w200${movie_data.poster_path}" alt="${movie_data.title}" />
        <h4>${movie_data.title}</h4>
    `;
    document.querySelector('.favorite_list').appendChild(movieItem);

    movieItem.addEventListener('click', () => show_popup(movieItem));
}

document.getElementById('favoritesLink').addEventListener('click', function (event) {
    event.preventDefault();

    const contentElements = document.querySelectorAll('.content, .movie-details, .film-list');
    contentElements.forEach(element => {
        element.classList.add('hidden');
    });

    main_grid.classList.remove('hidden');
    main_grid.style.display = 'block';

    fetch_favorites_movies();
});


async function search_by_id(id) {
    const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}`;  // Add the API key

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data) {
            console.log(data);
            return data;
        } else {
            console.error('No results found for movie with ID:', id);
        }
    } catch (error) {
        console.error('Error fetching movie data:', error);
    }
}

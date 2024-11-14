const apiKey = 'c855d16efa834607ad336546017360be';
const apiBaseUrl = 'https://api.spoonacular.com/recipes/complexSearch';
const imageBaseUrl = 'https://spoonacular.com/cdn/ingredients_100x100/';

const popupContainer = document.querySelector('.popup_container');
const mainGrid = document.getElementById('main_grid');
const allRecipesLink = document.getElementById('allRecipesLink');
const favoritesLink = document.getElementById('favoritesLink');

function loadRecipesFromLocalStorage() {
    const recipesData = localStorage.getItem('recipes');
    return recipesData ? JSON.parse(recipesData) : [];
}

function loadFavoritesFromLocalStorage() {
    const favorites = localStorage.getItem('favoriteRecipes');
    return favorites ? JSON.parse(favorites) : [];
}

function storeRecipesInLocalStorage(recipes) {
    localStorage.setItem('recipes', JSON.stringify(recipes));
}

function storeFavoritesInLocalStorage(favorites) {
    localStorage.setItem('favoriteRecipes', JSON.stringify(favorites));
}

function fetchAllRecipes(query) {
    const url = `${apiBaseUrl}?query=${encodeURIComponent(query)}&apiKey=${apiKey}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.results && data.results.length > 0) {
                storeRecipesInLocalStorage(data.results);
                displayRecipes(data.results);
            } else {
                mainGrid.innerHTML = `<p>${query} not found.</p>`;
            }
        })
        .catch(error => console.error('Error fetching data:', error));
}

function displayRecipes(recipes) {
    mainGrid.innerHTML = '';
    recipes.forEach(recipe => {
        const recipeDiv = document.createElement('div');
        recipeDiv.classList.add('recipe-item');
        recipeDiv.setAttribute('data-id', recipe.id);
        recipeDiv.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.title}" />
            <h4>${recipe.title}</h4>
        `;
        mainGrid.appendChild(recipeDiv);

        recipeDiv.addEventListener('click', () => showPopup(recipe));
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const storedRecipes = loadRecipesFromLocalStorage();
    if (storedRecipes.length > 0) {
        displayRecipes(storedRecipes);
    } else {
        fetchAllRecipes('recipes');
    }
});

async function showPopup(recipe) {
    popupContainer.classList.add('show');
    const recipeId = recipe.id;

    const storedRecipes = loadRecipesFromLocalStorage();
    const recipeData = storedRecipes.find(r => r.id === recipeId);

    if (recipeData) {
        const imageUrl = recipeData.image;
        popupContainer.style.background = `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0,0,0,1)), url(${imageUrl})`;
        popupContainer.style.backgroundSize = 'cover';
        popupContainer.style.backgroundPosition = 'top';
        popupContainer.innerHTML = `
            <button class="x" aria-label="Close popup">&#10006;</button>
            <div class="content_popup">
                <div class="left">
                    <div class="poster_img">
                        <img src="${imageUrl}" alt="Recipe Image">
                    </div>
                    <div class="single_info">
                        <span>Add to favorites: </span>
                        <button class="heart_icon" aria-label="Add to favorites">&#9829;</button>
                    </div>
                </div>
                <div class="right">
                    <h1>${recipeData.title}</h1>
                    <div class="ingredients">
                        <h2>Ingredients</h2>
                        <ul>
                            ${Array.isArray(recipeData.extendedIngredients) ? recipeData.extendedIngredients.map(ingredient => `
                                <li>
                                    <img src="${imageBaseUrl}${ingredient.image}" alt="${ingredient.name}" />
                                    ${ingredient.name}
                                </li>
                            `).join('') : '<p>No ingredients available</p>'}
                        </ul>
                    </div>

                    <div class="instructions">
                        <h2>Instructions</h2>
                        <p>${recipeData.instructions || 'No instructions available'}</p>
                    </div>
                </div>
            </div>
        `;

        const x_icon = document.querySelector('.x');
        x_icon.addEventListener('click', () => {
            popupContainer.classList.remove('show');
            mainGrid.style.display = 'grid';
        });

        const heart_icon = document.querySelector('.heart_icon');

        // Check if recipe is in favorites
        const favorites = loadFavoritesFromLocalStorage();
        if (favorites.includes(recipeId)) {
            heart_icon.classList.add('change_icon');
        }

        heart_icon.addEventListener('click', () => {
            if (heart_icon.classList.contains('change_icon')) {
                removeFromFavorites(recipeId);
                heart_icon.classList.remove('change_icon');
            } else {
                addToFavorites(recipeId);
                heart_icon.classList.add('change_icon');
            }
        });
    }
}

function addToFavorites(id) {
    const favorites = loadFavoritesFromLocalStorage();
    if (!favorites.includes(id)) {
        favorites.push(id);
        storeFavoritesInLocalStorage(favorites);
    }
}

function removeFromFavorites(id) {
    let favorites = loadFavoritesFromLocalStorage();
    favorites = favorites.filter(fav => fav !== id);
    storeFavoritesInLocalStorage(favorites);
}

function displayFavorites() {
    const favoriteRecipeIds = loadFavoritesFromLocalStorage();
    const storedRecipes = loadRecipesFromLocalStorage();

    const favoriteRecipes = storedRecipes.filter(recipe => favoriteRecipeIds.includes(recipe.id));
    displayRecipes(favoriteRecipes);
}

allRecipesLink.addEventListener('click', (event) => {
    event.preventDefault();
    const storedRecipes = loadRecipesFromLocalStorage();
    displayRecipes(storedRecipes);
});

favoritesLink.addEventListener('click', (event) => {
    event.preventDefault();
    displayFavorites();
});

const categoryButton = document.querySelector('.category-btn');
const categoryMenu = document.getElementById('categoryMenu');

categoryButton.addEventListener('click', () => {
    categoryMenu.style.display = categoryMenu.style.display === 'block' ? 'none' : 'block';
});

categoryMenu.addEventListener('click', (event) => {
    const category = event.target.getAttribute('data-category');
    if (category) {
        fetchAllRecipes(category);
        categoryMenu.style.display = 'none';
    }
});

document.getElementById('searchInput').addEventListener('input', (event) => {
    const query = event.target.value.trim();
    if (query.length > 2) {
        fetchAllRecipes(query);
    }
});
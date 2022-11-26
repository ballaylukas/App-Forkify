import { API_URL, RES_PER_PAGE, KEY } from "./config.js";
// import { getJSON, sendJSON } from "./helpers.js";
import { AJAX } from "./helpers.js";

// STATE OBJECT
export const state = {
  recipe: {},
  search: {
    query: "",
    results: [],
    page: 1,
    resultsPerPage: RES_PER_PAGE,
  },
  bookmarks: [],
};

// CREATE RECIPE OBJECT
const createRecipeObject = function (data) {
  const { recipe } = data.data;
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && { key: recipe.key }),
  };
};

// LOAD RECIPE
export const loadRecipe = async function (id) {
  try {
    // Get recipe data
    const data = await AJAX(`${API_URL}${id}?key=${KEY}`);

    // Store data in recipe object
    state.recipe = createRecipeObject(data);

    // Check recipe bookmarks state
    if (state.bookmarks.some(bookmark => bookmark.id === id))
      state.recipe.bookmarked = true;
    else state.recipe.bookmarked = false;

    console.log(state.recipe);
  } catch (err) {
    // Temporary error handling
    console.error(`${err} 💥💥💥💥`);
    // Rethrow the error for use in controller
    throw err;
  }
};

// LOAD SEARCH RESULTS
export const loadSearchResults = async function (query) {
  try {
    // Store search query in search object
    state.search.query = query;

    // Search result data
    const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);

    // Store data in search object
    state.search.results = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        ...(rec.key && { key: rec.key }),
      };
    });

    // Reset page to 1
    state.search.page = 1;
  } catch (err) {
    // Temporary error handling
    console.error(`${err} 💥💥💥💥`);
    // Rethrow the error for use in controller
    throw err;
  }
};

// GET SEARCH RESULTS PAGE
export const getSearchResultsPage = function (page = state.search.page) {
  // Store search page
  state.search.page = page;

  // Range of data
  const start = (page - 1) * state.search.resultsPerPage;
  const end = page * state.search.resultsPerPage;

  return state.search.results.slice(start, end);
};

// UPDATE SERVINGS
export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach(ing => {
    // Calculate ingredients quantity
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
  });

  // Update servings data
  state.recipe.servings = newServings;
};

// STORE BOOKMARKS TO LOCALSTORAGE
const persistBookmarks = function () {
  localStorage.setItem("bookmarks", JSON.stringify(state.bookmarks));
};

// ADD BOOKMARK
export const addBookmark = function (recipe) {
  // Add bookmark
  state.bookmarks.push(recipe);

  // Mark current recipe as a bookmarked
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;

  // Store bookmarks
  persistBookmarks();
};

// DELETE BOOKMARK
export const deleteBookmark = function (id) {
  // Delete bookmark
  const index = state.bookmarks.findIndex(el => el.id === id);
  state.bookmarks.splice(index, 1);

  // Mark current recipe as NOT bookmarked
  if (id === state.recipe.id) state.recipe.bookmarked = false;

  // Store bookmarks
  persistBookmarks();
};

// INIT
const init = function () {
  const storage = localStorage.getItem("bookmarks");

  if (storage) state.bookmarks = JSON.parse(storage);
};
init();

// CLEAR BOOKMARKS (!!! ONLY FOR DEBUGGING CODE !!!)
const clearBookmarks = function () {
  localStorage.clear("bookmarks");
};
// clearBookmarks();

// UPLOAD RECIPE
export const uploadRecipe = async function (newRecipe) {
  try {
    // Create object of ingredients
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith("ingredient") && entry[1] !== "")
      .map(ing => {
        const ingArr = ing[1].split(",").map(el => el.trim());
        // const ingArr = ing[1].replaceAll(" ", "").split(",");

        if (ingArr.length !== 3)
          throw new Error(
            "Wrong ingredient fromat! Please use the correct format :)"
          );

        const [quantity, unit, description] = ingArr;

        return { quantity: quantity ? +quantity : null, unit, description };
      });

    // Create new recipe object
    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    };

    // Send recipe data
    const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);

    // Store data in recipe object
    state.recipe = createRecipeObject(data);

    // Add bookmark
    addBookmark(state.recipe);
  } catch (err) {
    // Rethrow the error for use in controller
    throw err;
  }
};

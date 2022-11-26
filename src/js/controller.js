import * as model from "./model.js";
import { MODAL_CLOSE_SEC } from "./config";
import recipeView from "./views/recipeView.js";
import searchView from "./views/searchView.js";
import resultsView from "./views/resultsView.js";
import paginationView from "./views/paginationView.js";
import bookmarksView from "./views/bookmarksView.js";
import addRecipeView from "./views/addRecipeView.js";

// PACKAGES FOR POLYFILLING
// import "core-js/stable";
// import "regenerator-runtime/runtime";

// HOT RELOADING IN PARCEL
// if (module.hot) {
//   module.hot.accept();
// }

// CONTROL RECIPES
const controlRecipes = async function () {
  try {
    // Get Hash of URL
    const id = window.location.hash.slice(1);
    // Guard clause
    if (!id) return;

    // Rendering spinner
    recipeView.renderSpinner();

    // 0) Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());

    // 1. Updating bookmarks view
    bookmarksView.update(model.state.bookmarks);

    // 2. Load recipe
    await model.loadRecipe(id);

    // 3. Render recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
    console.error(err);
  }
};

// CONTROL SEARCH RESULTS
const controlSearchResults = async function () {
  try {
    // Rendering spinner
    resultsView.renderSpinner();

    // 1. Get search query
    const query = searchView.getQuery();
    // Guard clause
    if (!query) return;

    // 2. Load search results
    await model.loadSearchResults(query);

    // 3. Render search results
    resultsView.render(model.getSearchResultsPage());

    // 4. Render initial paginations buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

// CONTROL PAGINATION
const controlPagination = function (goToPage) {
  // 1. Render NEW search results
  resultsView.render(model.getSearchResultsPage(goToPage));

  // 4. Render NEW paginations buttons
  paginationView.render(model.state.search);
};

// CONTROL SERVINGS
const controlServings = function (newServings) {
  // Update the recipe servings (in state)
  model.updateServings(newServings);

  // Update the recipe view
  recipeView.update(model.state.recipe);
};

// CONTROL ADD / DELETE BOOKMARK
const controlAddBookmark = function () {
  // Add / delete bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // Update the recipe view
  recipeView.update(model.state.recipe);

  // Render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

// CONTROL BOOKMARKS
const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

// CONTROL ADD RECIPE
const controlAddRecipe = async function (newRecipe) {
  try {
    // Rendering spinner
    addRecipeView.renderSpinner();

    // Upload the new recipe data
    await model.uploadRecipe(newRecipe);

    // Render recipe
    recipeView.render(model.state.recipe);

    // Success message
    addRecipeView.renderMessage();

    // Render bookmark view
    bookmarksView.render(model.state.bookmarks);

    // Change ID in URL
    window.history.pushState(null, "", `#${model.state.recipe.id}`);

    // Close form window with delay
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error("💥", err);
    addRecipeView.renderError(err.message);
  }
};

// INIT (PUBLISHER-SUBSCRIBER PATTERN)
const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addhandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
  console.log("Welcome");
};
init();

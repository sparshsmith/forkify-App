import * as model from './model.js'
import recipeView from './view/recipeView.js'
import searchView from './view/searchView.js'
import resultView from './view/resultView.js'
import paginationView from './view/paginationView.js'
import bookmarksView from './view/bookmarksView.js'
import addRecipeView from './view/addRecipeView.js'
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime/runtime'
import { MODAL_CLOSE_SEC } from './config.js'

if (module.hot) {
  module.hot.accept();
}

const controlRecipies = async function () {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;
    recipeView.renderSpinner();

    // 0. Update Results view to mark selected recipe
    resultView.update(model.getSearchResultsPage());

    // 1. loading recipe
    await model.loadRecipie(id);

    // 2. rendering recipe
    recipeView.render(model.state.recipe)

    // 3. updating bookmarks view
    bookmarksView.update(model.state.bookmarks);
  } catch (err) {
    recipeView.renderError()
  }
}

const controlSearchResults = async function () {
  try {
    // 1. get search query
    const query = searchView.getQuery();

    if (!query) return;

    resultView.renderSpinner();
    // 2. load Search Result
    await model.loadSearchResult(query);

    // 3. render result
    //resultView.render(model.state.search.results)
    resultView.render(model.getSearchResultsPage());

    // 4. Render initial Pagination
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
}

const controlPagination = function (goToPage) {
  // 1. render new result
  resultView.render(model.getSearchResultsPage(goToPage));

  // 2. Render new Pagination
  paginationView.render(model.state.search);
}

const controlServings = function (newServings) {
  // update the recipe servings
  model.updateServing(newServings);

  // update the recipe view
  //recipeView.render(model.state.recipe)
  recipeView.update(model.state.recipe)
}

const controlAddBookmark = function () {
  // 1. Add/remove bookmark
  if (!model.state.recipe.bookmarked)
    model.addBookmark(model.state.recipe);
  else
    model.deleteBookmark(model.state.recipe.id);

  // 2. render bookmarks
  bookmarksView.render(model.state.bookmarks);

  //3. Update recipe view
  recipeView.update(model.state.recipe);

}

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
}

const controlAddRecipe = async function (newRecipe) {
  try {
    // show loading spinner
    addRecipeView.renderSpinner();

    // uplad the new Reicipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    //render recipe 
    recipeView.render(model.state.recipe);

    // success message
    addRecipeView.renderMessage();

    // render bookmark view
    bookmarksView.render(model.state.bookmarks);

    // change id in url
    window.history.pushState(null, '', `#${model.state.recipe.id}`)
    //window.history.back();

    // close form
    setTimeout(function () {
      addRecipeView.toggleWindow()
    }, MODAL_CLOSE_SEC * 1000)
  } catch (err) {
    console.error(err)
    addRecipeView.renderError(err)
  }
}

const init = function () {
  recipeView.addHandlerRender(controlRecipies);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  bookmarksView.addHandlerRender(controlBookmarks);
  addRecipeView.addHandlerUpload(controlAddRecipe);
}

init();

const clearBookmarks = function () {
  localStorage.clear('bookmarks');
}

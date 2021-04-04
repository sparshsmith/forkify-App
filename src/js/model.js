export { async } from 'regenerator-runtime';
import { API_KEY, API_URL, RES_PER_PAGE } from './config.js';
//import { getJSON, sendJSON } from './helper.js';
import { AJAX } from './helper.js'

export const state = {
    recipe: {},
    search: {
        query: '',
        results: [],
        resultsPerPage: RES_PER_PAGE,
        page: 1
    },
    bookmarks: []
};

const createRecipeData = function (data) {
    const { recipe } = data.data;
    return {
        id: recipe.id,
        title: recipe.title,
        publisher: recipe.publisher,
        sourceURL: recipe.source_url,
        image: recipe.image_url,
        servings: recipe.servings,
        cookingTime: recipe.cooking_time,
        ingredients: recipe.ingredients,
        ...(recipe.key && { key: recipe.key })
    }
}

export const loadRecipie = async function (id) {
    try {
        const data = await AJAX(`${API_URL}${id}?key=${API_KEY}`);
        state.recipe = createRecipeData(data);

        if (state.bookmarks.some(bookmark => bookmark.id === id))
            state.recipe.bookmarked = true;
        else
            state.recipe.bookmarked = false;

    } catch (err) {
        // temp error handling
        console.error(`${err}  💥💥💥`);
        throw err;
    }
}

export const loadSearchResult = async function (query) {
    try {
        const data = await AJAX(`${API_URL}?search=${query}&key=${API_KEY}`)
        state.search.query = query;
        state.search.results = data.data.recipes.map(rec => {
            return {
                id: rec.id,
                title: rec.title,
                publisher: rec.publisher,
                image: rec.image_url,
                ...(rec.key && { key: rec.key })
            }
        })
        state.search.page = 1;
    } catch (err) {
        throw err;
    }
}

export const getSearchResultsPage = function (page = state.search.page) {
    state.search.page = page;
    const start = (page - 1) * state.search.resultsPerPage; //0
    const end = (page * state.search.resultsPerPage);

    return state.search.results.slice(start, end)
}

export const updateServing = function (newServings) {
    state.recipe.ingredients.forEach(ing => {
        ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
        // newQty  = (oldQty* newServings)/Servings
    });

    state.recipe.servings = newServings;
}

const persistBookmarks = function () {
    localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
}

export const addBookmark = function (recipe) {
    // add bookmark
    state.bookmarks.push(recipe);

    // mark current reciepe as bookmark
    if (recipe.id === state.recipe.id)
        state.recipe.bookmarked = true;

    persistBookmarks();
}

export const deleteBookmark = function (id) {
    // delete bookmark
    const index = state.bookmarks.findIndex(el => el.id === id);
    state.bookmarks.splice(index, 1);

    // Mark current recipe as not bookmarkde
    if (id === state.recipe.id)
        state.recipe.bookmarked = false;

    persistBookmarks();
}

const init = function () {
    const storage = localStorage.getItem('bookmarks');
    if (storage)
        state.bookmarks = JSON.parse(storage);
}

init();

export const uploadRecipe = async function (newRecipe) {
    try {
        const ingredients = Object.entries(newRecipe).filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
            .map(ing => {
                const ingArr = ing[1].split(',').map(el => el.trim());
                if (ingArr.length !== 3) throw new Error('Wrong ingredient format. Please fill the correct format')

                const [quantity, unit, description] = ingArr;
                return { quantity: quantity ? +quantity : null, unit, description }
            })

        const recipe = {
            title: newRecipe.title,
            source_url: newRecipe.sourceUrl,
            image_url: newRecipe.image,
            publisher: newRecipe.publisher,
            cooking_time: newRecipe.cookingTime,
            servings: newRecipe.servings,
            ingredients
        }
        const data = await AJAX(`${API_URL}?key=${API_KEY}`, recipe);
        state.recipe = createRecipeData(data);
        addBookmark(state.recipe);

    }
    catch (err) {
        throw err;
    }


}

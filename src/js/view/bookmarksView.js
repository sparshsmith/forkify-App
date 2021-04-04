import View from "./view";
import previewView from './previewView.js';
import icons from 'url:../../img/icons.svg'

class BookmarksView extends View {
    _parentElement = document.querySelector('.bookmarks__list');
    _errorMessage = 'No bookmarks yet. Find a nice recipe and bookmark it';
    _message = '';

    _generateMarkup() {
        return this._data.map(bookmarks => previewView.render(bookmarks, false)).join('')

    }

    addHandlerRender(handler) {
        window.addEventListener('load', handler);
    }
}

export default new BookmarksView();
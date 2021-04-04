import View from "./view";
import icons from 'url:../../img/icons.svg'

class PaginatinView extends View {
    _parentElement = document.querySelector('.pagination');

    _generateMarkup() {
        const numPages = Math.ceil(this._data.results.length / this._data.resultsPerPage);
        const currentPage = this._data.page;
        let markup = '';
        // Page1, and there are other page
        if (currentPage === 1 && numPages > 1) {
            markup = this.generateMarkupNextPage(currentPage);
        }
        // last page
        if (currentPage === numPages && numPages > 1) {
            markup = this.generateMarkupPreviousPage(currentPage)
        }

        // other page
        if (currentPage > 1 && currentPage < numPages) {
            markup = this.generateMarkupPreviousPage(currentPage).concat(this.generateMarkupNextPage(currentPage));
        }
        // Page1, and no other pages
        // return empty
        return markup;
    }

    generateMarkupPreviousPage(currentPage) {
        return `
            <button data-goto="${currentPage - 1}" class="btn--inline pagination__btn--prev">
                <svg class="search__icon">
                    <use href="${icons}#icon-arrow-left"></use>
                </svg>
                <span>Page ${currentPage - 1}</span>
            </button>
        `;
    }

    generateMarkupNextPage(currentPage) {
        return `
        <button data-goto="${currentPage + 1}" class="btn--inline pagination__btn--next">
            <span>Page ${currentPage + 1}</span>
            <svg class="search__icon">
                <use href="${icons}#icon-arrow-right"></use>
            </svg>
        </button>
        `;
    }

    addHandlerClick = function (handler) {
        this._parentElement.addEventListener('click', function (e) {
            const btnEl = e.target.closest('.btn--inline');
            if (!btnEl) return;

            console.log(btnEl);
            const goToPage = +btnEl.dataset.goto;
            console.log(goToPage);
            handler(goToPage);
        })
    }
}
export default new PaginatinView();



import icons from "url:../../img/icons.svg"; // Parcel 2

// PARENT CLASS
export default class View {
  _data;

  /**
   * Render the received object to the DOM
   * @param {Object | Object[]} data The data to be rendered (e.g. recipe)
   * @param {boolean} [render=true] If false, create markup string instead of rendering to the DOM
   * @returns {undefined | string} A markup string is returned if render=false
   * @this {Object} View instance
   * @author Lukas Ballay
   * @todo Finish implementation
   */
  // RENDER
  render(data, render = true) {
    // Render error message
    if (!data || (Array.isArray(data) && data.length === 0))
      return this.renderError();

    // Data
    this._data = data;

    // Render HTML
    const markup = this._generateMarkup();

    if (!render) return markup;

    this._clear();
    this._parentElement.insertAdjacentHTML("afterbegin", markup);
  }

  // UPDATE
  update(data) {
    // Data
    this._data = data;

    // Render HTML
    const newMarkup = this._generateMarkup();

    // Create Virtual DOM
    const newDOM = document.createRange().createContextualFragment(newMarkup);
    // New elements
    const newElements = Array.from(newDOM.querySelectorAll("*"));
    // Current elements
    const curElements = Array.from(this._parentElement.querySelectorAll("*"));

    // Compare elements
    newElements.forEach((newEl, i) => {
      const curEl = curElements[i];
      // console.log(curEl, newEl.isEqualNode(curEl));

      // Updates changed TEXT
      if (
        !newEl.isEqualNode(curEl) &&
        newEl.firstChild?.nodeValue.trim() !== ""
      ) {
        // console.log("💥", newEl.firstChild?.nodeValue.trim());
        curEl.textContent = newEl.textContent;
      }

      // Updates changed ATTRIBUTES
      if (!newEl.isEqualNode(curEl))
        Array.from(newEl.attributes).forEach(attr =>
          curEl.setAttribute(attr.name, attr.value)
        );
    });
  }

  // CLEAR
  _clear() {
    this._parentElement.innerHTML = "";
  }

  // RENDER SPINNER
  renderSpinner() {
    // HTML
    const markup = `
      <div class="spinner">
        <svg>
          <use href="${icons}#icon-loader"></use>
        </svg>
      </div>
  `;

    this._clear();
    this._parentElement.insertAdjacentHTML("afterbegin", markup);
  }

  // RENDER ERROR MESSAGE
  renderError(message = this._errorMessage) {
    const markup = `
      <div class="error">
        <div>
          <svg>
            <use href="${icons}#icon-alert-triangle"></use>
          </svg>
        </div>
        <p>${message}</p>
      </div>
    `;

    this._clear();
    this._parentElement.insertAdjacentHTML("afterbegin", markup);
  }

  // RENDER SUCCESS MESSAGE
  renderMessage(message = this._message) {
    const markup = `
      <div class="message">
        <div>
          <svg>
            <use href="${icons}#icon-smile"></use>
          </svg>
        </div>
        <p>${message}</p>
      </div>
    `;

    this._clear();
    this._parentElement.insertAdjacentHTML("afterbegin", markup);
  }
}

class SearchView {
  _parentEl = document.querySelector(".search");

  // ADD HANDLER SEARCH
  addHandlerSearch(handler) {
    this._parentEl.addEventListener("submit", function (e) {
      e.preventDefault();
      handler();
    });
  }

  // GET SEARCH QUERY
  getQuery() {
    const query = this._parentEl.querySelector(".search__field").value;
    this._clearInput();
    return query;
  }

  // CLEAR INPUT FIELD
  _clearInput() {
    this._parentEl.querySelector(".search__field").value = "";
  }
}

export default new SearchView();

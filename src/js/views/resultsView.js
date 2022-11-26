import View from "./View.js";
import previewView from "./previewView.js";

// CHILD CLASS
class ResultsView extends View {
  _parentElement = document.querySelector(".results");
  _errorMessage = "No recipes found for your query! Please try again ;)";
  _message = "";

  // GENERATE MARKUP (HTML)
  _generateMarkup() {
    return this._data.map(result => previewView.render(result, false)).join("");
  }
}

export default new ResultsView();

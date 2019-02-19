import Base from '../Base.js';

class ChooseDBDialog extends Base {
  constructor() {
    super(__dirname);
  }

  _ready(shadowDom) {
    this._dialog = shadowDom.querySelector('custom-dialog');
    this._okBtn = shadowDom.querySelector('#ok');
    this._cancelBtn = shadowDom.querySelector('#cancel');
    this._typeSelect = shadowDom.querySelector('select');
    this._okBtn.addEventListener('click', () => {
      const selectedValue = this._typeSelect.options[this._typeSelect.selectedIndex].value;
      this._resultResolve(selectedValue);
      this._dialog.close();
    });
    this._cancelBtn.addEventListener('click', () => {
      this._dialog.close();
      this._resultResolve(null);
    });
  }

  getDbType() {
    this._dialog.open();
    this._resultPromise = new Promise((resolve, reject) => {
      this._resultResolve = resolve;
    });

    return this._resultPromise;
  }
}

customElements.define('choose-db-dialog', ChooseDBDialog);

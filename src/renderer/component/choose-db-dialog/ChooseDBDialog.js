import template from './template.js';

class ChooseDBDialog extends HTMLElement {
  constructor() {
    super();

    const shadowDom = this.attachShadow({
      mode: 'open'
    });
    shadowDom.innerHTML = template;

    this._ready(shadowDom);
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

import template from './template.js';

class CustomDialog extends HTMLElement {
  constructor() {
    super();

    const shadowDom = this.attachShadow({
      mode: 'open'
    });
    shadowDom.innerHTML = template;

    this._ready(shadowDom);
  }

  _ready(shadowDom) {
    this._dialog = shadowDom.querySelector('.dialog');
  }

  open() {
    this._dialog.style.display = 'block';
  }

  close() {
    this._dialog.style.display = 'none';
  }
}

customElements.define('custom-dialog', CustomDialog);

import template from './template.js';
import {loadFile} from '../../operations.js';

class WelcomeDialogComponent extends HTMLElement {
  constructor() {
    super();

    const shadowDom = this.attachShadow({
      mode: 'open'
    });
    shadowDom.innerHTML = template;

    this._ready(shadowDom);
  }

  _ready(shadowDom) {
    this._newFile = shadowDom.querySelector('#new-file');
    this._openFile = shadowDom.querySelector('#open-file');

    this._newFile.addEventListener('click', () => {
      loadFile();
    });
    this._openFile.addEventListener('click', () => {});
  }
}

customElements.define('table-dialog', WelcomeDialogComponent);

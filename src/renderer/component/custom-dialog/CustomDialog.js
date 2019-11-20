import Base from '../Base';

class CustomDialog extends Base {
  constructor() {
    super(__dirname);
  }

  ready(shadowDom) {
    this._dialog = shadowDom.querySelector('.dialog');
  }

  open() {
    this._isOpen = true;
    this._dialog.style.display = 'flex';
  }

  close() {
    this._isOpen = false;
    this._dialog.style.display = 'none';
  }

  isOpen() {
    return this._isOpen;
  }
}

customElements.define('custom-dialog', CustomDialog);

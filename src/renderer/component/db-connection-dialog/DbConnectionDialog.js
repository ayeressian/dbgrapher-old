import template from './template.js';
import {defaults} from 'pg';

class DbConnectionDialog extends HTMLElement {
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
    this._cancelBtn = shadowDom.querySelector('#cancel');
    this._connectBtn = shadowDom.querySelector('#connect');
    this._dbTypeSelect = shadowDom.querySelector('#db_type');
    this._userInput = shadowDom.querySelector('#user');
    this._passwordInput = shadowDom.querySelector('#password');
    this._databaseInput = shadowDom.querySelector('#database');
    this._hostInput = shadowDom.querySelector('#host');
    this._portInput = shadowDom.querySelector('#port');

    this._cancelBtn.addEventListener('click', (event) => {
      this._dialog.close();
    });

    this._connectBtn.addEventListener('click', (event) => {
      this._dialog.close();
      this._resultResolve(this._collectData());
    });
  }

  isOpen() {
    return this._dialog.isOpen();
  }

  _collectData() {
    return {
      user: this._userInput.value,
      password: this._passwordInput.value,
      database: this._databaseInput.value,
      host: this._hostInput.value,
      port: this._portInput.value
    };
  }

  _reset() {
    this._userInput.value = defaults.user;
    this._passwordInput.value = defaults.password;
    this._databaseInput.value = defaults.database;
    this._hostInput.value = defaults.host;
    this._portInput.value = defaults.port;
  }

  getConnectionInfo() {
    this._reset();
    this._dialog.open();
    this._resultPromise = new Promise((resolve, reject) => {
      this._resultResolve = resolve;
    });

    return this._resultPromise;
  }
}

customElements.define('db-connection-dialog', DbConnectionDialog);

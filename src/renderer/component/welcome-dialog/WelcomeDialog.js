import template from './template.js';
import fileOpenSetup from '../../file_open_setup.js';
import {loadFromFilePath} from '../../file_open_setup.js';

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
    this._dialog = shadowDom.querySelector('custom-dialog');
    this._chooseDbDialog = shadowDom.querySelector('choose-db-dialog');

    if (IS_ELECTRON) {
      this._openFile.addEventListener('click', () => {
        import('electron').then((electron) => {
          const dialog = electron.remote.dialog;
          const mainWindow = electron.remote.getCurrentWindow();
          dialog.showOpenDialog(mainWindow, {
            properties: ['openFile'],
            filters: [{
              name: 'json',
              extensions: ['json']
            }]
          }, (filePaths) => {
            if (filePaths && filePaths.length > 0) {
              loadFromFilePath(filePaths[0], (schema) => {
                this._resultResolve(schema);
                this._dialog.close();
              });
            }
          });
        });
      });
    } else {
      const fileOpenELem = document.getElementById('file_open');
      fileOpenSetup(fileOpenELem, (schema) => {
        this._dialog.close();
        this._resultResolve(schema);
      });
      this._openFile.addEventListener('click', () => {
        fileOpenELem.click();
      });
    }

    this._newFile.addEventListener('click', () => {
      this._dialog.close();
      this._chooseDbDialog.getDbType().then((dbType) => {
        if (dbType == null) {
          this._dialog.open();
          return;
        }
        this._resultResolve({tables: [], dbType});
      });
    });
  }

  isOpen() {
    return this._dialog.isOpen();
  }

  getSchema() {
    this._dialog.open();
    this._resultPromise = new Promise((resolve, reject) => {
      this._resultResolve = resolve;
    });

    return this._resultPromise;
  }
}

customElements.define('welcome-dialog', WelcomeDialogComponent);

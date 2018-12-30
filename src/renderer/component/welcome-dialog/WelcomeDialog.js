import template from './template.js';
import {
  validateJson
} from '../../validate-schema.js';

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
    this._openFile.addEventListener('click', () => {
      if (IS_ELECTRON) {
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
              let schema;
              try {
                schema = window.require(filePaths[0]);
              } catch {
                alert('Selected file doesn\'t contain valid JSON.');
                return;
              }
              const jsonValidation = validateJson(schema);
              if (!jsonValidation) {
                alert('Selected file doesn\'t have correct Db designer file format');
                return;
              }
              this._resultResolve(schema);

              this._dialog.close();
            }
          });
        });
      }
    });
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

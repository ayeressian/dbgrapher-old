import Base from '../Base.js';
import {setupOpenSchema, loadFromFilePath, setupDbScehmaFileOpen} from '../../fileOpenSetup.js';

class WelcomeDialogComponent extends Base {
  constructor() {
    super(__dirname);
  }

  _ready(shadowDom) {
    this._newFile = shadowDom.querySelector('#new-file');
    this._openFile = shadowDom.querySelector('#open-file');
    this._importSqlFile = shadowDom.querySelector('#import-sql-file');
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
      const fileOpenELem = shadowDom.getElementById('file_open');
      const dbSchemaFileOpen = shadowDom.getElementById('db_schema_file_open');
      const setSchema = (schema) => {
        this._dialog.close();
        this._resultResolve(schema);
      };
      setupOpenSchema(fileOpenELem, setSchema);
      this._openFile.addEventListener('click', () => {
        fileOpenELem.click();
      });
      this._importSqlFile.addEventListener('click', () => {
        this._dialog.close();
        this._chooseDbDialog.getDbType().then((dbType) => {
          if (dbType == null) {
            this._dialog.open();
            return;
          }
          setupDbScehmaFileOpen(dbSchemaFileOpen, setSchema, dbType);
          dbSchemaFileOpen.click();
        });
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

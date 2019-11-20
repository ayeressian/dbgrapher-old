import {loadFromFilePath, setupDbScehmaFileOpen, setupOpenSchema} from '../../fileOpenSetup.js';
import Base from '../Base';

class WelcomeDialogComponent extends Base {
  private newFile: any;
  private openFile: any;
  private importSqlFile: any;
  private dialog: any;
  private chooseDbDialog: any;
  private resultPromise: Promise<unknown>;
  private resultResolve: (value?: unknown) => void;

  constructor() {
    super(__dirname);
  }

  public isOpen() {
    return this.dialog.isOpen();
  }

  public getSchema() {
    this.dialog.open();
    this.resultPromise = new Promise((resolve) => {
      this.resultResolve = resolve;
    });

    return this.resultPromise;
  }

  protected ready(shadowDom) {
    this.newFile = shadowDom.querySelector('#new-file');
    this.openFile = shadowDom.querySelector('#open-file');
    this.importSqlFile = shadowDom.querySelector('#import-sql-file');
    this.dialog = shadowDom.querySelector('custom-dialog');
    this.chooseDbDialog = shadowDom.querySelector('choose-db-dialog');

    if (IS_ELECTRON) {
      this.openFile.addEventListener('click', () => {
        import('electron').then((electron) => {
          const dialog = electron.remote.dialog;
          const mainWindow = electron.remote.getCurrentWindow();
          dialog.showOpenDialog(mainWindow, {
            filters: [{
              extensions: ['json'],
              name: 'json',
            }],
            properties: ['openFile'],
          }, (filePaths) => {
            if (filePaths && filePaths.length > 0) {
              loadFromFilePath(filePaths[0], (schema) => {
                this.resultResolve(schema);
                this.dialog.close();
              });
            }
          });
        });
      });
    } else {
      const fileOpenELem = shadowDom.getElementById('file_open');
      const dbSchemaFileOpen = shadowDom.getElementById('db_schema_file_open');
      const setSchema = (schema) => {
        this.dialog.close();
        this.resultResolve(schema);
      };
      setupOpenSchema(fileOpenELem, setSchema);
      this.openFile.addEventListener('click', () => {
        fileOpenELem.click();
      });
      this.importSqlFile.addEventListener('click', () => {
        this.dialog.close();
        this.chooseDbDialog.getDbType().then((dbType) => {
          if (dbType == null) {
            this.dialog.open();
            return;
          }
          setupDbScehmaFileOpen(dbSchemaFileOpen, setSchema, () => Promise.resolve(dbType));
          dbSchemaFileOpen.click();
        });
      });
    }

    this.newFile.addEventListener('click', () => {
      this.dialog.close();
      this.chooseDbDialog.getDbType().then((dbType) => {
        if (dbType == null) {
          this.dialog.open();
          return;
        }
        this.resultResolve({tables: [], dbType});
      });
    });
  }
}

customElements.define('welcome-dialog', WelcomeDialogComponent);

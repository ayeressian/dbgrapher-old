import 'db-viewer-component';
import 'menu-bar-component';

import './component/choose-db-dialog/ChooseDBDialog.js';
import './component/custom-dialog/CustomDialog.js';
import './component/side-panel/SidePanel.js';
import './component/table-dialog-component/TableDialogComponent.js';
import './component/welcome-dialog/WelcomeDialog.ts';
import './globals.d';
import './style.css';

import UndoRedo from './UndoRedo';

if (IS_ELECTRON) {
  import('./component/db-connection-dialog/DbConnectionDialog.js');
}

class App {
  private undoRedo: UndoRedo;
  private isMac: boolean;
  private isCreateTable: boolean;
  private isCreateRelation: boolean;
  private dbViewer: any;
  private sidePanel: any;
  private tableDialogElem: any;
  private welcomeDialog: any;
  private mainContainer: any;
  private chooseDbDialog: any;

  constructor() {
    window.addEventListener('load', this.ready.bind(this));
    this.undoRedo = new UndoRedo();
    this.isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

    this.isCreateTable = false;
    this.isCreateRelation = false;
  }

  private ready() {
    this.dbViewer = document.querySelector('db-viewer');
    this.sidePanel = document.querySelector('side-panel');
    this.tableDialogElem = document.querySelector('table-dialog');
    this.welcomeDialog = document.querySelector('welcome-dialog');
    this.mainContainer = document.querySelector('.main_container');
    this.chooseDbDialog = document.querySelector('choose-db-dialog');

    this.mainContainer.style.visibility = 'hidden';
    this.welcomeDialog.getSchema().then((schema) => {
      this.mainContainer.style.visibility = 'visible';
      this.setSchemaWithHistoryUpdate(schema);
    });

    this.menuSetup();

    this.setupEvents();
  }

  private setSchemaWithHistoryUpdate(schema) {
    if (!schema.dbType) {
      this.chooseDbDialog.getDbType().then((type) => {
        if (type) {
          schema.dbType = type;
          this.undoRedo.addState(schema);
          this.dbViewer.schema = schema;
        }
      });
    } else {
      this.undoRedo.addState(schema);
      this.dbViewer.schema = schema;
    }
  }

  private menuSetup() {
    if (IS_ELECTRON) {
      import('./elMenu.js').then((module) => {
        module.default(() => this.dbViewer.schema, this.setSchemaWithHistoryUpdate.bind(this));
      });
    } else {
      import('./menu.js').then((module) => {
        module.default(() => this.dbViewer.schema, this.setSchemaWithHistoryUpdate.bind(this));
      });
    }
  }

  private createRelation(from, to) {
    const schema = this.dbViewer.schema;
    const fromTable = schema.tables.find((table) => table.name === from);
    const toTable = schema.tables.find((table) => table.name === to);

    const fromPks = fromTable.columns.filter((column) => column.pk === true);
    fromPks.forEach((fromPk) => {
      let columnName;
      let counter = 0;

      do {
        if (counter === 0) {
          columnName = `fk_${fromTable.name}_${fromPk.name}`;
        } else {
          columnName = `fk_${fromTable.name}_${fromPk.name}_${counter}`;
        }
        counter++;
      } while (toTable.columns.find((column) => column.name === columnName));

      toTable.columns.push({
        fk: {
          column: fromPk.name,
          table: fromTable.name,
        },
        name: columnName,
        required: true,
      });
    });
    schema.viewport = 'noChange';
    this.setSchemaWithHistoryUpdate(schema);
  }

  private doubleClickEventHandler(event) {
    this.tableDialogElem.openEdit(this.dbViewer.schema, event.detail).then((schema) => {
      if (schema) {
        schema.viewport = 'noChange';
        this.setSchemaWithHistoryUpdate(schema);
      }
    });
  }

  private setupEvents() {
    document.addEventListener('keydown', (event) => {
      if (!this.tableDialogElem.isOpen() && !this.welcomeDialog.isOpen()) {
        let schema;
        if (event.metaKey && event.keyCode === 90 && this.isMac) {
          if (event.shiftKey) {
            schema = this.undoRedo.redo();
          } else {
            schema = this.undoRedo.undo();
          }
        }
        if (event.ctrlKey && !this.isMac) {
          if (event.keyCode === 90) {
            schema = this.undoRedo.undo();
          } else if (event.keyCode === 89) {
            schema = this.undoRedo.redo();
          }
        }
        if (schema) {
          schema.viewport = 'noChange';
          this.dbViewer.schema = schema;
        }
      }
    });

    this.dbViewer.addEventListener('tableMoveEnd', () => {
      if (!this.isCreateTable && !this.isCreateRelation) {
        this.undoRedo.addState(this.dbViewer.schema);
      }
    });

    this.doubleClickEventHandler = this.doubleClickEventHandler.bind(this);
    this.dbViewer.addEventListener('tableDblClick', this.doubleClickEventHandler);

    let firstClick;
    let from;

    const tableClickHandler = (event) => {
      if (firstClick) {
        from = event.detail.name;
        firstClick = false;
      } else {
        const to = event.detail.name;
        firstClick = true;
        this.createRelation(from, to);
        this.isCreateRelation = false;
        this.dbViewer.removeEventListener('tableClick', tableClickHandler);
        setTimeout(() => {
          this.dbViewer.addEventListener('tableDblClick', this.doubleClickEventHandler);
          this.dbViewer.disableTableMovement = false;
        });
        this.sidePanel.selectNone();
      }
    };

    const createTableHandler = (event) => {
      this.tableDialogElem.openCreate(this.dbViewer.schema, event.detail).then((schema) => {
        this.dbViewer.removeEventListener('viewportClick', createTableHandler);
        this.isCreateTable = false;
        this.sidePanel.selectNone();
        if (schema) {
          schema.viewport = 'noChange';
          this.setSchemaWithHistoryUpdate(schema);
        }
      });
    };

    this.sidePanel.addEventListener('change', (event) => {
      if (event.detail.selectedAction === 'createTable') {
        this.isCreateTable = true;
        this.isCreateRelation = false;
        this.dbViewer.removeEventListener('tableClick', tableClickHandler);
        this.dbViewer.addEventListener('viewportClick', createTableHandler);
      } else if (event.detail.selectedAction === 'createRelation') {
        this.dbViewer.disableTableMovement = true;
        this.isCreateRelation = true;
        this.isCreateTable = false;
        this.dbViewer.removeEventListener('viewportClick', this.createTableHandler);
        firstClick = true;
        this.dbViewer.removeEventListener('tableDblClick', this.doubleClickEventHandler);
        this.dbViewer.addEventListener('tableClick', tableClickHandler);
      } else {
        this.dbViewer.addEventListener('tableDblClick', this.doubleClickEventHandler);
        this.dbViewer.removeEventListener('viewportClick', createTableHandler);
        this.dbViewer.removeEventListener('tableClick', tableClickHandler);
        this.dbViewer.disableTableMovement = false;
        this.isCreateRelation = false;
      }
    });
  }
  private createTableHandler() {
    throw new Error('Method not implemented.');
  }
}

// tslint:disable-next-line: no-unused-expression
new App();

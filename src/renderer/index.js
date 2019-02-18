import 'menu-bar-component';
import 'db-viewer-component';
import './component/custom-dialog/CustomDialog.js';
import './component/table-dialog-component/TableDialogComponent.js';
import './component/welcome-dialog/WelcomeDialog.js';
import './style.css';
import './component/choose-db-dialog/ChooseDBDialog.js';
import UndoRedo from './UndoRedo';

if (IS_ELECTRON) {
  import('./component/db-connection-dialog/DbConnectionDialog.js');
}

const types = [
  'int', 'string'
];


class App {
  constructor() {
    window.addEventListener('load', this._ready.bind(this));
    this._undoRedo = new UndoRedo();
    this._isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

    this._isCreateTable = false;
    this._isCreateRelation = false;
  }

  _ready() {
    this._dbViewer = document.querySelector('db-viewer');
    this._createTableBtn = document.querySelector('.create_table');
    this._createRelationBtn = document.querySelector('.create_relation');
    this._tableDialogElem = document.querySelector('table-dialog');
    this._welcomeDialog = document.querySelector('welcome-dialog');
    this._mainContainer = document.querySelector('.main_container');

    this._tableDialogElem.types = types;

    this._mainContainer.style.visibility = 'hidden';
    this._welcomeDialog.getSchema().then((schema) => {
      this._mainContainer.style.visibility = 'visible';
      this._setSchemaWithHistoryUpdate(schema);
    });

    this._menuSetup();

    this._setupEvents();
  }

  _setSchemaWithHistoryUpdate(schema) {
    this._undoRedo.addState(schema);
    this._dbViewer.schema = schema;
  }

  _menuSetup() {
    if (IS_ELECTRON) {
      import('./el-menu.js').then((module) => {
        module.default(() => this._dbViewer.schema, this._setSchemaWithHistoryUpdate);
      });
    } else {
      import('./menu.js').then((module) => {
        module.default(() => this._dbViewer.schema, this._setSchemaWithHistoryUpdate);
      });
    }
  }

  _createRelation(from, to) {
    const schema = this._dbViewer.schema;
    const fromTable = schema.tables.find((table) => table.name == from);
    const toTable = schema.tables.find((table) => table.name == to);

    const fromPks = fromTable.columns.filter((column) => column.pk == true);
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
        name: columnName,
        required: true,
        fk: {
          table: fromTable.name,
          column: fromPk.name
        }
      });
    });
    this._setSchemaWithHistoryUpdate(schema);
  }

  _setupEvents() {
    document.addEventListener('keydown', (event) => {
      if (!this._tableDialogElem.isOpen() && !this._welcomeDialog.isOpen()) {
        let schema;
        if (event.metaKey && event.keyCode === 90 && this._isMac) {
          if (event.shiftKey) {
            console.log('redo');
            schema = this._undoRedo.redo();
          } else {
            console.log('undo');
            schema = this._undoRedo.undo();
          }
        }
        if (event.ctrlKey && !this._isMac) {
          if (event.keyCode === 90) {
            schema = this._undoRedo.undo();
          } else if (event.keyCode === 89) {
            schema = this._undoRedo.redo();
          }
        }
        if (schema) {
          this._dbViewer.schema = schema;
        }
      }
    });

    this._dbViewer.addEventListener('tableMoveEnd', () => {
      if (!this._isCreateTable && !this._isCreateRelation) {
        this._undoRedo.addState(this._dbViewer.schema);
      }
    });

    this._dbViewer.addEventListener('tableDblClick', (event) => {
      this._tableDialogElem.openEdit(this._dbViewer.schema, event.detail).then((schema) => {
        if (schema) {
          this._setSchemaWithHistoryUpdate(schema);
        }
      });
    });

    let firstClick;
    let from;

    const tableClickHandler = (event) => {
      if (firstClick) {
        from = event.detail.name;
        firstClick = false;
      } else {
        const to = event.detail.name;
        firstClick = true;
        this._createRelation(from, to);
        this._createRelationBtn.classList.remove('active');
        this._isCreateRelation = false;
        this._dbViewer.removeEventListener('tableClick', tableClickHandler);
      }
    };

    this._createRelationBtn.addEventListener('click', () => {
      this._createRelationBtn.classList.toggle('active');
      if (this._createRelationBtn.classList.contains('active')) {
        this._isCreateRelation = true;
        this._createTableBtn.classList.remove('active');
        this._isCreateTable = false;
        this._dbViewer.removeEventListener('viewportClick', this._createTableHandler);
        firstClick = true;
        this._dbViewer.addEventListener('tableClick', tableClickHandler);
      } else {
        this._dbViewer.removeEventListener('tableClick', tableClickHandler);
      }
    });

    const createTableHandler = (event) => {
      this._tableDialogElem.openCreate(this._dbViewer.schema, event.detail).then((result) => {
        this._dbViewer.removeEventListener('viewportClick', createTableHandler);
        this._createTableBtn.classList.remove('active');
        this._isCreateTable = false;
        if (result) {
          this._setSchemaWithHistoryUpdate(result);
        }
      });
    };

    this._createTableBtn.addEventListener('click', () => {
      this._createTableBtn.classList.toggle('active');
      if (this._createTableBtn.classList.contains('active')) {
        this._isCreateTable = true;
        this._createRelationBtn.classList.remove('active');
        this._isCreateRelation = false;
        this._dbViewer.removeEventListener('tableClick', tableClickHandler);
        this._dbViewer.addEventListener('viewportClick', createTableHandler);
      } else {
        this._dbViewer.removeEventListener('viewportClick', createTableHandler);
      }
    });
  }
}

new App();

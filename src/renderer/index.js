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

const undoRedo = new UndoRedo();

window.addEventListener('load', () => {
  const dbViewer = document.querySelector('db-viewer');
  const createTableBtn = document.querySelector('.create_table');
  const createRelationBtn = document.querySelector('.create_relation');
  const tableDialogElem = document.querySelector('table-dialog');
  const welcomeDialog = document.querySelector('welcome-dialog');
  const mainContainer = document.querySelector('.main_container');

  const setSchemaWithHistoryUpdate = (schema) => {
    undoRedo.addState(schema);
    dbViewer.schema = schema;
  };

  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  document.addEventListener('keydown', (event) => {
    if (!tableDialogElem.isOpen() && !welcomeDialog.isOpen()) {
      let schema;
      if (event.metaKey && event.keyCode === 90 && isMac) {
        if (event.shiftKey) {
          console.log('redo');
          schema = undoRedo.redo();
        } else {
          console.log('undo');
          schema = undoRedo.undo();
        }
      }
      if (event.ctrlKey && !isMac) {
        if (event.keyCode === 90) {
          schema = undoRedo.undo();
        } else if (event.keyCode === 89) {
          schema = undoRedo.redo();
        }
      }
      if (schema) {
        dbViewer.schema = schema;
      }
    }
  }, false);

  tableDialogElem.types = types;

  let isCreateTable = false;
  let isCreateRelation = false;

  dbViewer.addEventListener('tableMoveEnd', () => {
    if (!isCreateTable && !isCreateRelation) {
      undoRedo.addState(dbViewer.schema);
    }
  });

  dbViewer.addEventListener('tableDblClick', (event) => {
    tableDialogElem.openEdit(dbViewer.schema, event.detail).then((schema) => {
      if (schema) {
        setSchemaWithHistoryUpdate(schema);
      }
    });
  });

  if (IS_ELECTRON) {
    import('./el-menu.js').then((module) => {
      module.default(() => dbViewer.schema, setSchemaWithHistoryUpdate);
    });
  } else {
    import('./menu.js').then((module) => {
      module.default(() => dbViewer.schema, setSchemaWithHistoryUpdate);
    });
  }
  mainContainer.style.visibility = 'hidden';
  welcomeDialog.getSchema().then((schema) => {
    mainContainer.style.visibility = 'visible';
    setSchemaWithHistoryUpdate(schema);
  });

  const createRelation = (from, to) => {
    const schema = dbViewer.schema;
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
    setSchemaWithHistoryUpdate(schema);
  };

  let firstClick;
  let from;
  function tableClickHandler(event) {
    if (firstClick) {
      from = event.detail.name;
      firstClick = false;
    } else {
      const to = event.detail.name;
      firstClick = true;
      createRelation(from, to);
      createRelationBtn.classList.remove('active');
      isCreateRelation = false;
      dbViewer.removeEventListener('tableClick', tableClickHandler);
    }
  }
  createRelationBtn.addEventListener('click', () => {
    createRelationBtn.classList.toggle('active');
    if (createRelationBtn.classList.contains('active')) {
      isCreateRelation = true;
      createTableBtn.classList.remove('active');
      isCreateTable = false;
      dbViewer.removeEventListener('viewportClick', createTableHandler);
      firstClick = true;
      dbViewer.addEventListener('tableClick', tableClickHandler);
    } else {
      dbViewer.removeEventListener('tableClick', tableClickHandler);
    }
  });


  function createTableHandler(event) {
    tableDialogElem.openCreate(dbViewer.schema, event.detail).then((result) => {
      dbViewer.removeEventListener('viewportClick', createTableHandler);
      createTableBtn.classList.remove('active');
      isCreateTable = false;
      if (result) {
        setSchemaWithHistoryUpdate(result);
      }
    });
  }
  createTableBtn.addEventListener('click', () => {
    createTableBtn.classList.toggle('active');
    if (createTableBtn.classList.contains('active')) {
      isCreateTable = true;
      createRelationBtn.classList.remove('active');
      isCreateRelation = false;
      dbViewer.removeEventListener('tableClick', tableClickHandler);
      dbViewer.addEventListener('viewportClick', createTableHandler);
    } else {
      dbViewer.removeEventListener('viewportClick', createTableHandler);
    }
  });
});

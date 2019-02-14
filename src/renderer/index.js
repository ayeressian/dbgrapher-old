import 'menu-bar-component';
import 'db-viewer-component';
import './component/custom-dialog/CustomDialog.js';
import './component/table-dialog-component/TableDialogComponent.js';
import './component/welcome-dialog/WelcomeDialog.js';
import './style.css';
import './component/choose-db-dialog/ChooseDBDialog.js';

if (IS_ELECTRON) {
  import('./component/db-connection-dialog/DbConnectionDialog.js');
}

const types = [
  'int', 'string'
];

window.addEventListener('load', () => {
  const dbViewer = document.querySelector('db-viewer');
  const createTableBtn = document.querySelector('.create_table');
  const createRelationBtn = document.querySelector('.create_relation');
  const tableDialogElem = document.querySelector('table-dialog');
  const welcomeDialog = document.querySelector('welcome-dialog');
  const mainContainer = document.querySelector('.main_container');

  tableDialogElem.types = types;

  function setSchema(schema) {
    dbViewer.schema = schema;
  }

  dbViewer.addEventListener('tableDblClick', (event) => {
    tableDialogElem.openEdit(dbViewer.schema, event.detail).then((result) => setSchema(result));
  });

  if (IS_ELECTRON) {
    import('./el-menu.js').then((module) => {
      module.default(() => dbViewer.schema, setSchema);
    });
  } else {
    import('./menu.js').then((module) => {
      module.default(() => dbViewer.schema, setSchema);
    });
  }
  mainContainer.style.visibility = 'hidden';
  welcomeDialog.getSchema().then((schema) => {
    mainContainer.style.visibility = 'visible';
    setSchema(schema);
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
    dbViewer.schema = schema;
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
      dbViewer.removeEventListener('tableClick', tableClickHandler);
    }
  }
  createRelationBtn.addEventListener('click', () => {
    createRelationBtn.classList.toggle('active');
    if (createRelationBtn.classList.contains('active')) {
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
      if (result) {
        setSchema(result);
      }
    });
  }
  createTableBtn.addEventListener('click', () => {
    createTableBtn.classList.toggle('active');
    if (createTableBtn.classList.contains('active')) {
      dbViewer.addEventListener('viewportClick', createTableHandler);
    } else {
      dbViewer.removeEventListener('viewportClick', createTableHandler);
    }
  });
});

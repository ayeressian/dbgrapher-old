import 'menu-bar-component';
import 'db-viewer-component';
import './component/table-dialog-component/TableDialogComponent.js';
import 'normalize.css';
import './style.css';
import {
  isElectron
} from './util';

// if ('serviceWorker' in navigator) {
//   navigator.serviceWorker
//     .register('../service-worker.js')
//     .then(() => console.log('Service Worker Registered'));
// }

const types = [
  'int', 'string'
];

document.addEventListener('DOMContentLoaded', () => {
  const dbDesignerElem = document.querySelector('db-designer');
  const createTableBtn = document.querySelector('.create_table');
  // const createRelationBtn = document.querySelector('.create_relation');
  const tableDialogElem = document.querySelector('table-dialog');

  tableDialogElem.types = types;

  let currentSchema = {tables: []};

  function setSchema(schema) {
    currentSchema = JSON.parse(JSON.stringify(schema));
    dbDesignerElem.schema = schema;
  }

  dbDesignerElem.addEventListener('tableDblClick', (event) => {
    tableDialogElem.open(currentSchema, event.detail).then((result) => {
      setSchema(result);
    });
  });

  dbDesignerElem.addEventListener('click', (event) => {
    // const cord = getDbDesignerClickCords(event);
  });


  dbDesignerElem.addEventListener('tableMove', (event) => {
    const table = currentSchema.tables.find((table) => table.name === event.detail.name);
    if (table.pos == null) {
      table.pos = {};
    }
    table.pos.x = event.detail.pos.x;
    table.pos.y = event.detail.pos.y;
  });

  createTableBtn.addEventListener('click', () => {
    tableDialogElem.open(currentSchema).then((result) => {
      if (result) {
        setSchema(result);
      }
    });
  });

  if (isElectron) {
    import('./el-menu').then((module) => {
      module.default(() => currentSchema, setSchema);
    });
  } else {
    import('./menu').then((module) => {
      module.default(() => currentSchema, setSchema);
    });
  }
});

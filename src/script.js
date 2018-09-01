if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('../service-worker.js')
    .then(() => console.log('Service Worker Registered'));
}

const types = [
  'int', 'string'
];

document.addEventListener('DOMContentLoaded', () => {
  const dbDesignerElem = document.querySelector('db-designer');
  const fileOpenElem = document.getElementById('file_open');
  const createTableBtn = document.querySelector('.create_table');
  const createRelationBtn = document.querySelector('.create_relation');
  const tableDialogElem = document.querySelector('table-dialog');
  const menuBarElem = document.querySelector('menu-bar');

  tableDialogElem.types = types;

  let currentSchema;

  function getDbDesignerClickCords(event) {
    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return {x, y};
  }

  menuBarElem.config = {
    items: [
      {
        id: 'file',
        title: 'File',
        items: [
          {
            id: 'open',
            title: 'Open'
          },
          {
            id: 'save',
            title: 'Save'
          }
        ]
      },
      {
        id: 'help',
        title: 'Help',
        items: [
          {
            id: 'about',
            title: 'About'
          }
        ]
      }
    ]
  };

  function setSchema(schema) {
    currentSchema = JSON.parse(JSON.stringify(schema));
    dbDesignerElem.schema = schema;
  }

  fileOpenElem.addEventListener('change', (event) => {
    const reader = new FileReader();
    reader.readAsText(event.target.files[0]);
    reader.onload = (event) => {
      const schema = JSON.parse(event.target.result);
      setSchema(schema);
    };
  });

  menuBarElem.addEventListener('select', (event) => {
    switch (event.detail) {
      case 'open':
        fileOpenElem.click();
        break;
    }
  });

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
});

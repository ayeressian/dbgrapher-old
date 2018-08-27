if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('../service-worker.js')
    .then(() => console.log('Service Worker Registered'));
}

const types = [
  'int', 'string'
];

function cloneObject(obj) {
  const clone = {};
  for (const i in obj) {
      if (obj[i] != null && typeof(obj[i]) == 'object') {
          clone[i] = cloneObject(obj[i]);
      } else {
        clone[i] = obj[i];
      }
  }
  return clone;
}

document.addEventListener('DOMContentLoaded', () => {
  const dbDesigner = document.querySelector('db-designer');
  const fileOpenElem = document.getElementById('file_open');
  const createEditDialog = document.getElementById('create_edit_dialog');
  const createTableBtn = document.querySelector('.create_table');
  const createRelationBtn = document.querySelector('.create_relation');
  const menuBar = document.querySelector('menu-bar');
  const dialogTitle = document.querySelector('#dialog_title');
  const dialogNameInput = document.querySelector('#name_input');
  const dialogColumns = document.querySelector('#columns');
  const dialogFkColumns = document.querySelector('#fk_columns');
  const createEditBtn = document.querySelector('#create_edit_button');

  let currentSchema;

  function getDbDesignerClickCords(event) {
    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return {x, y};
  }

  menuBar.config = {
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

  fileOpenElem.addEventListener('change', (event) => {
    const reader = new FileReader();
    reader.readAsText(event.target.files[0]);
    reader.onload = (event) => {
      const schema = JSON.parse(event.target.result);
      // currentSchema = cloneObject(schema);
      currentSchema = JSON.parse(JSON.stringify(schema));
      dbDesigner.schema = schema;
      console.log(currentSchema);

    };
  });

  menuBar.addEventListener('select', (event) => {
    switch (event.detail) {
      case 'open':
        fileOpenElem.click();
        break;
    }
  });

  function onForeignTableSelectChange(foreignTableSelect, foreignColumnSelect) {
    const columns = currentSchema.tables.find((table) => table.name === foreignTableSelect.value).columns;
    foreignColumnSelect.innerHTML = '';
    columns.forEach((column) => {
      if (!column.fk) {
        const tableColumnNameOption = document.createElement('option');
        tableColumnNameOption.setAttribute('value', column.name);
        tableColumnNameOption.innerHTML = column.name;
        foreignColumnSelect.appendChild(tableColumnNameOption);
      }
    });
  }

  function clearCreateEditDialog() {
    dialogColumns.innerHTML = '';
    dialogFkColumns.innerHTML = '';
    dialogNameInput.value = '';
  }

  dbDesigner.addEventListener('tableDblClick', (event) => {
    clearCreateEditDialog();
    dialogTitle.innerHTML = 'Edit Table';
    createEditBtn.innerHTML = 'Done';
    const table = event.detail;
    const schemaTable = currentSchema.tables.find((schemaTable) => schemaTable.name === table.name);
    console.log(schemaTable);

    dialogNameInput.value = schemaTable.name;
    schemaTable.columns.forEach((column) => {
      const tr = document.createElement('tr');
      const columnNameTd = document.createElement('td');
      const columnNameInput = document.createElement('input');
      columnNameInput.value = column.name;
      columnNameTd.appendChild(columnNameInput);
      tr.appendChild(columnNameTd);

      const pkTd = document.createElement('td');
      const pkCheckbox = document.createElement('input');
      pkCheckbox.setAttribute('type', 'checkbox');
      pkCheckbox.checked = column.pk;
      pkTd.appendChild(pkCheckbox);

      const removeTd = document.createElement('td');
      const removeBtn = document.createElement('button');
      removeBtn.innerHTML = 'Remove';
      removeTd.appendChild(removeBtn);

      if (column.fk) {
        tr.appendChild(pkTd);

        const foreignTableTd = document.createElement('td');
        const foreignTableSelect = document.createElement('select');
        currentSchema.tables.forEach((table) => {
          const tableNameOption = document.createElement('option');
          tableNameOption.setAttribute('value', table.name);
          tableNameOption.innerHTML = table.name;
          foreignTableSelect.appendChild(tableNameOption);
        });
        foreignTableSelect.value = column.fk.table;
        foreignTableTd.appendChild(foreignTableSelect);
        tr.appendChild(foreignTableTd);

        const foreignColumnTd = document.createElement('td');
        const foreignColumnSelect = document.createElement('select');
        foreignColumnTd.appendChild(foreignColumnSelect);
        tr.appendChild(foreignColumnTd);

        onForeignTableSelectChange(foreignTableSelect, foreignColumnSelect);
        foreignTableSelect.addEventListener('change', () => {
          onForeignTableSelectChange(foreignTableSelect, foreignColumnSelect);
        });

        tr.appendChild(removeTd);
        dialogFkColumns.appendChild(tr);
      } else {
        const typeTd = document.createElement('td');
        const typeSelect = document.createElement('select');

        types.forEach((type) => {
          const typeOption = document.createElement('option');
          typeOption.innerHTML = type;
          typeOption.setAttribute('value', type);
          typeSelect.appendChild(typeOption);
        });

        if (column.type) {
          typeSelect.value = column.type;
        }

        typeTd.appendChild(typeSelect);
        tr.appendChild(typeTd);

        tr.appendChild(pkTd);

        tr.appendChild(removeTd);

        dialogColumns.appendChild(tr);
      }
    });
    createEditDialog.showModal();
  });

  dbDesigner.addEventListener('click', (event) => {
    // const cord = getDbDesignerClickCords(event);
  });

  createTableBtn.addEventListener('click', () => {
    clearCreateEditDialog();
    dialogTitle.innerHTML = 'Create Table';
    createEditBtn.innerHTML = 'Create';
    createEditDialog.showModal();
  });
});

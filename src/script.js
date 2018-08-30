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
  const createEditDialogElem = document.getElementById('create_edit_dialog');
  const createTableBtn = document.querySelector('.create_table');
  const createRelationBtn = document.querySelector('.create_relation');
  const menuBarElem = document.querySelector('menu-bar');
  const dialogTitleElem = document.querySelector('#create_edit_dialog #dialog_title');
  const dialogNameInput = document.querySelector('#create_edit_dialog #name_input');
  const dialogColumnsElem = document.querySelector('#create_edit_dialog #columns');
  const dialogFkColumnsElem = document.querySelector('#create_edit_dialog #fk_columns');
  const dialogCreateEditBtnElem = document.querySelector('#create_edit_dialog #create_edit_button');
  const dialogErrorElem = document.querySelector('#create_edit_dialog .errors');
  const dialogForm = document.querySelector('dialog form');
  const dialogCancelBtn = document.querySelector('dialog #cancel');

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

  function onForeignTableSelectChange(
    foreignTableSelect,
    foreignColumnSelect,
    dialogSchemaTable,
    currentEditableColumns) {
    if (dialogSchemaTable.name === foreignTableSelect.value) {
      currentEditableColumns.forEach((currentEditableColumn) => {
        currentEditableColumn.value;
        const tableColumnNameOption = document.createElement('option');
        tableColumnNameOption.setAttribute('value', currentEditableColumn.columnNameInput.value);
        tableColumnNameOption.innerHTML = currentEditableColumn.columnNameInput.value;
        foreignColumnSelect.appendChild(tableColumnNameOption);
        currentEditableColumn.columnNameInput.addEventListener('keyup', () => {
          tableColumnNameOption.setAttribute('value', currentEditableColumn.columnNameInput.value);
          tableColumnNameOption.innerHTML = currentEditableColumn.columnNameInput.value;
        });
      });
    } else {
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
  }

  function clearCreateEditDialog() {
    dialogColumns = [];
    dialogFkColumns = [];
    dialogColumnsElem.innerHTML = '';
    dialogFkColumnsElem.innerHTML = '';
    dialogNameInput.value = '';
    dialogErrorElem.innerHTML = '';
  }

  let dialogColumns = [];
  let dialogFkColumns = [];
  let dialogSchemaTable;

  const dialogTableSameFkOptions = [];

  dbDesignerElem.addEventListener('tableDblClick', (event) => {
    clearCreateEditDialog();
    dialogTitleElem.innerHTML = 'Edit Table';
    dialogCreateEditBtnElem.innerHTML = 'Done';
    const table = event.detail;
    dialogSchemaTable = currentSchema.tables.find((schemaTable) => schemaTable.name === table.name);

    dialogNameInput.value = dialogSchemaTable.name;
    dialogNameInput.addEventListener('keyup', () => {
      dialogTableSameFkOptions.forEach((option) => {
        option.setAttribute('value', dialogNameInput.value);
        option.innerHTML = dialogNameInput.value;
      });
    });
    dialogSchemaTable.columns.forEach((column) => {
      const tr = document.createElement('tr');
      const columnNameTd = document.createElement('td');
      const columnNameInput = document.createElement('input');
      columnNameInput.value = column.name;
      columnNameTd.appendChild(columnNameInput);
      columnNameInput.required = true;
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
          if (table.name === dialogSchemaTable.name) {
            dialogTableSameFkOptions.push(tableNameOption);
          }
        });
        foreignTableSelect.value = column.fk.table;
        foreignTableTd.appendChild(foreignTableSelect);
        tr.appendChild(foreignTableTd);

        const foreignColumnTd = document.createElement('td');
        const foreignColumnSelect = document.createElement('select');
        foreignColumnTd.appendChild(foreignColumnSelect);
        tr.appendChild(foreignColumnTd);

        tr.appendChild(removeTd);
        dialogFkColumnsElem.appendChild(tr);

        const index = dialogFkColumns.push({columnNameInput, pkCheckbox, foreignTableSelect, foreignColumnSelect}) - 1;

        removeBtn.addEventListener('click', () => {
          dialogFkColumns.splice(index, 1);
          tr.remove();
        });
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

        dialogColumnsElem.appendChild(tr);

        const index = dialogColumns.push({columnNameInput, pkCheckbox, typeSelect}) - 1;
        removeBtn.addEventListener('click', () => {
          dialogColumns.splice(index, 1);
          tr.remove();
        });
      }
    });
    dialogFkColumns.forEach((item) => {
      onForeignTableSelectChange(item.foreignTableSelect,
        item.foreignColumnSelect,
        dialogSchemaTable,
        dialogColumns);
      item.foreignTableSelect.addEventListener('change', () => {
        onForeignTableSelectChange(item.foreignTableSelect,
          item.foreignColumnSelect,
          dialogSchemaTable,
          dialogColumns);
      });
    });
    createEditDialogElem.showModal();
  });

  dbDesignerElem.addEventListener('click', (event) => {
    // const cord = getDbDesignerClickCords(event);
  });

  dialogCancelBtn.addEventListener('click', (event) => {
    createEditDialogElem.close();
  });

  dbDesignerElem.addEventListener('tableMove', (event) => {
    const table = currentSchema.tables.find((table) => table.name === event.detail.name);
    if (table.pos == null) {
      table.pos = {};
    }
    table.pos.x = event.detail.pos.x;
    table.pos.y = event.detail.pos.y;
    // console.log(event.detail.x, event.detail.y);
  });

  createTableBtn.addEventListener('click', () => {
    clearCreateEditDialog();
    dialogTitleElem.innerHTML = 'Create Table';
    dialogCreateEditBtnElem.innerHTML = 'Create';
    createEditDialogElem.showModal();
  });

  dialogCreateEditBtnElem.addEventListener('click', (event) => {
    // TODO: validation

    if (!dialogForm.checkValidity()) {
      return;
    }

    let errorMessages = [];

    const formattedCollumns = dialogColumns.map((dialogColumn) => ({
      name: dialogColumn.columnNameInput.value,
      pk: dialogColumn.pkCheckbox.checked,
      type: dialogColumn.typeSelect.value
    }));

    const formattedFkCollumns = dialogFkColumns.map((dialogFkColumn) => ({
      name: dialogFkColumn.columnNameInput.value,
      pk: dialogFkColumn.pkCheckbox.checked,
      fk: {
        table: dialogFkColumn.foreignTableSelect.value,
        column: dialogFkColumn.foreignColumnSelect.value
      }
    }));

    const allColumns = formattedCollumns.concat(formattedFkCollumns);

    if (allColumns.find((columnI) => allColumns.find((columnJ) => columnI !== columnJ && columnI.name === columnJ.name))) {
      errorMessages.push(`Two or more columns with the same name.`);
    }

    currentSchema.tables.forEach((table) => {
      for (const column of table.columns) {
        if (column.fk && column.fk.table === dialogSchemaTable.name) {
          if (!formattedCollumns.find((fColumn) => column.fk.column === fColumn.name)) {
            errorMessages.push(`Table ${table.name} has FK constraint to this table on column ${column.fk.column} that no longer exists.`);
            break;
          }
        }
      }
    });

    if (errorMessages.length > 0) {
      event.preventDefault();
      errorMessages.forEach((errorMessage) => {
        const errorElem = document.createElement('p');
        errorElem.innerHTML = errorMessage;
        dialogErrorElem.appendChild(errorElem);
      });
      return;
    }

    if (dialogSchemaTable.name !== dialogNameInput.value) {
      currentSchema.tables.forEach((table) => {
        table.columns.forEach((column) => {
          if (column.fk && column.fk.table === dialogSchemaTable.name) {
            column.fk.table = dialogNameInput.value;
          }
        });
      });
      dialogSchemaTable.name = dialogNameInput.value;
    }

    dialogSchemaTable.columns = formattedCollumns;

    dialogSchemaTable.columns = allColumns;
    setSchema(currentSchema);
  });
});

import template from './template.js';

class TableDialogComponent extends HTMLElement {
  constructor() {
    super();

    const shadowDom = this.attachShadow({
      mode: 'closed'
    });
    shadowDom.innerHTML = template;

    this._dialogColumns = [];
    this._dialogFkColumns = [];
    this._dialogSchemaTable;

    this.dialogTableSameFkOptions = [];

    this._ready(shadowDom);
  }

  set types(types) {
    this._types = types;
  }

  _clear() {
    this._dialogColumns = [];
    this._dialogFkColumns = [];
    this._dialogColumnsElem.innerHTML = '';
    this._dialogFkColumnsElem.innerHTML = '';
    this._dialogNameInput.value = '';
    this._dialogErrorElem.innerHTML = '';
  }

  _ready(shadowdom) {
    this._dialog = shadowdom.getElementById('create_edit_dialog');
    this._dialogTitleElem = shadowdom.querySelector('#create_edit_dialog #dialog_title');
    this._dialogNameInput = shadowdom.querySelector('#create_edit_dialog #name_input');
    this._dialogColumnsElem = shadowdom.querySelector('#create_edit_dialog #columns');
    this._dialogFkColumnsElem = shadowdom.querySelector('#create_edit_dialog #fk_columns');
    this._dialogCreateEditBtnElem = shadowdom.querySelector('#create_edit_dialog #create_edit_button');
    this._dialogErrorElem = shadowdom.querySelector('#create_edit_dialog .errors');
    this._dialogForm = shadowdom.querySelector('dialog form');
    this._dialogCancelBtn = shadowdom.querySelector('dialog #cancel');

    this._setupEvents();
  }

  _setupEvents() {
    this._dialogCancelBtn.addEventListener('click', (event) => {
      this._dialog.close();
    });

    this._dialogCreateEditBtnElem.addEventListener('click', (event) => {
      // TODO: validation

      if (!this._dialogForm.checkValidity()) {
        return;
      }

      let errorMessages = [];

      const formattedCollumns = this._dialogColumns.map((dialogColumn) => ({
        name: dialogColumn.columnNameInput.value,
        pk: dialogColumn.pkCheckbox.checked,
        uq: dialogColumn.uqCheckbox.checked,
        nn: dialogColumn.nnCheckbox.checked,
        type: dialogColumn.typeSelect.value
      }));

      const formattedFkCollumns = this._dialogFkColumns.map((dialogFkColumn) => ({
        name: dialogFkColumn.columnNameInput.value,
        pk: dialogFkColumn.pkCheckbox.checked,
        uq: dialogFkColumn.uqCheckbox.checked,
        nn: dialogFkColumn.nnCheckbox.checked,
        fk: {
          table: dialogFkColumn.foreignTableSelect.value,
          column: dialogFkColumn.foreignColumnSelect.value
        }
      }));

      const allColumns = formattedCollumns.concat(formattedFkCollumns);

      if (allColumns.find((columnI) => allColumns.find((columnJ) => columnI !== columnJ && columnI.name === columnJ.name))) {
        errorMessages.push(`Two or more columns with the same name.`);
      }

      this._schema.tables.forEach((table) => {
        for (const column of table.columns) {
          if (column.fk && column.fk.table === this._dialogSchemaTable.name) {
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
          this._dialogErrorElem.appendChild(errorElem);
        });
        return;
      }

      if (this._dialogSchemaTable.name !== this._dialogNameInput.value) {
        this._schema.tables.forEach((table) => {
          table.columns.forEach((column) => {
            if (column.fk && column.fk.table === this._dialogSchemaTable.name) {
              column.fk.table = this._dialogNameInput.value;
            }
          });
        });
        this._schema.name = this._dialogNameInput.value;
      }

      this._dialogSchemaTable.columns = formattedCollumns;

      this._dialogSchemaTable.columns = allColumns;
      this._dialogResolve(this._schema);
    });
  }

  _onForeignTableSelectChange(
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
      const columns = this._schema.tables.find((table) => table.name === foreignTableSelect.value).columns;
      foreignColumnSelect.innerHTML = '';
      columns.forEach((column) => {
        if (!column.fk && (column.uq || column.pk)) {
          const tableColumnNameOption = document.createElement('option');
          tableColumnNameOption.setAttribute('value', column.name);
          tableColumnNameOption.innerHTML = column.name;
          foreignColumnSelect.appendChild(tableColumnNameOption);
        }
      });
    }
  }

  _openCreate() {
    this._clear();
    this._dialogTitleElem.innerHTML = 'Create Table';
    this._dialogCreateEditBtnElem.innerHTML = 'Create';
    this._dialog.showModal();
    return Promise.resolve();
  }

  open(schema, table) {
    if (!table) {
      return this._openCreate();
    }
    this._clear();
    this._dialogTitleElem.innerHTML = 'Edit Table';
    this._dialogCreateEditBtnElem.innerHTML = 'Done';
    this._schema = schema;
    this._dialogSchemaTable = schema.tables.find((schemaTable) => schemaTable.name === table.name);

    this._dialogNameInput.value = this._dialogSchemaTable.name;
    this._dialogNameInput.addEventListener('keyup', () => {
      this._dialogTableSameFkOptions.forEach((option) => {
        option.setAttribute('value', this._dialogNameInput.value);
        option.innerHTML = this._dialogNameInput.value;
      });
    });
    this._dialogSchemaTable.columns.forEach((column) => {
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

      const uqTd = document.createElement('td');
      const uqCheckbox = document.createElement('input');
      uqCheckbox.setAttribute('type', 'checkbox');
      uqCheckbox.checked = column.uq;
      uqTd.appendChild(uqCheckbox);

      const nnTd = document.createElement('td');
      const nnCheckbox = document.createElement('input');
      nnCheckbox.setAttribute('type', 'checkbox');
      nnCheckbox.checked = column.nn;
      nnTd.appendChild(nnCheckbox);

      const removeTd = document.createElement('td');
      const removeBtn = document.createElement('button');
      removeBtn.innerHTML = 'Remove';
      removeTd.appendChild(removeBtn);

      if (column.fk) {
        tr.appendChild(pkTd);
        tr.appendChild(uqTd);
        tr.appendChild(nnTd);

        const foreignTableTd = document.createElement('td');
        const foreignTableSelect = document.createElement('select');
        schema.tables.forEach((table) => {
          const tableNameOption = document.createElement('option');
          tableNameOption.setAttribute('value', table.name);
          tableNameOption.innerHTML = table.name;
          foreignTableSelect.appendChild(tableNameOption);
          if (table.name === this._dialogSchemaTable.name) {
            this.dialogTableSameFkOptions.push(tableNameOption);
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
        this._dialogFkColumnsElem.appendChild(tr);

        const index = this._dialogFkColumns.push({columnNameInput, pkCheckbox, uqCheckbox, nnCheckbox, foreignTableSelect, foreignColumnSelect}) - 1;

        removeBtn.addEventListener('click', () => {
          this._dialogFkColumns.splice(index, 1);
          tr.remove();
        });
      } else {
        const typeTd = document.createElement('td');
        const typeSelect = document.createElement('select');

        this._types.forEach((type) => {
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
        tr.appendChild(uqTd);
        tr.appendChild(nnTd);

        tr.appendChild(removeTd);

        this._dialogColumnsElem.appendChild(tr);

        const index = this._dialogColumns.push({columnNameInput, pkCheckbox, uqCheckbox, nnCheckbox, typeSelect}) - 1;
        removeBtn.addEventListener('click', () => {
          this._dialogColumns.splice(index, 1);
          tr.remove();
        });
      }
    });
    this._dialogFkColumns.forEach((item) => {
      this._onForeignTableSelectChange(item.foreignTableSelect,
        item.foreignColumnSelect,
        this._dialogSchemaTable,
        this._dialogColumns);
      item.foreignTableSelect.addEventListener('change', () => {
        this._onForeignTableSelectChange(item.foreignTableSelect,
          item.foreignColumnSelect,
          this._dialogSchemaTable,
          this._dialogColumns);
      });
    });
    this._dialog.showModal();
    return new Promise((resolve, reject) => {
      this._dialogResolve = resolve;
      this._dialogReject = reject;
    });
  }
}

customElements.define('table-dialog', TableDialogComponent);

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

    this._dialogTableSameFkOptions = [];

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
    this._modal = shadowdom.getElementById('myModal');
    // this._dialog = shadowdom.querySelector('dialog');
    this._dialogTitleElem = shadowdom.querySelector('#dialog_title');
    this._dialogNameInput = shadowdom.querySelector('#name_input');
    this._dialogColumnsElem = shadowdom.querySelector('#columns');
    this._dialogFkColumnsElem = shadowdom.querySelector('#fk_columns');
    this._dialogCreateEditBtn = shadowdom.querySelector('#create_edit_button');
    this._dialogErrorElem = shadowdom.querySelector('.errors');
    this._dialogForm = shadowdom.querySelector('form');
    this._dialogCancelBtn = shadowdom.querySelector('#cancel');
    this._dialogAddColumnBtn = shadowdom.querySelector('#add_column');
    this._dialogAddRelationBtn = shadowdom.querySelector('#add_relation');

    this._setupEvents();
  }

  /**
   * When user clicks on Done.
   * @param {Event} event
   */
  _dialogCreateEditBtnOnClick(event) {
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

    if (this._dialogSchemaTable) {
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
    }

    if (errorMessages.length > 0) {
      event.preventDefault();
      errorMessages.forEach((errorMessage) => {
        const errorElem = document.createElement('p');
        errorElem.innerHTML = errorMessage;
        this._dialogErrorElem.appendChild(errorElem);
      });
      return;
    }

    if (this._dialogSchemaTable) {
      if (this._dialogSchemaTable.name !== this._dialogNameInput.value) {
        this._schema.tables.forEach((table) => {
          table.columns.forEach((column) => {
            if (column.fk && column.fk.table === this._dialogSchemaTable.name) {
              column.fk.table = this._dialogNameInput.value;
            }
          });
        });
        this._dialogSchemaTable.name= this._dialogNameInput.value;
      }
      this._dialogSchemaTable.columns = allColumns;
    } else {
      const newTable = {
        columns: allColumns,
        name: this._dialogNameInput.value
      };
      this._schema.tables.push(newTable);
    }

    this._dialogResolve(this._schema);
    this._closeDialog();
  }

  _setupEvents() {
    this._dialogCancelBtn.addEventListener('click', (event) => {
      this._closeDialog();
    });

    this._dialogCreateEditBtn.addEventListener('click', this._dialogCreateEditBtnOnClick.bind(this));

    this._dialogAddColumnBtn.addEventListener('click', (event) => {
      const dialogColumn = this._createColumnRow();
      this._setupPkUqCheckboxResultOnFkColumn(dialogColumn);
      event.preventDefault();
    });
    this._dialogAddRelationBtn.addEventListener('click', (event) => {
      const dialogFkColumn = this._createRelationRow(this._schema);
      this._setupPkUqCheckboxResultOnFkColumn(dialogFkColumn);

      this._setupOnForeignTableSelectChange(dialogFkColumn);
      event.preventDefault();
    });
  }

  _setupOnForeignTableSelectChange(dialogFkColumn) {
    this._onForeignTableSelectChange(dialogFkColumn.foreignTableSelect,
      dialogFkColumn.foreignColumnSelect,
      this._dialogSchemaTable,
      this._dialogColumns);

    dialogFkColumn.foreignTableSelect.addEventListener('change', () => {
      this._onForeignTableSelectChange(dialogFkColumn.foreignTableSelect,
        dialogFkColumn.foreignColumnSelect,
        this._dialogSchemaTable,
        this._dialogColumns);
    });
  }

  _setupFkColumnOptionElem(dialogColumn, select) {
    const tableColumnNameOption = this._createOptionAndAppend(dialogColumn.columnNameInput.value, select);
    this._setOnColumnNameChange(dialogColumn.columnNameInput, tableColumnNameOption);
    dialogColumn.removeBtn.addEventListener('click', () => {
      tableColumnNameOption.remove();
    });
  }

  /**
   * When foreign table selected, this function polpulates
   * foreign table columns list.
   * List of columns gets populated from schema expect in the
   * case of edit dialog table the same as foreign table select.
   * @param {Element} foreignTableSelect
   * @param {Element} foreignColumnSelect
   * @param {Element} dialogSchemaTable
   * @param {Array<Element>} currentEditableColumns
   */
  _onForeignTableSelectChange(
    foreignTableSelect,
    foreignColumnSelect,
    dialogSchemaTable,
    currentEditableColumns) {
    if (dialogSchemaTable.name === foreignTableSelect.value) {
      foreignColumnSelect.innerHTML = null;
      currentEditableColumns.forEach((currentEditableColumn) => {
        if (currentEditableColumn.pkCheckbox.checked || currentEditableColumn.uqCheckbox.checked) {
          this._setupFkColumnOptionElem(currentEditableColumn, foreignColumnSelect);
        }
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

  /**
   * This function creates common elements for ordinary column and
   * foreign key column.
   * @param   {Object} column   Schema column
   * @return  {Object}          Object with created elements inside
   */
  _createCommonRow(column) {
    const tr = document.createElement('tr');

    const columnNameTd = document.createElement('td');
    const columnNameInput = document.createElement('input');
    columnNameTd.appendChild(columnNameInput);
    columnNameInput.required = true;
    tr.appendChild(columnNameTd);

    const pkTd = document.createElement('td');
    const pkCheckbox = document.createElement('input');
    pkCheckbox.setAttribute('type', 'checkbox');
    pkTd.appendChild(pkCheckbox);
    tr.appendChild(pkTd);

    const uqTd = document.createElement('td');
    const uqCheckbox = document.createElement('input');
    uqCheckbox.setAttribute('type', 'checkbox');
    uqTd.appendChild(uqCheckbox);
    tr.appendChild(uqTd);

    const nnTd = document.createElement('td');
    const nnCheckbox = document.createElement('input');
    nnCheckbox.setAttribute('type', 'checkbox');
    nnTd.appendChild(nnCheckbox);
    tr.appendChild(nnTd);

    // pkCheckbox.addEventListener('change', onPkCheckboxChangeListener);

    const removeTd = document.createElement('td');
    const removeBtn = document.createElement('button');
    removeBtn.innerHTML = 'Remove';
    removeTd.appendChild(removeBtn);
    tr.appendChild(removeTd);

    if (column) {
      columnNameInput.value = column.name;
      pkCheckbox.checked = column.pk;
      uqCheckbox.checked = column.uq;
      nnCheckbox.checked = column.nn;
    }

    // onPkCheckboxChangeListener();

    return {
      tr,
      columnNameInput,
      pkCheckbox,
      uqCheckbox,
      nnCheckbox,
      removeBtn
    };
  }

  /**
   * Creates a relation column
   * @param  {Object} schema
   * @param  {Object} column   Schema column
   * @return {Object}          Created column info
   */
  _createRelationRow(schema, column) {
    const result = this._createCommonRow(column);
    const foreignTableTd = document.createElement('td');
    const foreignTableSelect = document.createElement('select');
    schema.tables.forEach((table) => {
      const tableNameOption = document.createElement('option');
      tableNameOption.setAttribute('value', table.name);
      tableNameOption.innerHTML = table.name;
      foreignTableSelect.appendChild(tableNameOption);
      if (table.name === this._dialogSchemaTable.name) {
        this._dialogTableSameFkOptions.push(tableNameOption);
      }
    });
    if (column) {
      foreignTableSelect.value = column.fk.table;
    }
    foreignTableTd.appendChild(foreignTableSelect);
    result.tr.insertBefore(foreignTableTd, result.removeBtn.parentNode);

    const foreignColumnTd = document.createElement('td');
    const foreignColumnSelect = document.createElement('select');
    foreignColumnTd.appendChild(foreignColumnSelect);
    result.tr.insertBefore(foreignColumnTd, result.removeBtn.parentNode);

    this._dialogFkColumnsElem.appendChild(result.tr);

    const dialogFkColumn = {
      columnNameInput: result.columnNameInput,
      pkCheckbox: result.pkCheckbox,
      uqCheckbox: result.uqCheckbox,
      nnCheckbox: result.nnCheckbox,
      foreignTableSelect,
      foreignColumnSelect,
      removeBtn: result.removeBtn
    };

    const index = this._dialogFkColumns.push(dialogFkColumn) - 1;

    result.removeBtn.addEventListener('click', () => {
      this._dialogFkColumns.splice(index, 1);
      result.tr.remove();
    });

    return dialogFkColumn;
  }

  /**
   * Creates a column.
   * @param   {Object} column   Schema column
   * @return  {Object}          Created column info
   */
  _createColumnRow(column) {
    const result = this._createCommonRow(column);
    const typeTd = document.createElement('td');
    const typeSelect = document.createElement('select');

    this._types.forEach((type) => {
      const typeOption = document.createElement('option');
      typeOption.innerHTML = type;
      typeOption.setAttribute('value', type);
      typeSelect.appendChild(typeOption);
    });

    if (column) {
      typeSelect.value = column.type;
    }

    typeTd.appendChild(typeSelect);

    result.tr.insertBefore(typeTd, result.pkCheckbox.parentNode);

    this._dialogColumnsElem.appendChild(result.tr);

    const dialogColumn = {
      columnNameInput: result.columnNameInput,
      pkCheckbox: result.pkCheckbox,
      uqCheckbox: result.uqCheckbox,
      nnCheckbox: result.nnCheckbox,
      typeSelect,
      removeBtn: result.removeBtn
    };
    const index = this._dialogColumns.push(dialogColumn) - 1;
    result.removeBtn.addEventListener('click', () => {
      this._dialogColumns.splice(index, 1);
      result.tr.remove();
    });

    return dialogColumn;
  }

  _openCreate() {
    this._dialogTitleElem.innerHTML = 'Create Table';
    this._dialogCreateEditBtn.innerHTML = 'Create';
    this._openDialog();
    return Promise.resolve();
  }

  _openDialog() {
    this._modal.style.display = 'block';
  }

  _closeDialog() {
    this._modal.style.display = 'none';
  }

  _setOnColumnNameChange(columnNameInput, tableColumnNameOption) {
    columnNameInput.addEventListener('keyup', () => {
      tableColumnNameOption.setAttribute('value', columnNameInput.value);
      tableColumnNameOption.innerHTML = columnNameInput.value;
    });
  }

  _createOptionAndAppend(value, select) {
    const option = document.createElement('option');
    option.setAttribute('value', value);
    option.innerHTML = value;
    select.appendChild(option);

    return option;
  }

   /**
    * When checking and unchecking PK or UQ of columns. If in FK column section of dialog there are
    * columns that have curent dialog table selected as foreign key table, their FK column
    * data need to be updated to reflect the current changes.
    * @param {Element} firstCheckbox
    * @param {Element} secondCheckbox
    * @param {Object} dialogColumn
    */
  _onPkUqChange(firstCheckbox, secondCheckbox, dialogColumn) {
    const filteredDialogFkColumns = this._dialogFkColumns.filter((dialogFkColumn) =>
      dialogFkColumn.foreignTableSelect.value === this._dialogNameInput.value);
    if (firstCheckbox.checked && !secondCheckbox.checked) {
      filteredDialogFkColumns.forEach((filteredDialogFkColumn) => {
        this._setupFkColumnOptionElem(dialogColumn, filteredDialogFkColumn.foreignColumnSelect);
      });
    } else if (!firstCheckbox.checked && !secondCheckbox.checked) {
      filteredDialogFkColumns.forEach((filteredDialogFkColumn) => {
        Array.from(filteredDialogFkColumn.foreignColumnSelect.children).find((option) =>
          option.value === dialogColumn.columnNameInput.value).remove();
      });
    }
  }

  _setupPkUqCheckboxResultOnFkColumn(dialogColumn) {
    dialogColumn.pkCheckbox.addEventListener('change', this._onPkUqChange.bind(this, dialogColumn.pkCheckbox, dialogColumn.uqCheckbox, dialogColumn));
    dialogColumn.uqCheckbox.addEventListener('change', this._onPkUqChange.bind(this, dialogColumn.uqCheckbox, dialogColumn.pkCheckbox, dialogColumn));
  }

  _openEdit(schema, table) {
    this._dialogTitleElem.innerHTML = 'Edit Table';
    this._dialogCreateEditBtn.innerHTML = 'Done';
    this._schema = schema;
    this._dialogSchemaTable = schema.tables.find((schemaTable) => schemaTable.name === table.name);

    this._dialogNameInput.value = this._dialogSchemaTable.name;
    this._dialogNameInput.addEventListener('keyup', () => {
      this._dialogTableSameFkOptions.forEach((option) => {
        option.setAttribute('value', this._dialogNameInput.value);
        option.innerHTML = this._dialogNameInput.value;
      });
    });

    // Create table columns
    this._dialogSchemaTable.columns.forEach((column) => {
      if (column.fk) {
        this._createRelationRow(schema, column);
      } else {
        this._createColumnRow(column);
      }
    });

    this._dialogColumns.concat(this._dialogFkColumns).forEach((dialogColumn) => {
      this._setupPkUqCheckboxResultOnFkColumn(dialogColumn);
    });

    // FK column select boxes need to be populated based on selected FK table value.
    this._dialogFkColumns.forEach((dialogFkColumn) => {
      this._setupOnForeignTableSelectChange(dialogFkColumn);
    });
    this._openDialog();
  }

  open(schema, table) {
    this._originalSchema = schema;
    this._schema = JSON.parse(JSON.stringify(schema));

    this._clear();
    if (!table) {
      this._openCreate(this._schema);
    } else {
      this._openEdit(this._schema, table);
    }

    return new Promise((resolve, reject) => {
      this._dialogResolve = resolve;
      this._dialogReject = reject;
    });
  }
}

customElements.define('table-dialog', TableDialogComponent);

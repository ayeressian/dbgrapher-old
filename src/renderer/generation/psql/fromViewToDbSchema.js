function psql(schema) {
  let sqlSchema = '';
  schema.tables.forEach((table, index) => {
    let columnSql = '';
    table.columns.forEach((column, index) => {
      if (column.fk) {
        const table = schema.tables.find((table) => table.name === column.fk.table);
        const type = table.columns.find((_column) => _column.name === column.fk.column).type;
        columnSql += '  ' + column.name + ' ' + type;
      } else {
        columnSql += '  ' + column.name + ' ' + column.type;
      }
      if (column.uq === true) {
        columnSql += ' UNIQUE';
      }
      if (column.nn === true) {
        columnSql += ' NOT NULL';
      }
      if (column.pk === true) {
        columnSql += ' PRIMARY KEY';
      }
      if (column.fk) {
        columnSql += ' REFERENCES ' + column.fk.table + '(' + column.fk.column + ')';
      }
      if (index < table.columns.length -1) {
        columnSql += ',';
      }
      columnSql += '\n';
    });
    sqlSchema += 'CREATE TABLE ' + table.name + '(\n' + columnSql + ');\n';
    if (index < schema.tables.length -1) {
      sqlSchema += '\n';
    }
  });

  return sqlSchema;
}

export default (schema) => {
  switch (schema.dbType) {
    case 'psql':
      return psql(schema);
  }
};

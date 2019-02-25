function psql(schema) {
  let sqlSchema = '';
  schema.tables.forEach((table) => {
    let columnSql = '';
    table.columns.forEach((column) => {
      if (column.fk) {
        const table = schema.tables.find((table) => table.name === column.fk.table);
        const type = table.columns.find((_column) => _column.name === column.fk.column).type;
        columnSql += `${column.name} ${type}`;
      } else {
        columnSql += `${column.name} ${column.type}`;
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
        columnSql += ` REFERENCES ${column.fk.table}(${column.fk.column})`;
      }
      columnSql += '\n';
    });
    sqlSchema += `CREATE TABLE ${table.name} (
      ${columnSql}
    )
    `;
  });

  return sqlSchema;
}

function mysql(schema) {
  
}

export default (schema) => {
  switch (schema.dbType) {
    case 'psql':
      return psql(schema);
    case 'mysql':
      return mysql(schema);
  }
};

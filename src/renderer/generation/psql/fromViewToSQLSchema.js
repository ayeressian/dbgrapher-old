export default async (schema) => {
  let sqlSchema = '';
  schema.tables.forEeach((table) => {
    let columnSql = '';
    table.columns((column) => {
      columnSql += `${column.name} ${column.type}`;
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
};

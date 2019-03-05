import Parser from 'sql-ddl-to-json-schema';

const parser = new Parser('mysql');

export default (sql) => {
  parser.feed(sql);
  const parseResult = parser.toCompactJson(parser.results);

  const result = {dbType: 'mysql', tables: []};

  parseResult.forEach((_table) => {
    const table = {
      columns: [],
      name: _table.name
    };
    result.tables.push(table);
    _table.columns.forEach((_column) => {
      const column = {
        name: _column.name,
        type: _column.type.datatype,
        nn: !_column.options.nullable
      };
      table.columns.push(column);
    });
    if (_table.primaryKey) {
      _table.primaryKey.columns.forEach((_column) => {
        const column = table.columns.find((column) => column.name === _column.column);
        column.pk = true;
      });
    }
    if (_table.foreignKeys) {
      _table.foreignKeys.forEach((_foreignKey) => {
        _foreignKey.columns.forEach((_column, index) => {
          const column = table.columns.find((column) => column.name === _column.column);
          column.fk = {
            table: _column.reference.table,
            column: _column.reference.columns[index].column
          };
        });
      });
    }
  });

  return result;
};

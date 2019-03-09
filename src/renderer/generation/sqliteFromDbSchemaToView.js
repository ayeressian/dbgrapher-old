import sqliteParser from 'sqlite-parser';

export default (sql) => {
  const result = {tables: [], dbType: 'sqlite'};
  const ast = sqliteParser(sql);

  ast.statement.forEach((statementItem) => {
    if (statementItem.variant === 'create') {
      const table = {
        name: statementItem.name.name,
        columns: []
      };
      statementItem.definition.forEach((definitionItem) => {
        switch (definitionItem.variant) {
          case 'column':
          {
            const column = {
              name: definitionItem.name,
              type: definitionItem.datatype.variant
            };

            definitionItem.definition.forEach((constraintDefinition) => {
              switch (constraintDefinition.variant) {
                case 'primary key':
                column.pk = true;
                break;
                case 'foreign key':
                column.fk = {
                  table: constraintDefinition.references.name,
                  column: constraintDefinition.references.columns[0].name
                };
                break;
              }
            });

            table.columns.push(column);
          }
          break;
          case 'constraint':
          definitionItem.definition.forEach((constraintDefinition, index) => {
            const column = table.columns.find((column) => column.name === definitionItem.columns[index].name)

            switch (constraintDefinition.variant) {
              case 'primary key':
              column.pk = true;
              break;
              case 'foreign key':
              column.fk = {
                table: constraintDefinition.references.name,
                column: constraintDefinition.references.columns[0].name
              };
              break;
            }
          });
          break;
        }
      });
      result.tables.push(table);
    }
  });

  return result;
};

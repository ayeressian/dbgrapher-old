import PgQuery from 'pg-query-emscripten';

const PRIMARY_KEY_CONSTRAINT_TYPE = 5;
const FOREIGN_KEY_CONSTRAINT_TYPE = 8;
const NOT_NULL_CONSTRAINT_TYPE = 1;

export default (sql) => {
  const result = {tables: []};

  const parseResult = PgQuery.parse(sql);

  const rawStmts = parseResult.parse_tree;
  rawStmts.forEach((rawStmt) => {
    const createStmt = rawStmt.RawStmt.stmt.CreateStmt;
    const tableName = createStmt.relation.RangeVar.relname;
    const columns = [];
    createStmt.tableElts.forEach((tableElt) => {
      const ColumnDef = tableElt.ColumnDef;
      if (ColumnDef) {
        const typeNames = ColumnDef.typeName.TypeName.names;
        const column = {
          name: ColumnDef.colname,
          type: typeNames[typeNames.length - 1].String.str
        };

        const constraints = ColumnDef.constraints;

        if (constraints) {
          ColumnDef.constraints.forEach((constraint) => {
            switch (constraint.Constraint.contype) {
              case PRIMARY_KEY_CONSTRAINT_TYPE:
              column.pk = true;
              break;
              case FOREIGN_KEY_CONSTRAINT_TYPE:
              column.fk = {
                table: constraint.Constraint.pktable.RangeVar.relname,
                column: constraint.Constraint.pk_attrs[0].String.str
              };
              break;
              case NOT_NULL_CONSTRAINT_TYPE:
              column.nn = true;
              break;
            }
          });
        }
        columns.push(column);
      } else if (tableElt.Constraint) {
        const constraint = tableElt.Constraint;
        switch (constraint.contype) {
          case PRIMARY_KEY_CONSTRAINT_TYPE:
          constraint.keys.forEach((key) => {
            const column = columns.find((column) => column.name === key.String.str);
            column.pk = true;
          });
          break;
          case FOREIGN_KEY_CONSTRAINT_TYPE:
          constraint.fk_attrs.forEach((fkAttr, index) => {
            const column = columns.find((column) => column.name === fkAttr.String.str);
            column.fk = {
              table: constraint.pktable.RangeVar.relname,
              column: constraint.pk_attrs[index].String.str
            };
          });
          break;
        }
      }
    });
    result.tables.push({
      name: tableName,
      columns
    });
  });
  result.dbType = 'psql';
  return result;
};

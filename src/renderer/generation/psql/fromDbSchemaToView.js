import PgQuery from 'pg-query-emscripten';

const PRIMARY_KEY_CONSTRAINT_TYPE = 5;
const FOREIGN_KEY_CONSTRAINT_TYPE = 8;

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

      const typeNames = ColumnDef.typeName.TypeName.names;
      const column = {
        name: ColumnDef.colname,
        type: typeNames[typeNames.length - 1].String.str
      };

      const constraints = ColumnDef.constraints;

      if (constraints) {
        if (constraints.find(({Constraint}) => Constraint.contype === PRIMARY_KEY_CONSTRAINT_TYPE)) {
          column.pk = true;
        }

        const constraint = constraints.find(({Constraint}) => Constraint.contype === FOREIGN_KEY_CONSTRAINT_TYPE);
        if (constraint) {
          column.fk = {
            table: constraint.Constraint.pktable.RangeVar.relname,
            column: constraint.Constraint.pk_attrs[0].String.str
          };
        }
      }

      columns.push(column);
    });
    result.tables.push({
      name: tableName,
      columns
    });
  });
};

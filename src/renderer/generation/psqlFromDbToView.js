import {
  Pool
} from 'pg';

export default async ({user, host, database, password, port}) => {
  const pool = new Pool({
    user,
    host,
    database,
    password,
    port
  });

  const pkQuery = `select tc.table_schema, tc.table_name, kc.column_name
  from
      information_schema.table_constraints tc,
      information_schema.key_column_usage kc
  where
      tc.constraint_type = 'PRIMARY KEY'
      and kc.table_name = tc.table_name and kc.table_schema = tc.table_schema
      and kc.constraint_name = tc.constraint_name
      and tc.table_name = $1
  order by 1, 2`;

  const fKQuery = `SELECT
      tc.table_schema,
      tc.constraint_name,
      tc.table_name,
      kcu.column_name,
      ccu.table_schema AS foreign_table_schema,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name
  FROM
      information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
  WHERE constraint_type = 'FOREIGN KEY' AND tc.table_name=$1`;

  const result = {
    tables: []
  };
  const tablesResult =
    await pool.query(`select table_name from
              information_schema.tables where table_schema = 'public'`);

  for (const {
      table_name
    } of tablesResult.rows) {
    const dbResult = await Promise.all([
      pool.query(`select column_name, data_type, is_nullable from
                  information_schema.columns where table_name = $1`, [table_name]),
      pool.query(fKQuery, [table_name]),
      pool.query(pkQuery, [table_name])
    ]);
    const columnResult = dbResult[0];
    const fKResult = dbResult[1];
    const pkResult = dbResult[2];

    result.tables.push({
      name: table_name,
      columns: columnResult.rows.map(({
        column_name,
        data_type,
        is_nullable
      }) => {
        const column = {
          name: column_name,
          type: data_type,
          pk: pkResult.rows.find((item) => item.column_name === column_name) != null,
          required: !is_nullable
        };
        const fk = fKResult.rows.find((item) => item.column_name === column_name);
        if (fk != null) {
          column.fk = {
            table: fk.foreign_table_name,
            column: fk.foreign_column_name
          };
        }
        return column;
      })
    });
  }
  await pool.end();

  return result;
};

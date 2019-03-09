import electron from 'electron';
import fromDbToView from './generation/psql/fromDbToView.js';
import fs from 'fs';
import {loadFromFilePath} from './fileOpenSetup.js';
import psqlFromViewToDbSchema from './generation/psqlFromViewToDbSchema.js';

let _getCurrentSchema;
let _setSchema;

const dbConnectionDialog = document.querySelector('db-connection-dialog');
const chooseDbDialog = document.querySelector('choose-db-dialog');

document.querySelector('.main_container').style['grid-template-rows'] = 0;

electron.ipcRenderer.on('file-to-load', (sender, filePath) => {
  loadFromFilePath(filePath, _setSchema);
});

electron.ipcRenderer.on('file-new', async (sender, filePath) => {
  const dbType = await chooseDbDialog.getDbType();
  if (dbType != null) {
    _setSchema({tables: [], dbType});
  }
});

electron.ipcRenderer.on('file-save', (sender, filePath) => {
  const schema = _getCurrentSchema();
  fs.writeFileSync(filePath, JSON.stringify(schema), 'utf-8');
});

electron.ipcRenderer.on('gen-view-from-db-psql', async (sender) => {
  const data = await dbConnectionDialog.getConnectionInfo();
  let schema;
  try {
    schema = await fromDbToView(data);
  } catch {
    alert('Can\'t connect to DB with provided data');
  }
  _setSchema(schema);
});
electron.ipcRenderer.on('gen-db-from-view', async (sender, filePath) => {
  let result;
  const schema = _getCurrentSchema();
  switch (schema.dbType) {
    case 'psql':
      result = psqlFromViewToDbSchema();
      break;
  }
  fs.writeFileSync(filePath, result, 'utf-8');
});

export default (getCurrentSchema, setSchema, getSchema) => {
  _getCurrentSchema = getCurrentSchema;
  _setSchema = setSchema;
};

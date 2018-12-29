import {
  validateJson
} from './validate-schema.js';
import electron from 'electron';
import fromDbToView from './generation/psql/fromDbToView.js';
import fs from 'fs';
import {loadFile} from './operations.js';

let _getCurrentSchema;
let _setSchema;

const menuBarElem = document.querySelector('menu-bar');
const fileOpenElem = document.getElementById('file_open');
const dbConnectionDialog = document.querySelector('db-connection-dialog');

document.querySelector('.main_container').style['grid-template-rows'] = 0;

menuBarElem.remove();
fileOpenElem.remove();
electron.ipcRenderer.on('file-to-load', async (sender, filePath) => {
  loadFile(filePath, _setSchema);
});

electron.ipcRenderer.on('file-save', async (sender, filePath) => {
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
electron.ipcRenderer.on('gen-db-from-view', async (sender) => {
  // TODO
});

export default (getCurrentSchema, setSchema, getSchema) => {
  _getCurrentSchema = getCurrentSchema;
  _setSchema = setSchema;
};

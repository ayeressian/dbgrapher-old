import {
  validateJson
} from './validate-schema.js';
import electron from 'electron';
import fromDbToView from './generation/psql/fromDbToView.js';
import fs from 'fs';

let _getCurrentSchema;
let _setSchema;

const menuBarElem = document.querySelector('menu-bar');
const fileOpenElem = document.getElementById('file_open');
const dbConnectionDialog = document.querySelector('db-connection-dialog');

document.querySelector('.main_container').style['grid-template-rows'] = 0;

menuBarElem.remove();
fileOpenElem.remove();
electron.ipcRenderer.on('file-to-load', async (sender, filePath) => {
  let schema;
  try {
    schema = window.require(filePath);
  } catch (e) {
    alert('Selected file doesn\'t contain valid JSON.');
    return;
  }
  const jsonValidation = validateJson(schema);
  if (!jsonValidation) {
    alert('Selected file doesn\'t have correct Db designer file format');
    return;
  }
  _setSchema(schema);
});

electron.ipcRenderer.on('file-save', async (sender, filePath) => {
  const schema = _getCurrentSchema();
  console.log(filePath);
  fs.writeFileSync(filePath, JSON.stringify(schema), 'utf-8');
});

electron.ipcRenderer.on('gen-view-from-db', async (sender) => {
  const data = await dbConnectionDialog.getConnectionInfo();
  const schema = await fromDbToView(data);
  _setSchema(schema);
});
electron.ipcRenderer.on('gen-db-from-view', async (sender) => {
  // TODO
});

export default (getCurrentSchema, setSchema, getSchema) => {
  _getCurrentSchema = getCurrentSchema;
  _setSchema = setSchema;
};

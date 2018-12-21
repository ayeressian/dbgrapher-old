import {
  validateJson
} from './validate-schema.js';

const electron = window.require('electron');

let _getCurrentSchema;
let _setSchema;

const menuBarElem = document.querySelector('menu-bar');
const fileOpenElem = document.getElementById('file_open');

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

export default (getCurrentSchema, setSchema) => {
  _getCurrentSchema = getComputedStyle;
  _setSchema = setSchema;
};

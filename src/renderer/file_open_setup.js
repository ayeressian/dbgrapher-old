import {
  validateJson
} from './validate-schema.js';

const INVALID_JSON_MSG = 'Selected file doesn\'t contain valid JSON.';
const INVALID_FILE_FORMAT = 'Selected file doesn\'t have correct Db designer file format';

export default (fileOpenElem, setSchema) => {
  fileOpenElem.addEventListener('change', (event) => {
    const reader = new FileReader();
    reader.readAsText(event.target.files[0]);
    reader.onload = (event) => {
      let schema;
      try {
        schema = JSON.parse(event.target.result);
      } catch (e) {
        alert(INVALID_JSON_MSG);
        return;
      }
      const jsonValidation = validateJson(schema);
      if (!jsonValidation) {
        alert(INVALID_FILE_FORMAT);
        return;
      }
      setSchema(schema);
    };
  });
};

export const loadFromFilePath = (filePath, setSchema) => {
  let schema;
  try {
    delete window.require.cache[window.require.resolve(filePath)];
    schema = window.require(filePath);
  } catch {
    alert(INVALID_JSON_MSG);
    return;
  }
  const jsonValidation = validateJson(schema);
  if (!jsonValidation) {
    alert(INVALID_FILE_FORMAT);
    return;
  }
  setSchema(schema);
};

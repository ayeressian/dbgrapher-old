import {
  validateJson
} from './validate-schema.js';
import psqlFromDbSchemaToView from './generation/psql/fromDbSchemaToView.js';

const INVALID_JSON_MSG = 'Selected file doesn\'t contain valid JSON.';
const INVALID_FILE_FORMAT = 'Selected file doesn\'t have correct Db designer file format';

const INVALID_SQL_FILE_FORMAT = 'Selected file doesn\'t have correct schema format';

export const setupOpenSchema = (fileOpenElem, setSchema) => {
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

export const setupDbScehmaFileOpen = async (dbSchemaFileOpenElem, setSchema, getDbType) => {
  dbSchemaFileOpenElem.addEventListener('change', (event) => {
    const reader = new FileReader();
    reader.readAsText(event.target.files[0]);
    reader.onload = (event) => {
      getDbType().then((dbType) => {
        let parseFunction;
        switch (dbType) {
          case 'psql':
            parseFunction = psqlFromDbSchemaToView;
            break;
        }
        try {
          const schema = parseFunction(event.target.result);
          setSchema(schema);
        } catch {
          alert(INVALID_SQL_FILE_FORMAT);
        }
      });
    };
  });
};

import Ajv from 'ajv';
import validationSchema from './validation-schema.js';

const ajv = new Ajv();
const ajvCompiled = ajv.compile(validationSchema);

export function validateJson(dbSchema) {
  const validJson = ajvCompiled(dbSchema);
  return validJson;
}

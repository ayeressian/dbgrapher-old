/* global Ajv */

import validationSchema from './validation-schema.js';

const ajv = new Ajv();
const ajvCompiled = ajv.compile(validationSchema);

export function validateJson(dbSchema) {
  const validJson = ajvCompiled(dbSchema);
  return validJson;
}

export function validateRelations(dbSchema) {
  
}


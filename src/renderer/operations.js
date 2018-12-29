export const loadFile = async (filePath, ) => {
  let schema;
  try {
    schema = window.require(filePath);
  } catch {
    alert('Selected file doesn\'t contain valid JSON.');
    return;
  }
  const jsonValidation = validateJson(schema);
  if (!jsonValidation) {
    alert('Selected file doesn\'t have correct Db designer file format');
    return;
  }
  _setSchema(schema);
};

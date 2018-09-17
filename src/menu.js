import {download} from './download.js';
import {validateJson} from './validate-schema.js';

const menuBarElem = document.querySelector('menu-bar');
const fileOpenElem = document.getElementById('file_open');

menuBarElem.config = {
  items: [
    {
      id: 'file',
      title: 'File',
      items: [
        {
          id: 'open',
          title: 'Open'
        },
        {
          id: 'download',
          title: 'Download'
        }
      ]
    },
    {
      id: 'help',
      title: 'Help',
      items: [
        {
          id: 'about',
          title: 'About'
        }
      ]
    }
  ]
};

export default function setup(currentSchema, setSchema) {
  fileOpenElem.addEventListener('change', (event) => {
    const reader = new FileReader();
    reader.readAsText(event.target.files[0]);
    reader.onload = (event) => {
      let schema;
      try {
        schema = JSON.parse(event.target.result);
      } catch {
        alert('Selected file doesn\'t contain valid JSON.');
        return;
      }
      const jsonValidation = validateJson(schema);
      if (!jsonValidation) {
        alert('Selected file doesn\'t have correct Db designer file format');
        return;
      }
      setSchema(schema);
    };
  });

  menuBarElem.addEventListener('select', (event) => {
    switch (event.detail) {
      case 'open':
        fileOpenElem.click();
        break;
      case 'download':
        download(JSON.stringify(currentSchema), 'schema.json', 'application/json');
        break;
    }
  });
}

import {
  download
} from './download.js';
import {
  validateJson
} from './validate-schema.js';

const config = {
  items: [{
      id: 'file',
      title: 'File',
      items: [{
          id: 'new',
          title: 'New Schema'
        },
        {
          id: 'open',
          title: 'Open Schema'
        },
        {
          id: 'downloadSchema',
          title: 'Download'
        }
      ]
    },
    {
      id: 'help',
      title: 'Help',
      items: [{
        id: 'about',
        title: 'About'
      }]
    }
  ],
  rightItems: [{
      id: 'gitHub',
      title: 'GitHub'
    },
    {
      id: 'downloadApp',
      title: 'Download'
    }
  ]
};

export default function setup(getCurrentSchema, setSchema) {
  const menuBarElem = document.querySelector('menu-bar');
  const fileOpenElem = document.getElementById('file_open');

  fileOpenElem.addEventListener('change', (event) => {
    const reader = new FileReader();
    reader.readAsText(event.target.files[0]);
    reader.onload = (event) => {
      let schema;
      try {
        schema = JSON.parse(event.target.result);
      } catch (e) {
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

  menuBarElem.addEventListener('select', async (event) => {
    switch (event.detail) {
      case 'new':
        if (getCurrentSchema().tables.length > 0) {
          if (window.confirm('Do you want to create a new schema? All the unsaved progress will be lost.')) {
            const chooseDbDialog = document.querySelector('choose-db-dialog');
            const dbType = await chooseDbDialog.getDbType();
            if (dbType != null) {
              setSchema({tables: [], dbType});
            }
          }
        }
        break;
      case 'open':
        fileOpenElem.click();
        break;
      case 'downloadSchema':
        download(JSON.stringify(getCurrentSchema()), 'schema.json', 'application/json');
        break;
      case 'gitHub':
        {
          const win = window.open('https://github.com/ayeressian/db_designer_pwa', '_blank');
          win.focus();
          break;
        }
      case 'downloadApp':
        break;
    }
  });

  menuBarElem.config = config;
}

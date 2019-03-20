import {
  download
} from './download.js';
import {setupOpenSchema, setupDbScehmaFileOpen} from './fileOpenSetup.js';
import fromViewToDbSchema from './generation/fromViewToDbSchema.js';

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
    }, {
      title: 'import/export',
      items: [{
        id: 'exportSql',
        title: 'Export SQL'
      }, {
        id: 'importSql',
        title: 'Import SQL'
      }]
    },
    {
      id: 'help',
      title: 'Help',
      items: [{
        id: 'reportIssue',
        title: 'Report an issue'
      }, {
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
  const dbSchemaFileOpenElem = document.getElementById('db_schema_file_open');
  const chooseDbDialog = document.querySelector('choose-db-dialog');

  setupOpenSchema(fileOpenElem, setSchema);
  setupDbScehmaFileOpen(dbSchemaFileOpenElem, setSchema, () => chooseDbDialog.getDbType());

  const genDbSchemaFromView = () => {
    const schema = getCurrentSchema();
    const result = fromViewToDbSchema(schema, schema.dbType);
    download(result, 'schema.sql', 'text/plain');
  };

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
      case 'exportSql':
        genDbSchemaFromView();
        break;
      case 'importSql':
        dbSchemaFileOpenElem.click();
        break;
      case 'gitHub':
        {
          const win = window.open('https://github.com/ayeressian/dbgrapher', '_blank');
          win.focus();
        }
        break;
      case 'reportIssue':
        {
          const win = window.open('https://github.com/ayeressian/dbgrapher/issues', '_blank');
          win.focus();
        }
        break;
      case 'downloadApp':
        break;
    }
  });

  menuBarElem.config = config;
}

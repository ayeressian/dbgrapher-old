/* global require, process, __dirname */

const {
  app,
  BrowserWindow,
  Menu,
  dialog
} = require('electron');
const url = require('url');
const path = require('path');

app.setName('DB Designer');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600
  });

  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  win.webContents.openDevTools();

  win.on('closed', () => {
    win = null;
  });

  const template = [{
      label: 'appName',
      submenu: [{
        label: `Quit ${app.getName()}`,
        click() {
          app.quit();
        }
      }]
    }, {
      label: 'File',
      submenu: [{
          label: 'Open',
          click() {
            dialog.showOpenDialog(win, {
              properties: ['openFile'],
              filters: [{
                name: 'json',
                extensions: ['json']
              }]
            }, (filePaths) => {
              if (filePaths && filePaths.length > 0) {
                win.webContents.send('file-to-load', filePaths[0]);
              }
            });
          }
        },
        {
          label: 'Close Window',
          click() {
            win.close();
          }
        }
      ]
    }
  ];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});

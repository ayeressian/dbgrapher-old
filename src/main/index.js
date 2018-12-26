'use strict';

/* global process, __dirname */

import {
  app,
  BrowserWindow,
  dialog,
  Menu
} from 'electron';
import * as path from 'path';
import {
  format
} from 'url';

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow;

function createMainWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600
  });
  mainWindow.loadURL(format({
    pathname: path.join(__dirname, '../renderer/index.html'),
    protocol: 'file',
    slashes: true
  }));

  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.webContents.on('devtools-opened', () => {
    mainWindow.focus();
    setTimeout(() => {
      mainWindow.focus();
    });
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
        label: 'New',
        click: () => {
          mainWindow.webContents.send('file-new');
        }
      }, {
        label: 'Save',
        click: () => {
          dialog.showSaveDialog(mainWindow, {
            filters: [{
              name: 'JSON',
              extensions: ['json']
            }]
          }, (filePaths) => {
            mainWindow.webContents.send('file-save', filePaths);
          });
        }
      }, {
        label: 'Open',
        click() {
          dialog.showOpenDialog(mainWindow, {
            properties: ['openFile'],
            filters: [{
              name: 'json',
              extensions: ['json']
            }]
          }, (filePaths) => {
            if (filePaths && filePaths.length > 0) {
              mainWindow.webContents.send('file-to-load', filePaths[0]);
            }
          });
        }
      },
      {
        label: 'Close Window',
        click() {
          mainWindow.close();
        }
      }
    ]
  }, {
    label: 'Operations',
    submenu: [{
        label: 'Generate view from DB schema',
        click: () => {
          mainWindow.webContents.send('gen-view-from-db-psql');
        }
      },
      {
        label: 'Generate DB schema from view',
        click: () => {
          mainWindow.webContents.send('gen-db-from-view');
        }
      }
    ]
  }];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  return mainWindow;
}

// quit application when all windows are closed
app.on('window-all-closed', () => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (mainWindow === null) {
    mainWindow = createMainWindow();
  }
});

// create main BrowserWindow when electron is ready
app.on('ready', () => {
  mainWindow = createMainWindow();
});

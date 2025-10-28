const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  const startX = Math.random() * (width - 250);
  const startY = Math.random() * (height - 250);

  mainWindow = new BrowserWindow({
    width: 250,
    height: 250,
    x: startX,
    y: startY,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile('index.html');

  ipcMain.on('move-window', (event, x, y) => {
    mainWindow.setBounds({ x: Math.round(x), y: Math.round(y), width: 250, height: 250 });
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

const { app, BrowserWindow, ipcMain } = require('electron/main');
const path = require('path');
let isWinMaximized = false

const createWindow = () => {
  const win = new BrowserWindow({
    titleBarStyle: 'hidden',
    width: 1024,
    height: 778,
    icon: 'static/icons/icon512.png',
    transparent: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),  // Add this
      contextIsolation: true,
      nodeIntegration: true,
    }
  })

  win.loadFile('client.html')
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.on('window-control', (event, action) => {
  const win = BrowserWindow.getFocusedWindow();
  if (!win) return;

  switch (action) {
    case 'close':
      win.close();
      break;
    case 'minimize':
      win.minimize();
      break;
    case 'maximize':
      if (win.isMaximized()) {
        win.restore();
        isWinMaximized = false
      } else {
        win.maximize();
        isWinMaximized = true
      }
      break;
    case 'restore':
      win.restore();
      break;
  }
});

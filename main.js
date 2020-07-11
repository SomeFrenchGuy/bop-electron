const { app, BrowserWindow } = require('electron')

let mainWindow;

function createWindow () {

  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    center:true,
    frame: false,
    icon:"res/img/logo.png",
    webPreferences: {
      nodeIntegration: true
    }
  });
  mainWindow.setResizable(false);

  mainWindow.loadFile('web/main.html')
  mainWindow.on('closed', () => {mainWindow = null;})
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

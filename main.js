const { app, BrowserWindow,dialog, ipcMain } = require('electron')
const { spawn } = require("child_process");


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

ipcMain.on('fileSelect', (event, args) => {
  let options = {
    title : "Main file of the game",
    defaultPath : args[0],
    buttonLabel : "Select",
    properties: [args[1]] //openDirectory fix
  }
  dialog.showOpenDialog(options)
  .then(result => {
      event.returnValue = result.filePaths;
    }).catch(err => {
      console.log(err)
    })
});

ipcMain.on('runFile', (event, args) =>{
  let bashCommand;
  if (args.slice(args.length - 4)==".exe"){
    console.log("======WINE======");
    bashCommand = spawn("wine", [args]);
  }else {
    bashCommand = spawn(args, [""]);
  };

  bashCommand.stdout.on("data", data => {console.log(`stdout: ${data}`);});

  bashCommand.stderr.on("data", data => {console.log(`stderr: ${data}`);});

  bashCommand.on('error', (error) => {console.log(`error: ${error.message}`);});

  bashCommand.on("close", code => {console.log(`child process exited with code ${code}`);});
});

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

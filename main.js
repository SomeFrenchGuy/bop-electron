const { app, BrowserWindow,dialog, ipcMain } = require('electron')
const { spawn } = require("child_process");
const fs = require('fs');


let mainWindow;
let FLWindow;
console.log(__dirname)

function createWindow () {

  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    center:true,
    frame: false,
    icon:__dirname+"/res/img/logo.png",
    webPreferences: {
      nodeIntegration: true
    }
  });
  mainWindow.setResizable(false);



  mainWindow.loadFile(__dirname+'/web/html/main.html')

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
  mainWindow.minimize();
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

ipcMain.on('firstLaunch', (event, args) => {
  console.log("======FIRST-LAUNCH-WINDOW======")
  mainWindow.hide();

  FLWindow = new BrowserWindow({
    width: 700,
    height:600,
    center:true,
    frame: false,
    icon:__dirname+"/res/img/logo.png",
    parent: mainWindow,
    webPreferences: {
      nodeIntegration: true
    }
  });
  FLWindow.setResizable(false);

  FLWindow.loadFile(__dirname+'/web/html/FLW.html')

  mainWindow.on('closed', () => {FLWindow = null;})
})

ipcMain.on("endFirstConfig",  (event, args) => {
  mainWindow.reload();
  mainWindow.show();
})

ipcMain.on("write", (event, args) => {
  fs.writeFile(__dirname+args[0], JSON.stringify(args[1]), err => {if (err) {console.log('Error writing file', err)}else{console.log('Successfully wrote file')}})
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

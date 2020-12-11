const ipc = require('electron').ipcRenderer;
const jquery = require('jquery');
const fs = require('fs');

let up

jquery.ajax({
    type: "GET",
    url: "../../res/data/config.json",
    async: true,
    success : function(text) {
      up=text;
    }
});

function showThemThePowerOfFileBrowser() {
  path = ipc.sendSync("fileSelect",["","openDirectory"]);
  if(path != "") {
  document.getElementById("folderText").innerHTML=path;
  document.getElementById("flee").style.visibility = "visible";
  }
}

function letzgo (){
  up.gamesFolder = document.getElementById("folderText").innerHTML
  fs.writeFile('./res/data/config.json', JSON.stringify(up), err => {if (err) {console.log('Error writing file', err)}else{
    console.log('Successfully wrote file')
    ipc.send("endFirstConfig");
    const remote = require('electron').remote
    let w = remote.getCurrentWindow()
    w.close()
  }})
}

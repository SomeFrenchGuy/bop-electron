const fs = require('fs');

let userPreference;
let gameView;
const mainDiv = document.getElementById("page")

//Get the config file
const getJSONConfig = new XMLHttpRequest();
getJSONConfig.onreadystatechange = function() {
  if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {userPreference = JSON.parse(this.responseText);};
};
getJSONConfig.open("GET", "../res/data/config.json");

//Get the game view model
const getHTMLGameView = new XMLHttpRequest();
getHTMLGameView.onreadystatechange = function() {
  if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {gameView = this.responseText;};
};
getHTMLGameView.open("GET", "../web/game_view.html");

getHTMLGameView.send();
getJSONConfig.send();
setTimeout(page_library_show,500);


//Show the library
function page_library_show(){
  document.getElementById("page_library_button").style.textDecoration="underline";
  fs.readdir(userPreference.gamesFolder, function (err, files) {

    if (err) {
      console.log('Unable to scan directory: ' + err);
    }

    //Creating the page
    mainDiv.innerHTML="";
    if (files.length === 0){
      mainDiv.innerHTML ="<p>No games found ...</p>";
    }

    files.forEach(function (file) {
      let actualGame = gameView.replace("fill1",file);
      actualGame = actualGame.replace("fill2","ff1616");
      actualGame = actualGame.replace("fill3","Configuration required");
      mainDiv.innerHTML += actualGame;
    });
  });
};

function quitThisDammApp(){
  const remote = require('electron').remote
  let w = remote.getCurrentWindow()
  w.close()
}

function page_preference_show(){
  mainDiv.innerHTML = "<p>Coming soon...<p>";
}

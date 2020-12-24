const fs = require('fs');
const ipc = require('electron').ipcRenderer;
const jquery = require('jquery')

let recentGames = new Array();
let database = new Object();
const mainDiv = document.getElementById("page")

//Get the config file
jquery.ajax({
    type: "GET",
    url: "../../res/data/config.json",
    async: false,
    success : function(text) {
      userPreference=text;
    }
});

//get the history of games
jquery.ajax({
    type: "GET",
    url: "../../res/data/recent.json",
    async: false,
    success : function(text) {
      recentGames=text;
    }
});

//Get the game view model
jquery.ajax({
    type: "GET",
    url: "../../web/html/game_view.html",
    async: false,
    success : function(text) {
      gameView=text;
    }
});

//Get the shearch bar model
jquery.ajax({
    type: "GET",
    url: "../../web/html/search_bar.html",
    async: false,
    success : function(text) {
      searchBarView=text;
    }
});

//Get the game's pref view model
jquery.ajax({
    type: "GET",
    url: "../../web/html/gpref_view.html",
    async: false,
    success : function(text) {
      gprefView=text;
    }
});

//Get the preference page model
jquery.ajax({
    type: "GET",
    url: "../../web/html/bop_pref_view.html",
    async: false,
    success : function(text) {
      bop_pref_view=text;
    }
});

if (userPreference.gamesFolder == null) {
  ipc.send("firstLaunch");
}
load_database();
page_library_show();

//==============================================================================
//================================DATABASE======================================

function save_database(){
  ipc.send("write", ['/res/data/id.json', database.id])
  ipc.send('write', ['/res/data/gpath.json', database.path])
  ipc.send('write', ['/res/data/gname.json', database.name])
  ipc.send('write', ['/res/data/gmain.json', database.main])
}

function load_database() {
  //Get the id list
  jquery.ajax({
      type: "GET",
      url: "../../res/data/id.json",
      async: false,
      success : function(text) {
        database.id=text;
      }
  });

  //Get the name list
  jquery.ajax({
      type: "GET",
      url: "../../res/data/gname.json",
      async: false,
      success : function(text) {
        database.name=text;
      }
  });

  //Get the main file list
  jquery.ajax({
      type: "GET",
      url: "../../res/data/gmain.json",
      async: false,
      success : function(text) {
        database.main=text;
      }
  });

  //Get the path list (id file but invert)
  jquery.ajax({
      type: "GET",
      url: "../../res/data/gpath.json",
      async: false,
      success : function(text) {
        database.path=text;
      }
  });
};

//==============================================================================
//==================================LIBRARY=====================================

//Show the library
function page_library_show(){
  //a refaire mais flemme la
  document.getElementById("page_preference_button").style.textDecoration="none";
  document.getElementById("page_library_button").style.textDecoration="underline";

  fs.readdir(userPreference.gamesFolder, function (err, files) {
    if (err) {
      mainDiv.innerHTML ="<p>Error with games folder directory <br><br>Please check your preference</p>";
      console.log('Unable to scan directory: ' + err);
    } else if (files.length === 0){
      mainDiv.innerHTML ="<p>No games found ...</p>";
    //if everythings is fine
    }else {
      generate_library(files=files)
      mainDiv.innerHTML=searchBarView.replace("s"+userPreference.sortBy, "selected")+mainDiv.innerHTML;

      document.getElementById("searchInput").oninput = function(){
        gl = document.getElementsByClassName("game_div");
        for (let item of gl) {
          item_name = item.childNodes[1].childNodes[1].innerText
          //if the game correspond to the research
          if (item_name.toLowerCase().startsWith(document.getElementById("searchInput").value.toLowerCase())){
            try{
              item.classList.remove("NobodyLovesYou");
            }catch {}
          } else {
            item.classList.add("NobodyLovesYou");
          }; //else if to test what's game status
        }; //for loop to test every game
      }; // listenner on the search bar

    };//else if to catch error and exeptions
  }); //fs.readdir loop
}; //function

//Creating the page
function generate_library(files){
  mainDiv.innerHTML="";

  switch (userPreference.sortBy){

    //SHORT BY NAME
    case 0:
      console.log("[Library generation]: Sort by name")
      files = files.sort(function (a, b) {return a.toLowerCase().localeCompare(b.toLowerCase());}); //sort but with lowercase, this is not my snipet
      sortedFiles = Object.values(database.name).sort(function (a, b) {return a.toLowerCase().localeCompare(b.toLowerCase());}) //same here
      sortedFiles.reverse().forEach(function(name){
        path = database.path[getKeyByValue(database.name, name)];
        if (files.indexOf(path) != -1){ //check if games still in folder
          files.splice(files.indexOf(path),1);
          files.unshift(path);
        }
      })
      break;

    //SHORT BY LAST USE
    case 1:
      console.log("[Library generation]: Sort by last use")
      recentGames.forEach(function (id){
        if (database.path[id] ){  // prevent from ghost games "bugs" by testing if game exist
          if(files.indexOf(database.path[id]) != -1){
            files.splice(files.indexOf(database.path[id]),1);
            files.unshift(database.path[id]);
          }
        }
      });
      break;

    //SHORT BY TIME PLAYED
    case 2:
      //INCOMING IN THE FUTURE
      console.log("[Library generation]: Sort by time played")
  }

  let unconfGames = "";
  files.forEach(function (file) {
    let actualGame = gameView;
    id = database.id[file];
    if(id){
      actualGame = actualGame.replace("fill0",id);
      actualGame = actualGame.replace("fill1",database.name[id]);
      actualGame = actualGame.replace("fill2","008037");
      actualGame = actualGame.replace("fill3","Ready");
      actualGame = actualGame.replace("fill4","on");
      actualGame = actualGame.replace("fill5", " onclick=\"play(this)\"")
      mainDiv.innerHTML += actualGame;
    }else{
      actualGame = actualGame.replace("fill0",file);
      actualGame = actualGame.replace("fill1",file);
      actualGame = actualGame.replace("fill2","ff1616");
      actualGame = actualGame.replace("fill3","Configuration required");
      actualGame = actualGame.replace("fill4","off");
      actualGame = actualGame.replace("fill5", "")
      unconfGames += actualGame;
    };
  });
  mainDiv.innerHTML += unconfGames;
}

function change_sortBy(mode){
  userPreference.sortBy = parseInt(mode);
  ipc.send("write", ['/res/data/config.json', userPreference])
  page_library_show();
}

function play(button){
  //get the id of the game
  let id = button.parentElement.parentElement.id;
  //run the game
  ipc.send('runFile',userPreference.gamesFolder+"/"+database.path[id]+database.main[id])

  //uptading history
  if (recentGames.indexOf(id) != -1){ //test if the game is already in the array then delete it
    recentGames.splice(recentGames.indexOf(id),1);
  }
  recentGames[recentGames.length] = parseInt(id) // just for the first item it can't be +=
  ipc.send("write", ['/res/data/recent.json', recentGames])

  if(userPreference.sortBy == 1){ //when user return to interface their game is now up
    page_library_show();
  }
}

function gear_hover(element) {
  element.setAttribute('src', '../../res/img/gear2.png');
}

function gear_unhover(element) {
  element.setAttribute('src', '../../res/img/gear1.png');
}

//==============================================================================
//===============================GPREF==========================================

function gpref_show(g){
  let gp = gprefView;
  let id = g.parentElement.parentElement.id;
  //IMPORTANT: id equals to the file's name if the game isn't configured
  if(database.name[id]){
    //game already configured
    gp = gp.replace(/fill0/gi,database.name[id]);
    gp = gp.replace(/fill1/gi,"value=.."+database.main[id]);
    gp = gp.replace(/fill2/gi,database.path[id]);
  }else{
    gp = gp.replace(/fill0/gi,id);
    gp = gp.replace(/fill1/gi,"");
    gp = gp.replace(/fill2/gi,id);
  };
  mainDiv.innerHTML = gp;
}

function fileSelect(g){
  //get the file's directory then make it relative
  path = ipc.sendSync("fileSelect", [userPreference.gamesFolder.concat(g), "openFile"]);
  relativePath = String(path).replace(userPreference.gamesFolder+g, "");

  //test if the selected file is in the game folder (if isn't, replace wouldn't work and return the same string as sent)
  if (relativePath != path){
    document.getElementById("InputMain").value= ".."+relativePath;
    if(relativePath.includes(" ",0)){
      alert("Main file with espace may create several problems, please rename the file before trying to run it")
    }
  } else if (relativePath != "") {
    alert("The excecutable file must be in the game folder")
  };
};

function save_gpref(g){
  if (document.getElementById("InputMain").value != ""){
    // g == game's folder
    if(!database.id[g]){
      id = Date.now();
      database.id[g] = id;
    }else {
      id=database.id[g];
    }
    database.path[id] = g;
    database.name[id]=document.getElementById("InputName").value;
    database.main[id]=document.getElementById("InputMain").value.replace("..","");

    save_database()
    load_database();
    page_library_show();
  } else {
    alert("Error: please indicate the file to execute");
  }
}

function delete_gpref(g){
  id = database.id[g];
  if (database.name[id]){
    delete database.id[g];
    delete database.path[id];
    delete database.name[id];
    delete database.main[id];
    if (recentGames.indexOf(id) != -1){
      console.log("?");
      recentGames.splice(recentGames.indexOf(id),1);
      fs.writeFile('./res/data/recent.json', JSON.stringify(recentGames), err => {if (err) {console.log('Error writing file', err)}else{console.log('deleted from recentGame array')}});
    };
    save_database();
  };
  load_database();
  page_library_show();
}

//==============================================================================
//===============================BOP-PREF=======================================

//Show Bop's preference
function page_preference_show(){
  //a refaire mais flemme la
  document.getElementById("page_library_button").style.textDecoration="none";
  document.getElementById("page_preference_button").style.textDecoration="underline";
  let prefView = bop_pref_view;
  prefView = prefView.replace(/fill0/gi, userPreference.version);
  prefView = prefView.replace(/fill1/gi, userPreference.gamesFolder);
  mainDiv.innerHTML = prefView;
};

function gamesFolderSelect(){
  path = ipc.sendSync("fileSelect",["","openDirectory"]);
  if (path != ""){
    document.getElementById("inputGamesFolder").value = path;
    userPreference.gamesFolder = path[0];
    ipc.send("write", ['/res/data/config.json', userPreference])
  }
}

function manualSelect(){
  userPreference.gamesFolder = document.getElementById("inputGamesFolder").value;
  ipc.send("write", ['/res/data/config.json', userPreference])
}

//==============================================================================
//=============================OTHERS-RDM-FUNCTION==============================

function heros(){
  jquery.ajax({
      type: "GET",
      url: "https://linktr.ee/Stainy",
      async: false,
      success : function(text) {
        herosView=text;
      }
  });
  mainDiv.innerHTML = herosView;
}

function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}

//just a rdm tool to use in terminal
function resetEverything(){
  userPreference.gamesFolder = null;
  userPreference.theme = "orange";
  userPreference.sortBy = 0;
  ipc.send("write", ['/res/data/config.json', userPreference])
  ipc.send("write", ['/res/data/recent.json', new Array])
  database.id={};
  database.path={};
  database.name={};
  database.main={};
  save_database();
}

function quitThisDammApp(){
  const remote = require('electron').remote
  let w = remote.getCurrentWindow()
  w.close()
};

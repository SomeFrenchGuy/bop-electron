const fs = require('fs');
const ipc = require('electron').ipcRenderer;
const jquery = require('jquery')

let userPreference;
let gameView;
let searchBarView;
let bop_pref_view;
let database = new Object();
const mainDiv = document.getElementById("page")

//Get the config file
jquery.ajax({
    type: "GET",
    url: "../res/data/config.json",
    async: false,
    success : function(text) {
      userPreference=text;
    }
});

//Get the game view model
jquery.ajax({
    type: "GET",
    url: "../web/game_view.html",
    async: false,
    success : function(text) {
      gameView=text;
    }
});

jquery.ajax({
    type: "GET",
    url: "../web/search_bar.html",
    async: false,
    success : function(text) {
      searchBarView=text;
    }
});

//Get the game's pref view model
jquery.ajax({
    type: "GET",
    url: "../web/gpref_view.html",
    async: false,
    success : function(text) {
      gprefView=text;
    }
});

jquery.ajax({
    type: "GET",
    url: "../web/bop_pref_view.html",
    async: false,
    success : function(text) {
      bop_pref_view=text;
    }
});

load_database();
page_library_show();

//==============================================================================
//==============================================================================

function save_database(){
  fs.writeFile('./res/data/id.json', JSON.stringify(database.id), err => {if (err) {console.log('Error writing file', err)}else{console.log('Successfully wrote file')}})
  fs.writeFile('./res/data/gpath.json', JSON.stringify(database.path), err => {if (err) {console.log('Error writing file', err)}else{console.log('Successfully wrote file')}})
  fs.writeFile('./res/data/gname.json', JSON.stringify(database.name), err => {if (err) {console.log('Error writing file', err)}else{console.log('Successfully wrote file')}})
  fs.writeFile('./res/data/gmain.json', JSON.stringify(database.main), err => {if (err) {console.log('Error writing file', err)}else{console.log('Successfully wrote file')}})
}

function load_database() {
  //Get the id list
  jquery.ajax({
      type: "GET",
      url: "../res/data/id.json",
      async: false,
      success : function(text) {
        database.id=text;
      }
  });

  //Get the name list
  jquery.ajax({
      type: "GET",
      url: "../res/data/gname.json",
      async: false,
      success : function(text) {
        database.name=text;
      }
  });

  //Get the main file list
  jquery.ajax({
      type: "GET",
      url: "../res/data/gmain.json",
      async: false,
      success : function(text) {
        database.main=text;
      }
  });

  //Get the path list (id file but invert)
  jquery.ajax({
      type: "GET",
      url: "../res/data/gpath.json",
      async: false,
      success : function(text) {
        database.path=text;
      }
  });
};

//==============================================================================
//==============================================================================

//Show the library
function page_library_show(){
  //a refaire mais flemme la
  document.getElementById("page_preference_button").style.textDecoration="none";
  document.getElementById("page_library_button").style.textDecoration="underline";

  fs.readdir(userPreference.gamesFolder, function (err, files) {
    if (err) {
      mainDiv.innerHTML ="<p>Error with game's folder directory</p>";
      alert('Unable to scan directory: ' + err);
    } else if (files.length === 0){
      mainDiv.innerHTML ="<p>No games found ...</p>";
    //if everythings is fine
    }else {
      generate_library(files=files)
      mainDiv.innerHTML=searchBarView+mainDiv.innerHTML;

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
//Actually useless as a function right now but could be very useful to make some "order by name" or shit like that in the future
function generate_library(files,filter=""){
  mainDiv.innerHTML="";
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
      //ready game go up
      mainDiv.innerHTML = actualGame+mainDiv.innerHTML;
    }else{
      actualGame = actualGame.replace("fill0",file);
      actualGame = actualGame.replace("fill1",file);
      actualGame = actualGame.replace("fill2","ff1616");
      actualGame = actualGame.replace("fill3","Configuration required");
      actualGame = actualGame.replace("fill4","off");
      actualGame = actualGame.replace("fill5", "")
      mainDiv.innerHTML += actualGame;
    };
  });
}

function play(button){
  //get the id of the game
  let id = button.parentElement.parentElement.id;
  ipc.send('runFile',userPreference.gamesFolder+"/"+database.path[id]+database.main[id])
}

function gear_hover(element) {
  element.setAttribute('src', '../res/img/gear2.png');
}

function gear_unhover(element) {
  element.setAttribute('src', '../res/img/gear1.png');
}

//==============================================================================
//==============================================================================

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
    save_database();
  };
  load_database();
  page_library_show();
}

//==============================================================================
//==============================================================================

//Show Bop's preference
function page_preference_show(){
  //a refaire mais flemme la
  document.getElementById("page_library_button").style.textDecoration="none";
  document.getElementById("page_preference_button").style.textDecoration="underline";

  bop_pref_view = bop_pref_view.replace(/fill0/gi, userPreference.version)
  bop_pref_view = bop_pref_view.replace(/fill1/gi, userPreference.gamesFolder)
  mainDiv.innerHTML = bop_pref_view;
};

function gamesFolderSelect(){
  path = ipc.sendSync("fileSelect",["","openDirectory"]);
  if (path != ""){
    document.getElementById("inputGamesFolder").value = path;
    //idk why path is becoming an array whens stringify, path[0] fix it
    userPreference.gamesFolder = path[0];
    fs.writeFile('./res/data/config.json', JSON.stringify(userPreference), err => {if (err) {console.log('Error writing file', err)}else{console.log('Successfully wrote file')}})
  }
}

//==============================================================================
//==============================================================================

function quitThisDammApp(){
  const remote = require('electron').remote
  let w = remote.getCurrentWindow()
  w.close()
};

function id(idString){
	return document.getElementById(idString);
}
var divs = document.getElementsByTagName('div');
var boxes = document.getElementsByClassName('box');
var app = divs[0];
var controls = divs[1];
var picture = divs[2];
var choices = id("choices");
var pictureFrame = id("picture");
var songTitle = id("songTitle");


// have window object handle resize event and load event
window.addEventListener("load", flipFlop);
window.addEventListener("resize", flipFlop);


//make a resize handler
function flipFlop(evtObj){
  var winWidth = window.innerWidth;
  var winHeight = window.innerHeight;
  if(winWidth >= winHeight){
    makeHorizontal();
  }
  else{
    makeVertical();
  }
  //--helper functions ---
  function makeVertical(){
    //alert("Gotta make it VERTICAL ||||");
    for(var i= 0; i < boxes.length; i++){
      if(boxes[i].classList.contains("horizontal")){
        boxes[i].classList.remove("horizontal");
      }
      boxes[i].classList.add("vertical")
    }
  }
  function makeHorizontal(){
    //alert("Gotta make it HORIZONTAL ----")
    for(var i=0; i < boxes.length; i++){
      if(boxes[i].classList.contains("vertical")){
        boxes[i].classList.remove("vertical");
      }
      boxes[i].classList.add("horizontal");
    }
  }
}

choices.addEventListener("change", playNewSong);
window.addEventListener("load", function(e){
    adjustRem();
    choices.selectedIndex = 0;
    songTitle.innerHTML = "";
});
window.addEventListener("resize", adjustRem);
function adjustRem(e){
    document.documentElement.style.fontSize = (window.innerWidth / 50) + "px";
}
function playNewSong(){
	var index = choices.selectedIndex;
	showThePicture();
	showTheTitle();
	playTheSong();
	//---helper functions below----//
	function showThePicture(){
        if ( index !== 0 ){
            //use the index to get the name of the picture
            var pictureFile = songs[index].picture + ".png";
            var picturePath = "pictures/" + pictureFile;
            //Set the picture as the background of the frame;
            pictureFrame.style.background = "url(" + picturePath + ") no-repeat center";
            pictureFrame.style.backgroundSize = "contain";
        }
        else{
            pictureFrame.style.background = "black";
        }
	}
	function showTheTitle(){
        if ( index !== 0){
            songTitle.innerHTML = songs[index].song;
        }
	}
	function playTheSong(){
		//point the player's scr property to the song's title with .mp3 extention
		//play the player: player.play();
		player.src = "songs/" + songs[index].song + ".mp3";
		player.play();
	}
}














/*
	Quick and dirty music player.
	When a song is selected
	1.) Its picture will show in the frame.
	2.) The song will play.
	
*/
//HTML element wrapper
function id(idString){
	return document.getElementById(idString);
}
// Gather all the elements
var choices = id("choices");
var pictureFrame = id("pictureFrame");
var songTitle = id("songTitle");

//listen for a change event in the choices element
choices.addEventListener("change", playNewSong);
window.addEventListener("load", function(e){
    adjustRem();
    choices.selectedIndex = 0;
    songTitle.innerHTML = "";
});
window.addEventListener("resize", adjustRem);

//event handler functions below
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
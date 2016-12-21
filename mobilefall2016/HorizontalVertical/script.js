var divs = document.getElementsByTagName('div');
var boxes = document.getElementsByClassName('box');
var app = divs[0];
var controls = divs[1];
var picture = divs[2];

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

















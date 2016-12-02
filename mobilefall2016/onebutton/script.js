var btn = document.getElementById("btn");
var msg = document.getElementById("msg");
var events = ["mousedown","mouseup","mouseout","mouseover"];
/*btn.addEventListener("mousedown", eventCallback);
btn.addEventListener("mouseup", eventCallback);
btn.addEventListener("mouseout", eventCallback);
btn.addEventListener("mouseover", eventCallback);*/
 
function handler(event){
    if(event.target === btn);
    btn.innerHTML = events.type;
}

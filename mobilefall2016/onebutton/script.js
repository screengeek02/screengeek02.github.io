var btn = document.getElementById("btn");
var msg = document.getElementById("msg");
var events = ["mousedown","mouseup","mouseout","mouseover"];
/*btn.addEventListener("mousedown", eventCallback);
btn.addEventListener("mouseup", eventCallback);
btn.addEventListener("mouseout", eventCallback);
btn.addEventListener("mouseover", eventCallback);*/
 
function handler(events){
    msg.innerHTML = events.type;
}

var btn = document.getElementById("btn");
var msg = document.getElementById("msg");
var events = ["mousedown", "mouseup", "mouseout", "mouseover"];

function handler(event) {
    if (event.target === btn) {
        msg.textContent = event.type;
    }
}

events.forEach(function (type) {
    btn.addEventListener(type, handler);
});

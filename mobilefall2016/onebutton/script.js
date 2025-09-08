var btn = document.getElementById("btn");
var msg = document.getElementById("msg");

function handler(event) {
    msg.textContent = event.type;
}

["mousedown", "mouseup", "mouseout", "mouseover"].forEach(function (type) {
    btn.addEventListener(type, handler);
});

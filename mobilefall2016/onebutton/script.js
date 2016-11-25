/*var btn = document.getElementById("btn");
var msg = document.getElementById("msg");

function eventCallback(e){
    msg.innerHTML = e.type;
}

btn.addEventListener("mousedown", eventCallback);
btn.addEventListener("mouseup", eventCallback);
btn.addEventListener("mouseout", eventCallback);
btn.addEventListener("mouseover", eventCallback);*/
function main(){
    $('.msg').hide();
    $('.btn').on('click', function(){
        $('msg').toggle();
    });
}

$(document).ready(main);
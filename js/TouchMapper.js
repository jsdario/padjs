/*jslint plusplus: true */
/*jslint white: true */
/*global FileReader, Audio, console*/

/* 
*   Mejor identificar si el el usuario lleva móvil
*   y se carga una web diferente, para los touch events
*   sin key bindings pero con scheduler.
*   play es siempre loop.
*/

function TouchMapper(element) {
    'use strict';
    var div = document.querySelector(element);
    div.addEventListener("touchstart", this.handler, true);
    div.addEventListener("touchmove", this.handler, true);
    div.addEventListener("touchend", this.handler, true);
    div.addEventListener("touchcancel", this.handler, true);
}

TouchMapper.prototype.handler = function (event) {
    'use strict';
    var first, touches, type, button, simulatedEvent;
    touches = event.changedTouches;
    first = touches[0];
    button = 0;
    type = "";
    switch (event.type) {
        case "touchstart":
            type = "mousedown";
            break;
        case "touchmove":
            type="mousemove";
            break;
        case "touchend":
            type="mouseup";
            break;
        default: return;
    }

    //initMouseEvent(type, canBubble, cancelable, view, clickCount,
    // screenX, screenY, clientX, clientY, ctrlKey,
    // altKey, shiftKey, metaKey, button, relatedTarget);

    simulatedEvent = document.createEvent("MouseEvent");
    simulatedEvent.initMouseEvent(type, true, true, window, 1,
                                  first.screenX, first.screenY,
                                  first.clientX, first.clientY, false,
                                  false, false, false, button, null);

    first.target.dispatchEvent(simulatedEvent);
    event.preventDefault();
};

var tm = new TouchMapper("#pad");
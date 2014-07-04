/*jslint plusplus: true */
/*jslint white: true */
/*global FileReader, Audio, console, Scheduler, now*/
var LONG_SAMPLE_TIME = 2;

function Tile(pad, div) {
    'use strict';
    /* Empty constructor */
    if (!pad && !div) {
        return;
    }
    var self = this;
    self.pad =  pad;
    self.div =  div;
    self.lt  = null;
    self.track  = null;
    self.player = null;
    /* Funciones */
    self.div.onmousedown = function (e) {
        /* Escuchadores de shortcut */
        if (e.which === 1) {
            self.notify('play');
            self.play();
            if (self.pad.state !== 'pressed') {
                window.onkeydown  = function (event) {
                    self.assign(event);
                };
                window.onkeyup = null;
            }
            if (self.scheduler && self.scheduler.started) {
                self.clear();
            }
        }
    };
    self.div.onmouseup = function (e) {
        if (e.which === 1) {
            window.onkeypress = null;
            self.notify('stop');
            self.pad.listen();
            self.stop();
        }
    };
    self.div.oncontextmenu = function (e) {
        self.stop();
        /* Aqui va el menu de opciones, de momento, volumen */
        console.log('tile options here!');
        e.preventDefault();
        e.stopPropagation();
        return false;
    };
    self.listenDragAndDrop();
}

Tile.prototype = {
    constructor: Tile,
    free: function (now) {
        'use strict';
        if (this.track) {
            this.div.setAttribute("class", "tile playable");
            if(this.scheduler) {
                this.div.setAttribute("class", "tile scheduling");
            }
            if(!now && !this.player.paused) {
                this.div.setAttribute("class", "tile playing");
            }
        } else {
            this.div.setAttribute("class", "tile");
        }
    },
    play: function () {
        'use strict';
        if (this.player) {
            /* Looping */
            if (this.player.duration > LONG_SAMPLE_TIME) {
                this.player.addEventListener('ended', function () {
                    this.play();
                }, false);
            } else {
                /* Rebobinar al volver a pulsar */
                this.player.currentTime = 0;
            }
            this.player.play();
            this.div.setAttribute("class", "tile playing");
        } else {
            this.div.setAttribute("class", "tile pressed");
        }
    },
    stop: function () {
        'use strict';
        if (this.player) {
            if (this.player.duration > LONG_SAMPLE_TIME) {
                this.player.currentTime = 0;
                this.player.pause();
                this.free();
            } else {
                this.free('now');
            }
        } else { /* Para pressed por teclado */
            this.free(); 
        }
    },
    load: function (track) {
        'use strict';
        var self = this;
        self.track = track;
        if (self.player === null) {
            self.player = new Audio(track);
            self.div.appendChild(self.player);
        } else {
            self.player.src = track;
        }
        self.player.onloadeddata = function () {
            self.div.setAttribute("class", "tile playable");
        };
    },
    assign: function (key) {
        'use strict';
        key = String.fromCharCode(key.which).toUpperCase();
        if (/[a-zA-Z0-9-_ ]/.test(key)) {
            /* Borrar si ya existe */
            var lt = document.getElementById(key);
            if (lt) {
                lt.innerHTML = "";
                lt.id = "";
            }
            if (this.lt === null) {
                lt  = document.createElement('div');
                this.div.appendChild(lt);
                lt.className = 'lt';
                this.lt = lt;
                this.key = key;
            } else {
                /* Quitar escuchadores anteriores */
                this.pad.tiles[this.lt.id] = null;
            }
            this.lt.id = key;
            this.lt.innerHTML = key;
            this.pad.tiles[key] = this;
        }
    },
    clear: function () {
        'use strict';
        if (this.scheduler) {
            console.log('Tile.clear()');
            this.scheduler.clear();
            this.free();
        }
    },
    schedule: function () {
        'use strict';
        if(this.track) {
            if (this.scheduler) {
                this.scheduler.start();
            } else {
                this.scheduler = new Scheduler(this);
                this.div.setAttribute("class", "tile scheduling");
            }
        }
    },
    notify: function (action) {
        'use strict';
        if (this.scheduler) {
            console.log(now() + ' #Tile.notify: ' + action.toString());
            this.scheduler.notify({time: now(), action: action});
        }
    },
    listenDragAndDrop: function () {
        'use strict';
        var self = this;
        self.div.ondragover = function (e) {
            self.div.setAttribute("class", "tile selectable");
            e.preventDefault();
        };
        self.div.ondragleave = function (e) {
            self.free();
        };
        self.div.ondrop = function (e) {
            var file, fr;
            file = e.dataTransfer.files[0];
            if (!document.createElement('audio').canPlayType(file.type)) {
                window.alert(file.type + " is not supported by your browser");
                self.free();
                return false;
            }
            fr = new FileReader();
            fr.onload = function (f) {
                self.load(f.target.result);
            };
            fr.readAsDataURL(file);
            e.stopPropagation();
            e.preventDefault();
            return false;
        };
    }
};
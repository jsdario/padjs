/*global FileReader, Audio*/
function Tile(pad, div) {
    'use strict';
    var self = this;
    this.pad =  pad;
    this.div =  div;
    this.lt  = null;
    this.state  = null;
    this.track  = null;
    this.player = null;
    this.scheduler = null;
    /* Funciones */
    this.div.onmousedown = function (e) {
        /* Escuchadores de shortcut */
        if (e.which === 1) {
            self.play();
            if (self.pad.state !== 'pressed') {
                window.onkeydown  = null;
                window.onkeyup    = null;
                window.onkeypress = function (e) {
                    var lt, key;
                    key = String.fromCharCode(e.which).toUpperCase();
                    if (self.lt === null) {
                        /* Borrar si ya existe */
                        lt = document.getElementById(key);
                        if (lt) {
                            lt.id = null;
                            lt.innerHTML = "";
                        }
                        lt  = document.createElement('div');
                        self.div.appendChild(lt);
                        lt.className = 'lt';
                        lt.id = key;
                        self.lt = lt;
                    }
                    self.lt.innerHTML = key;
                    pad.tiles[key] = self;
                };
            }
        }
    };
    this.div.onmouseup = function (e) {
        if (e.which === 1) {
            window.onkeypress = null;
            self.pad.listen();
            self.stop();
        }
    };
    this.div.oncontextmenu = function (e) {
        self.stop();
        self.loop();
        e.preventDefault();
        e.stopPropagation();
        return false;
    };
    this.div.ondragover = function (e) {
        self.div.setAttribute("class", "tile selectable");
        e.preventDefault();
    };
    this.div.ondragleave = function (e) {
        self.free();
    };
    this.div.ondrop = function (e) {
        var file, fr;
        file = e.dataTransfer.files[0];
        if (!document.createElement('audio').canPlayType(file.type)) {
            window.alert(file.type + "is not supported by your browser");
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

Tile.prototype = {
    constructor: Tile,
    free: function () {
        'use strict';
        if (this.track && this.state === null) {
            this.div.setAttribute("class", "tile playable");
        } else if (this.state === 'looping') {
            this.div.setAttribute("class", "tile looping");
        } else if (this.state === 'scheduling') {
            this.div.setAttribute("class", "tile scheduling");
        } else {
            this.div.setAttribute("class", "tile");
        }
    },
    play: function () {
        'use strict';
        this.clear();
        if (this.player) {
            this.player.play();
            this.div.setAttribute("class", "tile playing pressed");
        } else {
            this.div.setAttribute("class", "tile pressed");
        }
    },
    stop: function () {
        'use strict';
        try {
            if (this.player) {
                this.player.pause();
                this.player.currentTime = 0;
                this.player.addEventListener('ended', null, false);
            }
            this.free();
        } catch (e) {
            window.alert(e);
        }
    },
    load: function (track) {
        'use strict';
        var ae, self;
        self = this;
        this.track = track;
        if (this.player === null) {
            this.player = new Audio(track);
            this.div.appendChild(this.player);
        } else {
            this.player.src = track;
        }
        this.player.onloadeddata = function () {
            self.div.setAttribute("class", "tile playable");
        };
    },
    loop: function () {
        'use strict';
        if (this.track) {
            this.state = 'looping';
            this.div.setAttribute("class", "tile looping");
            this.player.addEventListener('ended', function () {
                this.play();
            }, false);
            this.player.play();
        }
    },
    clear: function () {
        'use strict';
        this.state = null;
    },
    schedule: function () {
        'use strict';
        if (this.track) {
            this.className = this.div.className;
            this.div.setAttribute('class',  this.className + ' scheduling');
            this.scheduler = {};
            this.scheduler.start = 0;
            this.scheduler.listening = true;
        }
    }
};
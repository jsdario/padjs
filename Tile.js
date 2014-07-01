/*global FileReader, Audio, console*/
function Tile(pad, div) {
    'use strict';
    /* Empty constructor */
    if (!pad && !div) {
        return;
    }
    var self = this;
    this.pad =  pad;
    this.div =  div;
    this.lt  = null;
    this.state  = null;
    this.track  = null;
    this.player = null;
    this.schedulers = [];
    /* Funciones */
    this.div.onmousedown = function (e) {
        /* Escuchadores de shortcut */
        if (e.which === 1) {
            if (self.state === 'scheduling') {
                self.pad.notify(self, 'play', (new Date()).getTime());
            } else {
                self.clear();
            }
            self.play();
            if (self.pad.state !== 'pressed') {
                window.onkeydown  = function (e) {
                    var key = String.fromCharCode(e.which).toUpperCase();
                    self.assign(key);
                };
                window.onkeyup = null;
            }
        }
    };
    this.div.onmouseup = function (e) {
        if (e.which === 1) {
            if (self.state === 'scheduling') {
                self.pad.notify(self, 'stop', (new Date()).getTime());
            }
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

Tile.prototype = {
    constructor: Tile,
    free: function () {
        'use strict';
        if (this.track) {
            switch (this.state) {
            case 'looping':
                this.div.setAttribute("class", "tile looping");
                break;
            case 'scheduling':
                this.div.setAttribute("class", "tile scheduling");
                break;
            case 'scheduled':
                this.div.setAttribute("class", "tile scheduled");
                break;
            default:
                this.div.setAttribute("class", "tile playable");
            }
        } else {
            this.div.setAttribute("class", "tile");
        }
    },
    play: function () {
        'use strict';
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
    clear: function (state) {
        'use strict';
        if (state && this.state === state) {
            if (this.schedulers.length > 0) {
                this.state = 'scheduled';
            } else {
                this.state = null;
            }
        } else {
            if (this.state === 'scheduled') {
                console.log("Clearing Tile of " + this.schedulers.toString());
                this.schedulers.map(clearInterval);
                this.schedulers = [];
            }
            this.state = null;
        }
    },
    scheduling: function () {
        'use strict';
        try {
            if (this.track) {
                console.log('Tile.scheduling(): Recording events');
                this.state = 'scheduling';
                this.className = this.div.className;
                this.div.setAttribute('class',  this.className + ' scheduling');
            }
        } catch (exception) {
            window.alert('Tile.scheduling(): ' + exception);
        }
    },
    schedule: function (event, frequency) {
        'use strict';
        try {
            var self = this;
            /* No repetir la primera vez */
            if (!frequency) {
                setTimeout(function () {
                    if (event.action === 'play') {
                        self.play();
                    } else {
                        self.stop();
                    }
                }, event.time);
            }
            this.state = 'scheduled';
            console.log('scheduled event:' + event);
            self.schedulers.push(setInterval(function () {
                setTimeout(function () {
                    if (event.action === 'play') {
                        self.play();
                    } else {
                        self.stop();
                    }
                }, event.time);
            }, frequency));
            self.state = 'scheduled';
            self.div.setAttribute('class', 'tile scheduled');
        } catch (exception) {
            window.alert('Tile.schedule(): ' + exception);
        }
    },
    assign: function (key) {
        'use strict';
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
    }
};
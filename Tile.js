/*jslint plusplus: true */
/*jslint white: true */
/*global FileReader, Audio, console, Scheduler, now*/

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
    self.state  = null;
    self.track  = null;
    self.player = null;
    /* Funciones */
    self.div.onmousedown = function (e) {
        /* Escuchadores de shortcut */
        if (e.which === 1) {
            if (self.state !== 'scheduling') {
                self.clear();
            }
            self.play();
            self.notify('play');
            if (self.pad.state !== 'pressed') {
                window.onkeydown  = function (event) {
                    self.assign(event);
                };
                window.onkeyup = null;
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
        console.log('tile options here!');
        e.preventDefault();
        e.stopPropagation();
        return false;
    };
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

Tile.prototype = {
    constructor: Tile,
    free: function (now) {
        'use strict';
        if (this.track) {
            switch (this.state) {
                case 'scheduling':
                    this.div.setAttribute("class", "tile scheduling");
                    break;
                case 'scheduled':
                    this.div.setAttribute("class", "tile scheduled");
                    break;
                default:
                    this.div.setAttribute("class", "tile playable");
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
            this.player.play();
            this.div.setAttribute("class", "tile playing");
            /* Looping */
            if (this.player.duration > 5) {
                this.player.addEventListener('ended', function () {
                    this.play();
                }, false);
            }
        } else {
            this.div.setAttribute("class", "tile pressed");
        }
    },
    stop: function () {
        'use strict';
        if (this.player) {
            if (this.player.duration > 5) {
                this.player.pause();
                this.player.currentTime = 0;
                this.free();
            } else {
                this.free('now');
            }
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
    clear: function (state) {
        'use strict';
        if (state && this.state === state) {
            if (this.intervals.length > 0) {
                this.state = 'scheduled';
            } else {
                this.state = null;
            }
        } else {
            if (this.state === 'scheduled') {
                this.scheduler.clear();
                this.scheduler = null;
                this.events = [];
            }
            this.state = null;
        }
    },
    notify: function (action) {
        'use strict';
        if (this.scheduler) {
            console.log('notifying: ' + action);
            this.events.push({
                action: action,
                time: now()
            });
        }
    },
    scheduling: function () {
        'use strict';
        try {
            if (this.track) {
                this.state = 'scheduling';
                console.log('Tile.scheduling(): Creating scheduler');
                this.div.setAttribute('class', 'tile scheduling');
                this.events = [];
                this.scheduler = new Scheduler();
            }
        } catch (exception) {
            window.alert('Tile.scheduling(): ' + exception);
        }
    },
    schedule: function () {
        'use strict';
        if(this.events && this.events.length > 0) {
            var j, start, events, frequency;
            events = this.events;
            start = events[0].time;
            frequency = now() - start;
            for (j = 0; j < events.length; j++) {
                events[j].time = events[j].time - now();
                this.scheduler.plan(this, event, frequency);
            }
            this.div.setAttribute('class', 'tile scheduled');
            this.state = 'scheduled';
        }

    },
    assign: function (event) {
        'use strict';
        var lt, key;
        key = String.fromCharCode(event.which).toUpperCase();
        if (/[a-zA-Z0-9-_ ]/.test(key)) {
            /* Borrar si ya existe */
            lt = document.getElementById(key);
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
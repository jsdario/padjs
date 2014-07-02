/*jslint plusplus: true */
/*jslint white: true */
/*global FileReader, Audio, console*/

function Scheduler() {
    'use strict';
}

Scheduler.prototype = {
    plan: function (tile, event, frequency) {
        'use strict';
        /* Hacer una vez inmediatamente */
        tile.timeouts.push(setTimeout(function () {
            if (event.action === 'play') {
                tile.play();
            } else {
                tile.stop();
            }
        }, event.time));
        console.log('scheduled event:' + event);
        tile.intervals.push(setInterval(function () {
            tile.timeouts.push(setTimeout(function () {
                if (event.action === 'play') {
                    tile.play();
                } else {
                    tile.stop();
                }
            }, event.time));
        }, frequency));
    }
};

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
    this.intervals = [];
    this.timeouts  = [];
    /* Funciones */
    this.div.onmousedown = function (e) {
        /* Escuchadores de shortcut */
        if (e.which === 1) {
            if (self.state !== 'scheduling') {
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
            window.onkeypress = null;
            self.pad.listen();
            self.stop();
        }
    };
    this.div.oncontextmenu = function (e) {
        self.stop();
        console.log('tile options here!');
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
            this.notify('play');
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
            this.notify('stop');
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
                console.log("Clearing Tile of " + this.intervals.toString());
                this.intervals.map(clearInterval);
                this.timeouts.map(clearTimeout);
                this.intervals = [];
                this.timeouts = [];
            }
            this.state = null;
        }
    },
    notify: function (action) {
        'use strict';
        if (this.state === 'scheduling') {
            console.log('notifying: ' + action);
            this.events.push({
                action: action,
                time: (new Date()).getTime()
            });
        }
    },
    scheduling: function () {
        'use strict';
        try {
            if (this.track) {
                this.state = 'scheduling';
                this.className = this.div.className;
                console.log('Tile.scheduling(): Recording events');
                this.div.setAttribute('class',  this.className + ' scheduling');
                /* Milisegundos desde hora UNIX */
                this.events = [];
                this.scheduler = (new Date()).getTime();
            }
        } catch (exception) {
            window.alert('Tile.scheduling(): ' + exception);
        }
    },
    schedule: function () {
        'use strict';
        if(this.events && this.events.length > 0) {
            var j, self, start, event, frequency;
            self = this;
            start = this.events[0].time;
            frequency = (new Date()).getTime() - this.scheduler;
            for (j = 0; j < this.events.length; j++) {
                event = this.events[j];
                event.time = event.time - start;
                (new Scheduler()).plan(this, event, frequency);
            }
            self.div.setAttribute('class', 'tile scheduled');
            this.state = 'scheduled';
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
/*global FileReader, Audio, Tile, console, browser: true, plusplus: true*/
function Pad(N) {
    'use strict';
    var j, n, row, tile, self;
    self = this;
    this.name  = null;
    this.size  = N * N;
    this.color = null;
    this.tiles = [];
    this.scheduler = null;
    try {
        this.div = document.getElementById('pad');
        if (N === 3) {
            this.div.className = 'small';
        } else {
            N = 4;
            this.div.className = 'grand';
        }
        for (j = 0; j < N; j = j + 1) {
            row = document.createElement('div');
            row.className = 'row';
            this.div.appendChild(row);
            for (n = 0; n < N; n = n + 1) {
                tile = document.createElement('div');
                tile.className = 'tile';
                row.appendChild(tile);
                this.tiles[n + j * N] = new Tile(self, tile);
            }
        }
        this.listen();
    } catch (e) {
        window.alert(e);
    }
}

Pad.prototype = {
    constructor: Pad,
    load: function () {
        'use strict';
        window.alert("load");
    },
    press: function (key) {
        'use strict';
        this.state = 'pressed';
        if (this.tiles[key]) {
            this.tiles[key].clear();
            this.tiles[key].play();
        }
    },
    free: function (key) {
        'use strict';
        this.state = null;
        if (this.tiles[key]) {
            this.tiles[key].stop();
        }
    },
    listen: function () {
        'use strict';
        var j, self;
        self  = this;
        window.onkeydown = function (e) {
            var key = String.fromCharCode(e.which).toUpperCase();
            if (e.which === 17) {
                self.scheduling();
            }
            self.press(key);
        };
        window.onkeyup = function (e) {
            try {
                var key = String.fromCharCode(e.which).toUpperCase();
                if (e.which === 17) {
                    self.clear();
                    self.schedule();
                } else if (/[a-zA-Z0-9-_ ]/.test(key)) {
                    self.free(key);
                }
            } catch (exception) {
                window.alert(exception);
            }
        };
        window.onblur = function () {
            self.clear();
        };
    },
    notify: function (l, a, t) {
        'use strict';
        if (this.scheduler) {
            console.log('notifying: ' + a);
            this.events.push({tile: l, action: a, time: t});
        }
    },
    clear: function () {
        'use strict';
        var j;
        this.scheduler = null;
        this.div.setAttribute("class", this.className);
        for (j = 0; j < this.size; j = j + 1) {
            this.tiles[j].clear('scheduling');
            this.tiles[j].free();
        }
    },
    scheduling: function () {
        'use strict';
        var j;
        try {
            this.className =  this.div.getAttribute("class");
            this.div.setAttribute("class", this.className + " scheduling");
            /* Milisegundos desde hora UNIX */
            this.events = [];
            this.scheduler = (new Date()).getTime();
            for (j = 0; j < this.size; j = j + 1) {
                this.tiles[j].scheduling();
            }
        } catch (exception) {
            window.alert(exception);
        }
    },
    schedule: function () {
        'use strict';
        try {
            if (this.events.length > 0) {
                var j, start, end, frequency;
                start = this.events[0].time;
                end = (new Date()).getTime();
                frequency = end - start;
                /* Arreglar diferencia de tiempos */
                for (j = 0; j < this.events.length; j = j + 1) {
                    this.events[j].time = this.events[j].time - start;
                    this.events[j].tile.schedule(this.events[j]);
                    this.events[j].tile.schedule(this.events[j], frequency);
                }
            }
        } catch (exception) {
            window.alert('Pad.schedule(): ' + exception);
        }
    }
};

var pad = new Pad(3);
pad.tiles[0].load('presets/upallnight.mp3');
pad.tiles[3].load('presets/hohey.mp3');
pad.tiles[4].load('presets/pray.mp3');
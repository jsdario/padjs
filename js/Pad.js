/*jslint plusplus: true */
/*global FileReader, Audio, Tile, console, Scheduler*/

var CTRL = 17;

function PadControls(pad) {
    'use strict';
    var loop, schedule, volume;
    this.div = document.createElement('div');
    this.div.className = 'controls';
    pad.div.appendChild(this.div);
    /* Loop */
    loop = document.createElement('div');
    loop.className = 'playing btn';
    this.div.appendChild(loop);
    loop.innerHTML = 'loop';
    /* Sched */
    schedule = document.createElement('div');
    schedule.className = 'scheduling btn';
    this.div.appendChild(schedule);
    schedule.innerHTML = 'schedule';
    /* Volume */
    volume = document.createElement('div');
    volume.className = 'settings btn';
    this.div.appendChild(volume);
    volume.innerHTML = 'volume';
    
}

function Pad(N) {
    'use strict';
    var j, n, row, tile, self;
    self = this;
    this.name  = null;
    this.size  = N * N;
    this.color = null;
    this.tiles = [];
    try {
        this.div = document.getElementById('pad');
        if (N === 3) {
            this.div.className = 'small';
        } else {
            N = 4;
            this.div.className = 'grand';
        }
        this.className = this.div.className;
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
        /* Añadir controles */
        this.controls = new PadControls(this);
        this.listen();
    } catch (e) {
        window.alert(e);
    }
}

Pad.prototype = {
    constructor: Pad,
    press: function (key) {
        'use strict';
        this.state = 'pressed';
        if (this.tiles[key]) {
            this.tiles[key].play();
            this.tiles[key].notify('play');
        }
    },
    free: function (key) {
        'use strict';
        this.state = null;
        if (this.tiles[key]) {
            this.tiles[key].stop();
            this.tiles[key].notify('stop');
        }
    },
    addScheduler: function () {
        'use strict';
        var j;
        this.state = 'waiting';
        for (j = 0; j < this.tiles.length; j++) {
            this.tiles[j].addScheduler();
        }
    },
    removeScheduler: function () {
        'use strict';
        var j;
        this.state = null;
        for (j = 0; j < this.tiles.length; j++) {
            this.tiles[j].removeScheduler();
        }
    },
    startScheduler: function () {
        'use strict';
        var j;
        for (j = 0; j < this.tiles.length; j++) {
            this.tiles[j].startScheduler();
        }
    },
    listen: function () {
        'use strict';
        var j, self;
        self  = this;
        window.onkeydown = function (e) {
            var key = String.fromCharCode(e.which).toUpperCase();
            if (e.which === CTRL) {
                self.addScheduler();
            }
            self.press(key);
        };
        window.onkeyup = function (e) {
            try {
                var key = String.fromCharCode(e.which).toUpperCase();
                if (e.which === CTRL) {
                    self.removeScheduler();
                    self.startScheduler();
                } else if (/[a-zA-Z0-9-_ ]/.test(key)) {
                    self.free(key);
                }
            } catch (exception) {
                window.alert(exception);
            }
        };
        window.onblur = function () {
            self.removeScheduler();
        };
    }
};

var pad = new Pad(3);
pad.tiles[0].load('presets/snare.wav');
pad.tiles[1].load('presets/kick.wav');
pad.tiles[3].load('presets/clhat.wav');
pad.tiles[4].load('presets/clap.wav');
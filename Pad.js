/*jslint plusplus: true */
/*global FileReader, Audio, Tile, console, Scheduler*/

var CTRL = 17;

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
        }
    },
    free: function (key) {
        'use strict';
        this.state = null;
        if (this.tiles[key]) {
            this.tiles[key].stop();
        }
    },
    schedule: function () {
        'use strict';
        var j;
        for (j = 0; j < this.tiles.length; j++) {
            this.tiles[j].schedule();
        }
    },
    listen: function () {
        'use strict';
        var j, self;
        self  = this;
        window.onkeydown = function (e) {
            var key = String.fromCharCode(e.which).toUpperCase();
            self.press(key);
        };
        window.onkeyup = function (e) {
            try {
                var key = String.fromCharCode(e.which).toUpperCase();
                if (e.which === CTRL) {
                    self.schedule();
                } else if (/[a-zA-Z0-9-_ ]/.test(key)) {
                    self.free(key);
                }
            } catch (exception) {
                window.alert(exception);
            }
        };
        window.onblur = function () {
            console.log('Page blurred');
        };
    }
};

var pad = new Pad(3);
pad.tiles[0].load('presets/upallnight.mp3');
pad.tiles[1].load('presets/clhat.wav');
pad.tiles[3].load('presets/hohey.mp3');
pad.tiles[4].load('presets/pray.mp3');
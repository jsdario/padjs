/*global FileReader, Audio, Tile*/
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
        //h = this.div.offsetHeight;
        //w = this.div.offsetWidth;
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
        this.tiles[key].clear();
        this.tiles[key].play();
    },
    free: function (key) {
        'use strict';
        this.state = null;
        this.tiles[key].stop();
    },
    listen: function () {
        'use strict';
        var j, self;
        self  = this;
        window.onkeydown = function (e) {
            var key = String.fromCharCode(e.which).toUpperCase();
            if (e.which === 17) {
                for (j = 0; j < self.size; j = j + 1) {
                    self.tiles[j].schedule();
                }
            }
            self.press(key);
        };
        window.onkeyup = function (e) {
            if (e.which === 17) {
                for (j = 0; j < self.size; j = j + 1) {
                    self.tiles[j].free();
                }
            }
            var key = String.fromCharCode(e.which).toUpperCase();
            self.free(key);
        };
    }
};

var pad = new Pad(3);
pad.tiles[0].load('presets/upallnight.mp3');
pad.tiles[3].load('presets/hohey.mp3');
pad.tiles[4].load('presets/pray.mp3');
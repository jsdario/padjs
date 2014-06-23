function Tile(pad, div) {
    'use strict';
    var self = this;
    this.pad =  pad;
    this.div =  div;
    this.lt  = null;
    this.track  = null;
    this.player = null;
    this.scheduler = null;
    /* Funciones */
    this.div.onmousedown = function (e) {
        /* Escuchadores de shortcut */
        if (e.which === 1) {
            window.onkeydown  = null;
            window.onkeyup    = null;
            window.onkeypress = function (e) {
                var lt, key;
                key = String.fromCharCode(e.which).toUpperCase();
                if (self.lt === null) {
                    /* Borrar si ya existe */
                    lt = document.getElementById(key);
                    if (lt) {
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
            self.play();
            if (self.scheduler.listening === true) {
                if (self.scheduler.start === 0) {
                    self.scheduler.start = new Date().getTime();
                } else {
                    self.scheduler.end   = new Date().getTime();
                    self.scheduler.freq  =
                        (self.scheduler.end - self.scheduler.start) * 0.001;
                    self.scheduler.start = 0; // start again
                }
            } else {
                self.clear();
            }
        }
    };
    this.div.onmouseup = function (e) {
        if (e.which === 1) {
            window.onkeypress = null;
            self.pad.listen();
            self.stop();
            if (self.scheduler.listening === true) {
                if (self.scheduler.freq !== 0 &&
                        self.scheduler.start === 0) {
                    var duration =
                        (new Date().getTime() - self.scheduler.end) * 0.001;
                    self.scheduler =
                        setInterval(function () {
                            self.play();
                            setTimeout(function () {
                                self.stop();
                            }, duration);
                        }, self.scheduler.freq);
                }
            }
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
        e.preventDefault();
        e.stopPropagation();
        return false;
    };
}

Tile.prototype = {
    constructor: Tile,
    free: function () {
        'use strict';
        if (this.track) {
            this.div.setAttribute("class", "tile playable");
        } else {
            this.div.setAttribute("class", "tile");
        }
    },
    play: function () {
        'use strict';
        if (this.track) {
            this.player.play();
            this.div.setAttribute("class", "tile playing");
        } else {
            this.div.setAttribute("class", "tile pressed");
        }
    },
    stop: function () {
        'use strict';
        this.player.pause();
        this.player.currentTime = 0;
        this.player.addEventListener('ended', null, false);
        this.free();
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
            this.div.setAttribute("class", "tile looping");
            this.player.addEventListener('ended', function () {
                this.play();
            }, false);
            this.player.play();
        }
    },
    clear: function () {
        'use strict';
        if (this.scheduler !== null) {
            clearInterval(this.scheduler);
            this.scheduler = null;
        }
    },
    schedule: function () {
        'use strict';
        this.className = this.div.className;
        if (this.track) {
            this.div.setAttribute('class',  this.className + ' scheduling');
        }
        this.scheduler = {};
        this.scheduler.start = 0;
        this.scheduler.listening = true;
    }
};

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
        this.tiles[key].play();
    },
    free: function (key) {
        'use strict';
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
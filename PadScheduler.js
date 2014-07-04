/*jslint plusplus: true */
/*jslint white: true */
/*global FileReader, Audio, console*/

function now() {
    'use strict';
    return (new Date()).getTime();
}

function Scheduler(tile) {
    'use strict';
    this.tile = tile;
    this.events = [];
    this.tstart = null;
    this.intervals = [];
    this.timeouts  = [];
    console.log('Scheduler(): constructor');
}

Scheduler.prototype = {
    clear: function () {
        'use strict';
        this.intervals.map(clearInterval);
        this.timeouts.map(clearTimeout);
        this.tile.scheduler = null;
    },
    notify: function (event) {
        'use strict';
        if (!this.tstart) {
            this.tstart = now();
        }
        this.events.push(event);
    },
    plan: function (event, frequency) {
        'use strict';
        var self = this;
        /* Hacer una vez inmediatamente */
        self.timeouts.push(setTimeout(function () {
            if (event.action === 'play') {
                self.tile.play();
            } else {
                self.tile.stop();
            }
        }, event.time));
        console.log('scheduled event:' + event);
        self.intervals.push(setInterval(function () {
            self.timeouts.push(setTimeout(function () {
                if (event.action === 'play') {
                    self.tile.play();
                } else {
                    self.tile.stop();
                }
            }, event.time));
        }, frequency));
    },
    start: function () {
        'use strict';
        var j, tstop, frequency;
        tstop = now();
        frequency = tstop - this.tstart;
        if (this.events.length > 0) {
            this.started = true;
            console.log('Starting schedule each ' + frequency + 'ms');
            for(j = 0; j < this.events.length; j++) {
                this.events[j].time -= tstop;
                this.plan(this.events[j], frequency);
            }
        } else {
            this.tile.clear();
        }
    }
};
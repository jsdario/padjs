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
    this.tstart = now();
    this.intervals = [];
    this.timeouts  = [];
    console.log('Scheduler(): constructor');
}

Scheduler.prototype = {
    clear: function () {
        'use strict';
        console.log('clearing '+ this.events.length + ' plans');
        this.intervals.map(clearInterval);
        this.timeouts.map(clearTimeout);
        this.tile.scheduler = null;
    },
    notify: function (event) {
        'use strict';
        this.events.push(event);
    },
    plan: function (event, frequency) {
        'use strict';
        var self = this;
        /* Hacer una vez inmediatamente */
        self.timeouts.push(setTimeout(function () {
            if (event.action === 'play') {
                self.tile.play();
            } else if (event.action === 'stop'){
                self.tile.stop();
            }
        }, event.time));
        self.intervals.push(setInterval(function () {
            self.timeouts.push(setTimeout(function () {
                if (event.action === 'play') {
                    self.tile.play();
                } else if (event.action === 'stop') {
                    self.tile.stop();
                }
            }, event.time));
        }, frequency));
        console.log('scheduled event:' + event);
    },
    start: function () {
        'use strict';
        var j, frequency;
        frequency = now() - this.tstart;
        if (this.events.length > 0) {
            console.log('Starting '+ this.events.length +' plans each ' + frequency + 'ms');
            for(j = 0; j < this.events.length; j++) {
                this.events[j].time -= this.tstart;
                this.plan(this.events[j], frequency);
            }
        } else {
            this.tile.clear();
        }
    }
};
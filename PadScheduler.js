/*jslint plusplus: true */
/*jslint white: true */
/*global FileReader, Audio, console*/

function now() {
    'use strict';
    return (new Date()).getTime();
}

function Scheduler() {
    'use strict';
    this.intervals = [];
    this.timeouts  = [];
}

Scheduler.prototype = {
    clear: function () {
        'use strict';
        console.log("Clearing Tile of " + this.intervals);
        this.intervals.map(clearInterval);
        this.timeouts.map(clearTimeout);
    },
    plan: function (tile, event, frequency) {
        'use strict';
        var self = this;
        /* Hacer una vez inmediatamente */
        self.timeouts.push(setTimeout(function () {
            if (event.action === 'play') {
                tile.play();
            } else {
                tile.stop();
            }
        }, event.time));
        console.log('scheduled event:' + event);
        self.intervals.push(setInterval(function () {
            self.timeouts.push(setTimeout(function () {
                if (event.action === 'play') {
                    tile.play();
                } else {
                    tile.stop();
                }
            }, event.time));
        }, frequency));
    }
};
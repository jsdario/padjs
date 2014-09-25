/*jslint browser: true, devel: true*/
/*global Pad*/
var HIDDEN = 0;
var pad = new Pad(3);

var helpbutton = document.getElementById('help');
helpbutton.onclick = function (event) {
    'use strict';
    if (!HIDDEN) {
        HIDDEN = 1;
        pad.div.style.opacity = '0';
    } else {
        HIDDEN = 0;
        pad.div.style.opacity = '1';
    }
};

pad.tiles[0].load('presets/snare.wav');
pad.tiles[1].load('presets/kick.wav');
pad.tiles[3].load('presets/clhat.wav');
pad.tiles[4].load('presets/clap.wav');
pad.tiles[2].load('presets/hohey.mp3');
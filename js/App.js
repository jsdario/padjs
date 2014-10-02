/*jslint browser: true, devel: true*/
/*global Pad*/
var HIDDEN = 0;
var help = document.getElementById('help-txt');
var pad = new Pad(3);

var helpbutton = document.getElementById('help-btn');
helpbutton.onclick = function (event) {
    'use strict';
    if (!HIDDEN) {
        HIDDEN = 1;
        help.style.height = 'auto';
        help.style.display = 'block';
        help.style.paddingTop = '20px';
        helpbutton.innerHTML = 'Ocultar ayuda';
    } else {
        HIDDEN = 0;
        help.style.height = '0';
        help.style.display = 'none';
        help.style.paddingTop = '0';
        helpbutton.innerHTML = 'Ayuda';
    }
};

pad.tiles[0].load('presets/snare.wav');
pad.tiles[1].load('presets/kick.wav');
pad.tiles[3].load('presets/clhat.wav');
pad.tiles[4].load('presets/clap.wav');
pad.tiles[2].load('presets/hohey.mp3');
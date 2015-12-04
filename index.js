#!/usr/bin/env node

var http = require('http')

var express = require('express')
var beast = require('netbeast').resource
var io = require('socket.io')()
var cmd = require('commander')

cmd
.version('0.1.42')
.option('-p, --port <n>', 'Port to start the HTTP server', parseInt)
.parse(process.argv)

var app = express()

const COLORS = {
  playable: '6666FF', playing: 'FFCC00', waiting: 'A469B3', inactive: '999999',
  scheduling: 'A469B3', scheduled: 'A469B3', selectable: 'DD4B39', settings: '00CC66'
}

io.on('connection', function (socket) {
  console.log('client connected')
  socket.on('color', function (data) {
    console.log('state is ', data)
    console.log('changing color to %s...', parseInt('0x' + COLORS[data]))
    var color = _hexToRgb(COLORS[data])
    console.log(color)
    var hsl = _rgbToHsl(color.r, color.g, color.b)
    console.log(hsl)

    beast('lights').set({bri: 255, hue: hsl[0] * 65535, sat: 255})

  })
})

app.use(express.static('public'))

var server = http.createServer(app)
server.listen(cmd.port || 4000, function () {
  console.log('Padjs started on %s:%s',
  server.address().address,
  server.address().port)
})

io.listen(server)

function _hexToRgb (hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

function _rgbToHsl (r, g, b) {
  r /= 255, g /= 255, b /= 255;
  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;

  if(max == min){
    h = s = 0; // achromatic
  }else{
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch(max){
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return [h, s, l];
}

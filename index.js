#!/usr/bin/env node

var fs = require('fs')
var http = require('http')

var express = require('express')
var cmd = require('commander')

cmd
.version('0.1.42')
.option('-p, --port <n>', 'Port to start the HTTP server', parseInt)
.parse(process.argv)

var app = express()

app.use(express.static('public'))
app.get('/presets', function (req, res) {
  fs.readdir('./presets', function (err, files) {
    if (err) res.status(500).send(err)

    files.forEach(function (file, idx) {
      files[idx] = 'http://' + process.env.NETBEAST + '/i/padjs/tracks/' + file
    })

    res.json(files)
  })
})

app.use('/tracks', express.static('presets'))

var server = http.createServer(app)
server.listen(cmd.port || 4000, function () {
  console.log('Padjs started on %s:%s',
  server.address().address,
  server.address().port)
})

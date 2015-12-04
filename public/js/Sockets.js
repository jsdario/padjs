/* global io */

var socket = io.connect()

socket.on('connect', function () {
  console.log('ws:// connection stablished')
})

socket.on('disconnect', function () {
  console.log('ws:// connection lost')
})

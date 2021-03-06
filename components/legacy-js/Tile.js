/*global FileReader, Audio, console, Scheduler, now, socket*/

var LONG_SAMPLE_TIME = 2
var LEFT_CLICK  = 1
var RIGHT_CLICK = 3

function Tile(pad, div) {
  'use strict'
  /* Empty constructor */
  if (!pad && !div) {
    return
  }
  var self = this
  self.pad =  pad
  self.div =  div
  self.lt  = null
  self.track  = null
  self.player = null
  this.looping = null
  /* Volume settings */
  self.vol  = document.createElement('div')
  self.div.appendChild(self.vol)
  self.vol.className = 'volumen'
  self.bar  = document.createElement('div')
  self.div.appendChild(self.bar)
  self.bar.className = 'vol-bar'
  /* Funciones */
  self.div.onmousedown = function (e) {
    /* Escuchadores de shortcut */
    if (e.which !== RIGHT_CLICK) {
      self.clear()
      self.notify('play')
      if (self.pad.state !== 'pressed') {
        window.onkeydown  = function (event) {
          self.assign(event)
        }
        window.onkeyup = null
      }
      self.play()
    } else {
      self.showSettings()
    }
  }
  self.div.onmouseup = function (e) {
    if (e.which !== RIGHT_CLICK) {
      window.onkeypress = null
      self.notify('stop')
      self.pad.listen()
      self.stop()
    }  else {
      self.hideSettings()
    }
  }
  self.div.oncontextmenu = function (e) {
    e.preventDefault()
    e.stopPropagation()
    return false
  }
  self.listenDragAndDrop()
}

Tile.prototype = {
  constructor: Tile,
  free: function (now) {
    'use strict'
    if (this.playable) {
      if (!this.settings) {
        this.div.setAttribute('class', 'tile playable')
        socket.emit('color', 'playable')
        if(this.state) {
          this.div.setAttribute('class', 'tile ' + this.state)
          socket.emit('color', this.state)
        }
        if(!now && !this.player.paused) {
          this.div.setAttribute('class', 'tile playing')
          socket.emit('color', 'playing')
        }
      }
    } else {
      this.div.setAttribute('class', 'tile')
      socket.emit('color', 'inactive')
    }
  },
  play: function () {
    'use strict'
    var self = this
    if (this.playable) {
      console.log('Tile.play()')
      /* Looping */
      if (this.player.duration > LONG_SAMPLE_TIME) {
        this.player.addEventListener('ended', function () {
          this.play()
        }, false)
      } else {
        /* Rebobinar al volver a pulsar */
        this.player.pause()
        this.player.currentTime = 0
      }
      this.player.play()
      if(!this.settings) {
        this.div.setAttribute('class', 'tile pressed playing')
        socket.emit('color', 'playing')
      }
    } else {
      this.div.setAttribute('class', 'tile pressed')
      socket.emit('color', 'inactive')
    }
  },
  stop: function () {
    'use strict'
    if (this.playable && !this.looping) {
      console.log('Tile.stop()')
      if (this.player.duration > LONG_SAMPLE_TIME) {
        this.player.currentTime = 0
        this.player.pause()
        this.free()
      } else {
        this.free('now')
      }
    } else { /* Para pressed por teclado */
      this.free()
    }
  },
  load: function (track) {
    'use strict'
    var self = this
    if (!self.player) {
      self.player = new Audio(track)
      self.div.appendChild(self.player)
    } else {
      self.player.src = track
    }
    self.player.onloadeddata = function () {
      self.div.setAttribute('class', 'tile playable')
      self.player.onloadeddata = null
      self.track = track
    }
    self.player.oncanplay = function () {
      self.player.oncanplay = null
      self.playable = true
    }
  },
  assign: function (key) {
    'use strict'
    key = String.fromCharCode(key.which).toUpperCase()
    if (/[a-zA-Z0-9-_ ]/.test(key)) {
      /* Borrar si ya existe */
      var lt = document.getElementById(key)
      if (lt) {
        lt.innerHTML = ''
        lt.id = ''
      }
      if (this.lt === null) {
        lt  = document.createElement('div')
        this.div.appendChild(lt)
        lt.className = 'lt'
        this.lt = lt
        this.key = key
      } else {
        /* Quitar escuchadores anteriores */
        this.pad.tiles[this.lt.id] = null
      }
      this.lt.id = key
      this.lt.innerHTML = key
      this.pad.tiles[key] = this
    }
  },
  clear: function () {
    'use strict'
    this.looping = null
    console.log('Tile.clear()')
    if (this.settings) {
      this.hideSettings()
    } else if (this.state === 'scheduled') {
      console.log('Tile.clear()')
      this.scheduler.clear()
      this.state = null
      this.free()
    }
  },
  addScheduler: function () {
    'use strict'
    if (this.playable && this.state !== 'scheduled') {
      this.div.setAttribute('class', 'tile waiting')
      socket.emit('color', 'waiting')
      this.scheduler = new Scheduler(this)
      this.state = 'waiting'
    }
  },
  removeScheduler: function () {
    'use strict'
    if (this.playable) {
      if (this.state === 'waiting') {
        this.scheduler.clear()
        this.state = null
        this.free()
      }
    }
  },
  startScheduler: function () {
    'use strict'
    if (this.playable && this.state === 'scheduling') {
      this.state = 'scheduled'
      this.scheduler.start()
      this.free()
    }
  },
  notify: function (action) {
    'use strict'
    if (this.scheduler) {
      console.log(now() + ' #Tile.notify: ' + action.toString())
      if (this.state === 'waiting') {
        this.state = 'scheduling'
      }
      this.scheduler.notify({time: now(), action: action})
    }
    if(this.selectTile) {
      console.log('tile selected')
      this.pad.selectTile(this)
    }
  },
  listenDragAndDrop: function () {
    'use strict'
    var self = this
    self.div.ondragover = function (e) {
      self.div.setAttribute('class', 'tile selectable')
      socket.emit('color', 'selectable')
      e.preventDefault()
    }
    self.div.ondragleave = function (e) {
      self.free()
      socket.emit('color', 'playable')
    }
    self.div.ondrop = function (e) {
      var file, fr
      file = e.dataTransfer.files[0]
      if (!document.createElement('audio').canPlayType(file.type)) {
        window.alert(file.type + ' is not supported by your browser')
        self.free()
        return false
      }
      fr = new FileReader()
      fr.onload = function (f) {
        self.load(f.target.result)
      }
      fr.readAsDataURL(file)
      e.stopPropagation()
      e.preventDefault()
      return false
    }
  },
  showSettings: function () {
    'use strict'
    var self
    self = this
    if (self.playable) {
      this.settings = true
      self.div.setAttribute('class', 'tile settings')
      socket.emit('color', 'settings')

      self.div.onmousemove = function (e) {
        var volume, bottom
        bottom = self.div.offsetTop + self.div.offsetHeight
        volume = bottom - e.pageY
        volume = volume < 0 ? 0 : volume
        self.player.volume = volume * 0.01
        self.bar.style.width = self.player.volume * 100 + 'px'
      }
    }
  },
  hideSettings: function () {
    'use strict'
    if (this.playable) {
      this.div.onmousemove = null
      this.settings = false
      this.free()
    }
  }
}

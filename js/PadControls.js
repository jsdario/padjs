/*jslint plusplus: true */
/*jslint white: true */
/*global FileReader, Audio, console*/

var CONTROL_ACTIVE = false

function PadControls(pad) {
  'use strict'
  var self, loop, volume, schedule
  self = this
  self.pad = pad
  self.div = document.createElement('div')
  self.div.className = 'controls'
  pad.div.appendChild(self.div)
  try {
    /* Loop */
    self.looper = self.createLooper()
    /* Sched */
    self.schedule = self.createScheduler()
    /* Volume */
    self.volume = self.createSettingsControl()
  } catch (exception) {
    window.alert(exception)
  }
}

PadControls.prototype = {
  constructor: PadControls,
  clear: function () {
    'use strict'
    CONTROL_ACTIVE = false
    this.onSelectedTile = null
    this.looper.className = 'playing btn'
    this.volume.className = 'settings btn'
    this.schedule.className = 'scheduling btn'
    console.log('Control.clear()')
  },
  createLooper: function () {
    'use strict'
    var self, looper
    self = this
    /* Loop */
    looper = document.createElement('div')
    looper.className = 'playing btn'
    self.div.appendChild(looper)
    looper.innerHTML = 'loop'
    looper.title = '[Clicar y arrastrar] Reproduce una pista larga en bucle'
    looper.onmouseup = function () {
      if (!CONTROL_ACTIVE) {
        CONTROL_ACTIVE = 'true'
        looper.className = 'playing pressed btn'
        console.log('Control waiting for tile selection')
        self.onSelectedTile = function (tile) {
          console.log('Control.onSelectedTile()')
          tile.looping = true
          self.clear()
        }
        self.pad.selectTile()
      } else {
        self.clear()
      }
    }
    return looper
  },
  createScheduler: function () {
    'use strict'
    var self, scheduler
    self = this
    scheduler = document.createElement('div')
    scheduler.className = 'scheduling btn'
    self.div.appendChild(scheduler)
    scheduler.innerHTML = 'schedule'
    scheduler.title = '[CTRL+click] Establece un patron de reproduccion'
    scheduler.onmouseup = function () {
      if(!CONTROL_ACTIVE) {
        CONTROL_ACTIVE = 'true'
        scheduler.className = 'scheduling pressed btn'
        self.pad.addScheduler()
      } else {
        console.log('remove + start scheduler')
        self.pad.removeScheduler()
        self.pad.startScheduler()
        self.clear()
      }
    }
    return scheduler
  },
  createSettingsControl: function () {
    'use strict'
    var self, volume
    self = this
    volume = document.createElement('div')
    volume.className = 'settings btn'
    self.div.appendChild(volume)
    volume.innerHTML = 'volume'
    volume.title = '[Click derecho] Cambia el volumen de un tile moviendo el raton'
    volume.onmouseup = function () {
      if (!CONTROL_ACTIVE) {
        CONTROL_ACTIVE = 'true'
        volume.className = 'settings pressed btn'
        console.log('Control waiting for tile selection')
        self.onSelectedTile = function (tile) {
          tile.showSettings()
          self.clear()
        }
        self.pad.selectTile()
      } else {
        self.clear()
      }
    }
    return volume
  }
}

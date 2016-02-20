import React from 'react'
import netbeast from 'netbeast'

const LONG_SAMPLE_TIME = 2
const LEFT_CLICK = 1
const RIGHT_CLICK = 3

const PLAYABLE_COLOR = '00E9CF'
const PLAYING_COLOR = 'FFE867'
const RED = { r: 241, g: 38, b: 76}
const GREEN = { r: 0, g: 254, b: 165 }

const COLORS = [
  '6666FF', 'FFCC00', 'A469B3', 'A469B3', 'A469B3', 'DD4B39', '00CC66'
]

export default class Pad extends React.Component {
  constructor (props) {
    super(props)
    this.state = { is: '', isPlayable: false }
    this.onPress = this.onPress.bind(this)
    this.onFree = this.onFree.bind(this)
  }

  componentWillReceiveProps (props) {
    const { track } = props
    if (track) this.player.src = track
    // this.player.onloadeddata = () => console.log('track', track, 'loaded')
    this.player.volume = 0.25
    this.player.oncanplay = () => {
      this.setState({ isPlayable: true })
    }
    this.player.onended = () => {
      console.log('has ended!')
      this.player.pause()
      this.player.currentTime = 0
    }
  }

  onPress (e) {
    e.preventDefault()
    e.stopPropagation()

    /* Escuchadores de shortcut */
    if (e.which !== RIGHT_CLICK) {
      this.play()
    } else {
      this.showSettings()
    }
  }

  onFree (e) {
    e.preventDefault()
    e.stopPropagation()

    if (!this.state.isPlayable) return

    this.stop()
  }

  play () {
    if (this.state.isPlayable && this.state.is !== 'playing') {
      if (this.player && this.player.duration > LONG_SAMPLE_TIME) {
        netbeast('music').set({ track: this.props.track, volume: this.player.volume * 100 })
      } else {
        this.player.pause()
        this.player.currentTime = 0
        setTimeout(() => this.player.play(), 1)
      }

      netbeast('lights').set({ color: COLORS[Math.floor(Math.random() * 7)], power: 'on' })
      this.setState({ is: 'playing' })
    }
  }

  stop () {
    this.setState({ is: this.state.is.replace('playing', '') })

    if (this.player.duration > LONG_SAMPLE_TIME) {
      netbeast('music').set({ status: 'stop' })
    }
  }

  render () {
    const { track } = this.props
    const className = 'tile ' + (this.state.isPlayable ? 'playable ' : '') + this.state.is

    return (
      <a className={className} onMouseDown={this.onPress} onTouchStart={this.onPress}
      onMouseUp={this.onFree} onTouchEnd={this.onFree} onTouchCancel={this.onFree}>
      <audio ref={(ref) => this.player = ref}>
      <source src={track} />
      Your browser does not support the audio tag.
      </audio>
      </a>
    )
  }
}

import React from 'react'
import netbeast from 'netbeast'

const LONG_SAMPLE_TIME = 2
const LEFT_CLICK = 1
const RIGHT_CLICK = 3

const PLAYABLE_COLOR = '00E9CF'
const PLAYING_COLOR = 'FFE867'

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
    this.player.volume = 0.1
    this.player.oncanplay = () => {
      this.setState({ isPlayable: true })
    }
  }

  onPress (e) {
    /* Escuchadores de shortcut */
    if (e.which !== RIGHT_CLICK) {
      this.play()
    } else {
      this.showSettings()
    }
  }

  onFree (e) {
    if (!this.state.isPlayable) return
    if (this.state.is === 'settings') return

    this.stop()
  }

  play () {
    if (this.state.isPlayable) {
      console.log('Tile.play()')
      /* Looping */
      if (this.player.duration < LONG_SAMPLE_TIME) {
        this.player.addEventListener('ended', () => {
          this.play()
        }, false)
      } else {
        /* Rebobinar al volver a pulsar */
        this.player.pause()
        this.player.currentTime = 0
      }

      netbeast('lights').set({ color: PLAYING_COLOR })
      netbeast('music').set({ track: this.props.track, volume: this.player.volume * 100, status: 'play' })
      .catch((err) => { netbeast().error(err.message) })
      this.setState({ is: 'playing' })
      this.player.play()
    }
  }

  stop () {
    netbeast('lights').set({ color: PLAYABLE_COLOR })
    netbeast('music').set({ status: 'stop' })
    .catch((err) => { netbeast().error(err.message) })
    this.setState({ is: this.state.is.replace('playing', '') })
    this.player.currentTime = 0
    this.player.pause()
  }

  render () {
    const { track } = this.props
    const className = 'tile ' + (this.state.isPlayable ? 'playable ' : '') + this.state.is

    return (
      <a className={className} onMouseDown={this.onPress} onMouseUp={this.onFree}>
      <audio ref={(ref) => this.player = ref}>
      <source src={track} />
      Your browser does not support the audio tag.
      </audio>
      </a>
    )
  }
}

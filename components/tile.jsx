import React from 'react'

const LONG_SAMPLE_TIME = 2
const LEFT_CLICK = 1
const RIGHT_CLICK = 3

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
      this.player.pause()
      this.player.currentTime = 0
    }
  }

  render () {
    const { track } = this.props
    const className = 'tile ' + (this.state.isPlayable ? 'playable ' : '') + this.state.is +
    (this.props.assigning ? 'assigning' : '')

    return (
      <a className={className} onMouseDown={this.onPress} onTouchStart={this.onPress}
      onMouseUp={this.onFree} onTouchEnd={this.onFree} onTouchCancel={this.onFree}>
        <audio src={track} ref={(ref) => this.player = ref}>
          Your browser does not support the audio tag.
        </audio>
      </a>
    )
  }

  onPress (e) {
    e.preventDefault()
    e.stopPropagation()

    if (this.props.assigning) {
      return window.endAssignation(this.props.idx, this.props.assigning)
    }

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
    if (this.state.isPlayable && this.state.is === 'playing') {
      this.player.pause()
      this.player.currentTime = 0
    }
    setTimeout(() => this.player.play(), 1)
    this.setState({ is: 'playing' })
  }

  stop () {
    this.setState({ is: this.state.is.replace('playing', '') })
    this.player.pause()
    this.player.currentTime = 0
  }
}

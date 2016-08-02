import React from 'react'
import request from 'superagent-bluebird-promise'

import Tile from './tile.jsx'

export default class Pad extends React.Component {
  constructor (props) {
    super(props)
    this.state = { tracks: [] }
    window.startAssignation = this.startAssignation = this.startAssignation.bind(this)
    window.endAssignation = this.endAssignation = this.endAssignation.bind(this)
  }

  componentDidMount () {
    request.get('/default.json').end((err, res) => {
      if (err) return console.error(err)
      this.setState({ tracks: res.body })
    })
  }

  render () {
    const { cols, rows } = this.props
    const { tracks, assigning } = this.state

    let pad = []
    for (var i = 0; i < cols * rows; i++) {
      pad.push(tracks[i] || i)
    }

    return (
      <div id='pad'>
        <div id='matrix' className='small'>
          {pad.map(function (data, index) {
            const track = data !== index ? data : null
            return <Tile key={index} idx={index} track={track} assigning={assigning} />
          })}
        </div>
        <div id='panel'>
          <i className='fa fa-music clickable' onClick={window.toggleDrawer} />
        </div>
      </div>
    )
  }

  startAssignation (song) {
    this.setState({ assigning: song })
    window.toggleDrawer()
    console.log('assignation started', song)
  }

  endAssignation (idx, track) {
    const tracks = [...this.state.tracks]
    tracks[idx] = track.url
    this.setState({ assigning: null, tracks })
    console.log('assingation ended on ', idx, 'with track', track, 'with state', this.state)
  }
}

import React from 'react'
import request from 'superagent-bluebird-promise'

import Tile from './tile.jsx'

export default class Pad extends React.Component {
  constructor (props) {
    super(props)
    this.state = { tracks: [] }
  }

  componentDidMount () {
    request.get('/i/padjs/presets').end((err, res) => {
      if (err) return console.error(err)
      this.setState({ tracks: res.body })
    })
  }

  render () {
    const { cols, rows } = this.props
    const { tracks } = this.state

    let pad = []
    for (var i = 0; i < cols * rows; i++) {
      pad.push(tracks[i] || i)
    }

    return (
      <div id='pad' className='small'>
        {pad.map(function (data, index) {
          const track = data !== index ? data : null
          return <Tile key={index} track={track} />
        })}
      </div>
    )
  }
}

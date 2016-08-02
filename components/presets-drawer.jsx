import React from 'react'
import ReactDOM from 'react-dom'

import request from 'superagent-bluebird-promise'

class Preset extends React.Component {
  render () {
    const { data } = this.props
    return (
      <li draggable={true} className='presets-drawer__list__item'>
        <img src={`/img/vendor/svg/${data.icon}.svg`} />

        <span className='clickable' onClick={() => window.startAssignation(data)}>
          {data.name}
        </span>

        <span className='pull-right'>
          <i onClick={() => this.play()} className='fa fa-play clickable'/>
          &nbsp;&nbsp;
          <i onClick={() => this.pause()} className='fa fa-pause clickable'/>
          &nbsp;&nbsp;&nbsp;&nbsp;
        </span>
        <audio src={data.url} ref={(ref) => this.player = ref}>
          Your browser does not support the audio tag.
        </audio>
      </li>
    )
  }

  play () { this.player.play() }
  pause () { this.player.pause() }
}

export default class PresetsDrawer extends React.Component {
  constructor () {
    super()
    this.state = { presets: [], hideDrawer: true }
    window.toggleDrawer = this.toggleDrawer = this.toggleDrawer.bind(this)
    this.hideDrawer = this.hideDrawer.bind(this)
  }

  render () {
    const marginLeft = -300 * this.state.hideDrawer

    return (
      <nav className='presets-drawer' style={{ marginLeft }}>
        <div className='presets-drawer__heading'>
          <div className='presets-drawer__heading__content'>
            <span className='fa fa-close clickable' onClick={this.toggleDrawer} />
            &nbsp;
            <a href='/'>Beat the Beats</a>
          </div>
        </div>
        <ul className='presets-drawer__list expanded list-unstyled'>
          {this.state.presets.map(function (data, index) {
            return <Preset key={index} data={data} />
          })}
        </ul>
        <ul>
          <li>Icon credits to: http://www.flaticon.com/packs/party-elements-1</li>
        </ul>
      </nav>
    )
  }

  hideDrawer (e) {
    if (!ReactDOM.findDOMNode(this).contains(e.target)) {
      this.setState({ hideDrawer: true })
    }
  }

  toggleDrawer () {
    this.setState({ hideDrawer: !this.state.hideDrawer })
  }

  componentDidMount () {
    request.get('/presets.json').end((err, res) => {
      if (err) return console.error(err)
      this.setState({ presets: res.body })
    })
  }

  componentWillMount () {
    document.addEventListener('click', this.hideDrawer, false)
  }

  componentWillUnmount () {
    document.removeEventListener('click', this.hideDrawer, false)
  }
}

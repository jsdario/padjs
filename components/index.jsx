import React from 'react'
import ReactDOM from 'react-dom'

import Pad from './pad.jsx'
import PresetsDrawer from './presets-drawer.jsx'

ReactDOM.render(
  <span>
    <PresetsDrawer />
    <div className='wrapper'>
      <Pad cols={3} rows={3} />
    </div>
  </span>
, document.getElementById('app'))

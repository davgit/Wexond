import React from 'react'
import MenuItem from '../menu-item'
import {Motion} from 'react-motion'

export default class MenuTab extends React.Component {
  constructor () {
    super()

    this.state = {
      left: 0,
      display: 'none',
      defaultLeft: 0
    }

    this.isVisible = false

    this.root = null
  }

  getRoot = () => {
    return this.root
  }

  render () {
    var self = this
    function onRest () {
      if (!self.isVisible) {
        self.setState({display: 'none'})
      }
    }

    return (
      <Motion onRest={onRest} style={{left: this.state.left}}>
        {value =>
          <div className='menu-tab tab-page' ref={(t) => { this.root = t }} style={{left: value.left, display: this.state.display}}>
            <MenuItem icon='img/menu/fullscreen.png'>Fullscreen</MenuItem>
            <MenuItem icon='img/menu/new-window.png'>New window</MenuItem>
            <MenuItem icon='img/menu/privacy.png'>Privacy</MenuItem>
            <div className='menu-separator' />
            <MenuItem icon='img/menu/history.png'>History</MenuItem>
            <MenuItem icon='img/menu/bookmarks.png'>Bookmarks</MenuItem>
            <MenuItem icon='img/menu/downloads.png'>Downloads</MenuItem>
            <div className='menu-separator' />
            <MenuItem icon='img/menu/find.png'>Find</MenuItem>
            <MenuItem icon='img/menu/screenshot.png'>Take screenshot</MenuItem>
            <div className='menu-separator' />
            <MenuItem icon='img/menu/settings.png'>Settings</MenuItem>
          </div>}
      </Motion>
    )
  }
}

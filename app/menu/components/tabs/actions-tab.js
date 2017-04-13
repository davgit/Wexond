import React from 'react'
import MenuItem from '../menu-item'
import {Motion} from 'react-motion'

export default class ActionsTab extends React.Component {
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
          <div className='actions-tab tab-page' ref={(t) => { this.root = t }} style={{left: value.left, display: this.state.display}}>
            <MenuItem>Open link in new tab</MenuItem>
            <MenuItem>Open link in new window</MenuItem>
            <div className='menu-separator' />
            <MenuItem>Copy link address</MenuItem>
            <div className='menu-separator' />
            <MenuItem>Open image in new tab</MenuItem>
            <MenuItem>Copy image address</MenuItem>
            <MenuItem>Copy image</MenuItem>
            <MenuItem>Save image as</MenuItem>
            <div className='menu-separator' />
            <MenuItem>Save as</MenuItem>
            <MenuItem>Print</MenuItem>
            <div className='menu-separator' />
            <MenuItem>View source</MenuItem>
            <MenuItem>Inspect element</MenuItem>
          </div>}
      </Motion>
    )
  }
}

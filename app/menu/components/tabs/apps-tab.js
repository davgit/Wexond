import React from 'react'
import {Motion} from 'react-motion'

export default class AppsTab extends React.Component {
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
          <div className='apps-tab tab-page' ref={(t) => { this.root = t }} style={{left: value.left, display: this.state.display}}>
            test
          </div>}
      </Motion>
    )
  }
}

import React from 'react'
import Colors from '../../../helpers/colors'

export default class Titlebar extends React.Component {
  constructor () {
    super()

    this.foreground = '#fff'
    this.state = {
      closeStyle: {
        backgroundImage: 'url(browser/img/controls/close.png)'
      },
      maximizeStyle: {
        backgroundImage: 'url(browser/img/controls/maximize.png)'
      },
      minimizeStyle: {
        backgroundImage: 'url(browser/img/controls/minimize.png)'
      },
      backgroundColor: '',
      visible: true
    }
  }
  /*
    * sets titlebar background color
    * @param1 {String} color
    */
  setBackground = (color) => {
    this.setState({backgroundColor: color})
    this.setForeground(Colors.getForegroundColor(color))
  }
  /*
    * sets titlebar foreground color
    * @param1 {String} color
    */
  setForeground = (color) => {
    // TODO: set foreground for titlebar
  }

  render () {
    var self = this
    var closeStyle = {
      backgroundImage: this.state.closeStyle.backgroundImage
    }
    var maximizeStyle = {
      backgroundImage: this.state.maximizeStyle.backgroundImage
    }
    var minimizeStyle = {
      backgroundImage: this.state.minimizeStyle.backgroundImage
    }

    var visibility = (this.state.visible)
      ? 'block'
      : 'none'

    function onMinimizeClick () {
      self.props.getApp().minimizeOrRestore()
    }

    function onMaximizeClick () {
      self.props.getApp().maximizeOrRestore()
    }

    function onCloseClick () {
      self.props.getApp().close()
    }

    return (
      <div>
        <div ref='titlebar' style={{
          backgroundColor: this.state.backgroundColor,
          display: visibility
        }} className='titlebar'>
          <div className='titlebar-controls'>
            <div className='titlebar-control' style={minimizeStyle} onClick={onMinimizeClick} />
            <div className='titlebar-control' style={maximizeStyle} onClick={onMaximizeClick} />
            <div className='titlebar-control' style={closeStyle} onClick={onCloseClick} />
          </div>

          {this.props.children}
        </div>
      </div>
    )
  }
}

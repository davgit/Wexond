import React from 'react'

export default class MenuItem extends React.Component {
  render () {
    var img = this.props.icon
    var menuTitleStyle = {
      left: 57
    }
    if (img == null || img === '') {
      menuTitleStyle.left = 16
    }
    return (
      <div className='menu-item'>
        <div className='menu-item-icon' style={{backgroundImage: `url(${img})`}} />
        <div className='menu-item-title' style={menuTitleStyle}>
          {this.props.children}
        </div>
      </div>
    )
  }
}

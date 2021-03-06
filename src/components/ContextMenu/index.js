import React from 'react'
import MenuItem from '../MenuItem'

export default class ContextMenu extends React.Component {
  constructor () {
    super()

    this.state = {
      height: 0,
      marginTop: -20,
      opacity: 0,
      top: 0,
      left: 0,
      backEnabled: false,
      forwardEnabled: false,
      menuItems: []
    }

    this.menuItems = []
  }

  /**
   * Shows menu.
   */
  show = () => {
    this.refreshNavIconsState()

    let separators = this.refs.menu.getElementsByClassName('context-menu-separator')
    let separatorsCount = 0
    for (var i = 0; i < separators.length; i++) {
      if (separators[i].style.display === 'block') {
        separatorsCount += 1
      }
    }
    let topBottomPadding = 24
    let separatorsMargins = 16
    let navIconsHeight = 48
    let height = navIconsHeight + separatorsCount + separatorsCount * separatorsMargins + topBottomPadding

    for (i = 0; i < this.menuItems.length; i++) {
      if (this.menuItems[i].props.show) {
        height += 32
      }
    }

    this.setState(
      {
        marginTop: 0,
        opacity: 1,
        height: height
      }
    )
  }

  /**
   * Hides menu.
   */
  hide = () => {
    this.setState(
      {
        marginTop: -20,
        opacity: 0,
        height: 0
      }
    )
  }

  /**
   * Gets menu.
   * @return {ContextMenu}
   */
  getMenu = () => {
    return this
  }

  /**
   * Refreshes navigation icons state (disabled or enabled etc)
   */
  refreshNavIconsState = () => {
    const webview = this.props.getApp().getSelectedPage().webview
    if (webview.getWebContents() != null) {
      this.setState(
        {
          backEnabled: webview.canGoBack(),
          forwardEnabled: webview.canGoForward()
        }
      )
    }
  }

  render () {
    const self = this

    let menuStyle = {
      height: this.state.height,
      marginTop: this.state.marginTop,
      opacity: this.state.opacity,
      top: this.state.top,
      left: this.state.left
    }

    let backClass = 'navigation-icon-back ' + ((this.state.backEnabled) ? 'navigation-icon-enabled' : 'navigation-icon-disabled')
    let forwardClass = 'navigation-icon-forward ' + ((this.state.forwardEnabled) ? 'navigation-icon-enabled' : 'navigation-icon-disabled')

    function onBackClick () {
      const webview = self.props.getApp().getSelectedPage().webview
      if (webview.canGoBack()) {
        webview.goBack()
        self.hide()
      }
    }

    function onForwardClick () {
      const webview = self.props.getApp().getSelectedPage().webview
      if (webview.canGoForward()) {
        webview.goForward()
        self.hide()
      }
    }

    function onRefreshClick () {
      const webview = self.props.getApp().getSelectedPage().webview
      webview.reload()
      self.hide()
    }

    function onClick (e) {
      e.stopPropagation()
    }

    return (
      <div onClick={onClick} ref='menu' className='context-menu' style={menuStyle}>
        <div className='navigation-icons'>
          <div onClick={onBackClick} className={backClass} />
          <div onClick={onForwardClick} className={forwardClass} />
          <div onClick={onRefreshClick} className='navigation-icon-refresh navigation-icon-enabled' />
          <div className='navigation-icon-star navigation-icon-enabled' />
        </div>
        <div className='context-menu-line' />
        <div className='context-menu-items'>
          {
            this.state.menuItems.map((data, key) => {
              if (data.type === 'separator') {
                let displaySeparator = true
                if (data.show === false) {
                  displaySeparator = false
                }

                return <div style={{display: (displaySeparator) ? 'block' : 'none'}} key={key} className='context-menu-separator' />
              }
              if (data.type === 'menu-item') {
                return (
                  <MenuItem enabled={data.enabled} show={data.show} key={key} onClick={data.onClick} getMenu={self.getMenu}>
                    {data.title}
                  </MenuItem>
                )
              }
            })
          }
        </div>
      </div>
    )
  }
}

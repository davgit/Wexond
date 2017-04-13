import React from 'react'
import {Motion, spring} from 'react-motion'
import TabLayout from '../../material-design/tab-layout'
import MenuTab from './tabs/menu-tab'
import ActionsTab from './tabs/actions-tab'
import AppsTab from './tabs/apps-tab'

import '../../resources/menu/scss/menu.scss'
import '../../resources/menu/scss/menu-toolbar.scss'
import '../../resources/menu/scss/menu-tabbar.scss'
import '../../resources/menu/scss/menu-item.scss'
import '../../resources/menu/scss/menu-tab.scss'
import '../../resources/menu/scss/apps-tab.scss'
import '../../resources/menu/scss/actions-tab.scss'

export default class Menu extends React.Component {
  constructor () {
    super()

    this.state = {
      opacity: 0,
      top: 0,
      height: 90,
      isExpanded: true,
      canGoBack: false,
      canGoForward: false
    }

    this.tabLayout = null
    this.menu = null

    this.menuTab = null
    this.actionsTab = null
    this.appsTab = null

    this.menuToolbar = null

    this.mouseX = null
    this.mouseY = null

    this.height = 0
  }

  componentDidMount () {
    var self = this

    // communicate with main window

    ipcRenderer.on('browser-menu:show-animation', function (e, mouseX, mouseY) {
      self.mouseX = mouseX
      self.mouseY = mouseY

      self.setPosition()
      self.show()
    })

    ipcRenderer.on('browser-menu:hide-animation', function () {
      self.hide()
    })

    ipcRenderer.on('webview:can-go-back', function (e, can) {
      self.setState({canGoBack: can})
    })

    ipcRenderer.on('webview:can-go-forward', function (e, can) {
      self.setState({canGoForward: can})
    })

    window.addEventListener('click', this.hide)

    this.tabLayout.setState({
      tabs: [
        {
          title: 'ACTIONS',
          page: this.actionsTab
        }, {
          title: 'MENU',
          page: this.menuTab
        }, {
          title: 'APPS',
          page: this.appsTab
        }
      ]
    })
  }

  /*
  events
  */
  onClick = (e) => {
    e.stopPropagation()
  }

  onSelect = (e) => {
    var self = this
    setTimeout(function () {
      var height
      if (e.page != null) {
        height = 90 + 8 + e.page.root.offsetHeight
      } else {
        height = 90 - 8
      }
      self.setState({
        height: spring(height, menuAnimationData.menuHeightSpring)
      })

      self.fixPosition(height)

      self.height = height
    }, 1)
  }
  /*
  * sets position of window
  */
  setPosition = () => {
    var screenHeight = window.screen.availHeight
    var screenWidth = window.screen.availWidth
    var height = this.menu.offsetHeight
    var x = this.mouseX - 7
    var y = this.mouseY - 39

    if (this.mouseX + this.menu.offsetWidth >= screenWidth) {
      x = this.mouseX - this.menu.offsetWidth - 8
    }
    if (this.mouseY + height >= screenHeight) {
      y = this.mouseY - height - 40
    }

    remote.getCurrentWindow().setPosition(x, y)

    this.fixPosition(height)
  }
  /*
  * hides menu
  */
  hide = () => {
    this.setState({
      opacity: spring(0, menuAnimationData.opacitySpring),
      top: spring(0, menuAnimationData.topSpring)
    })
    remote.getCurrentWindow().setIgnoreMouseEvents(true)
  }
  /*
  * shows menu
  */
  show = () => {
    remote.getCurrentWindow().setIgnoreMouseEvents(false)
    remote.getCurrentWindow().focus()
    this.setState({
      opacity: spring(1, menuAnimationData.opacitySpring),
      top: spring(40, menuAnimationData.topSpring)
    })
  }
  /*
  * fixes window position
  * @param1 {Number} height - the total height of window
  */
  fixPosition = (height) => {
    var y = remote.getCurrentWindow().getPosition()[1]
    var x = remote.getCurrentWindow().getPosition()[0]
    var yFromDown = y + height
    var screenHeight = window.screen.availHeight

    if (y < 0) {
      remote.getCurrentWindow().setPosition(x, 32)
    }

    if (yFromDown > screenHeight) {
      remote.getCurrentWindow().setPosition(x, screenHeight - height - 80)
    }
  }

  render () {
    var self = this

    var expandStyle = {
      backgroundImage: (this.state.isExpanded)
        ? 'url(img/icons/up.png)'
        : 'url(img/icons/down.png)'
    }
    var backClass = (this.state.canGoBack)
      ? 'icon'
      : 'icon disabled-icon'
    var forwardClass = (this.state.canGoForward)
      ? 'icon'
      : 'icon disabled-icon'

    /*
    events
    */
    function onBackClick () {
      self.hide()
      remote.getCurrentWindow().getParentWindow().send('webview:back')
    }

    function onForwardClick () {
      self.hide()
      remote.getCurrentWindow().getParentWindow().send('webview:forward')
    }

    function onRefreshClick () {
      self.hide()
      remote.getCurrentWindow().getParentWindow().send('webview:reload')
    }

    function onStarClick () {
      self.hide()
    }

    function onExpandClick () {
      if (self.state.isExpanded) {
        self.setState({
          height: spring(36, menuAnimationData.menuHeightSpring)
        })
      } else {
        self.setState({
          height: spring(self.height, menuAnimationData.menuHeightSpring)
        })
      }
      self.fixPosition(self.height)
      self.setState({
        isExpanded: !self.state.isExpanded
      })
    }

    return (
      <div>
        <Motion style={{
          opacity: this.state.opacity,
          top: this.state.top,
          height: this.state.height
        }}>
          {value => <div ref={(t) => { this.menu = t }} onClick={this.onClick} className='menu' style={{
            opacity: value.opacity,
            marginTop: value.top,
            height: value.height
          }}>
            <div ref={(t) => { this.menuToolbar = t }} className='menu-toolbar'>
              <div className='icons'>
                <div className={backClass} onClick={onBackClick} style={{
                  backgroundImage: 'url(img/icons/back.png)'
                }} />
                <div className={forwardClass} onClick={onForwardClick} style={{
                  backgroundImage: 'url(img/icons/forward.png)'
                }} />
                <div className='icon' onClick={onRefreshClick} style={{
                  backgroundImage: 'url(img/icons/refresh.png)'
                }} />
                <div className='icon' onClick={onStarClick} style={{
                  backgroundImage: 'url(img/icons/star_empty.png)'
                }} />
                <div className='icon' onClick={onExpandClick} style={expandStyle} />
              </div>
              <TabLayout onSelect={this.onSelect} ref={(t) => { this.tabLayout = t }} />
            </div>
            <div className='menu-pages'>
              <MenuTab ref={(t) => { this.menuTab = t }} />
              <ActionsTab ref={(t) => { this.actionsTab = t }} />
              <AppsTab ref={(t) => { this.appsTab = t }} />
            </div>
          </div>}
        </Motion>
      </div>
    )
  }
}

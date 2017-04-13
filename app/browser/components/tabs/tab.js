import React from 'react'
import {Motion, spring} from 'react-motion'
import Colors from '../../../helpers/colors'

export default class Tab extends React.Component {
  constructor () {
    super()

    this.state = {
      left: 0,
      width: 0,
      backgroundColor: 'transparent',
      zIndex: 1,
      title: 'New tab',
      render: true,
      titleVisible: true,
      closeVisible: true,
      selected: false,
      rightBorderVisible: true,
      animateBackgroundColor: false,
      favicon: '',
      loading: false,
      visible: true
    }
    this.getPage = null

    this.selectedBackgroundColor = '#fff'
    this.mouseLeaveBgColor = null
    this.selected = false

    this.pinned = false
    this.locked = false

    this.width = 0

    this.tab = null

    this.hiding = true
  }
  /*
    lifecycle
    */
  componentDidMount () {
    tabs.push(this)

    if (tabs.indexOf(this) === 0) {
      this.setState({showLeftBorder: false})
    } else {
      this.setState({showLeftBorder: true})
    }

    var positions = this.props.getTabBar().getPositions().tabPositions

    this.setState({
      left: positions[tabs.indexOf(this)]
    }, function () {
      this.props.getTabBar().setWidths()
      this.props.getTabBar().setPositions()
    })

    this.props.getApp().addPage(this.getTab)
  }

  /*
  events
  */
  onPageInitialized = () => {
    if (this.props.data.select) {
      this.props.getTabBar().selectTab(this)
    }
  }

  /*
    * reorders tabs
    * @param1 {Number} cursorX
    */
  reorderTabs = (cursorX) => {
    if (!this.pinned) {
      var overTab = this.props.getTabBar().getTabFromMousePoint(this, cursorX)

      if (overTab != null && !overTab.pinned) {
        var indexTab = tabs.indexOf(this)
        var indexOverTab = tabs.indexOf(overTab)

        this.props.getTabBar().replaceTabs(indexTab, indexOverTab)
      }
    }
  }
  /*
    * pins tab
    */
  pin = () => {
    if (!this.pinned) {
      this.setState({titleVisible: false, closeVisible: false})
    } else {
      this.setState({titleVisible: true, closeVisible: true})
    }

    this.pinned = !this.pinned

    var tempTabs = []
    for (var i = 0; i < tabs.length; i++) {
      if (tabs[i].pinned) {
        tempTabs.push(tabs[i])
      }
    }
    for (i = 0; i < tabs.length; i++) {
      if (!tabs[i].pinned) {
        tempTabs.push(tabs[i])
      }
    }
    tabs = tempTabs

    this.props.getTabBar().setWidths()
    this.props.getTabBar().setPositions()
  }
  /*
    * selects tab
    */
  select = () => {
    var self = this

    this.setState({
      backgroundColor: this.selectedBackgroundColor,
      selected: true,
      zIndex: 3,
      animateBackgroundColor: false,
      closeVisible: !this.pinned
    })

    this.getPage().setState({visible: true})
    this.selected = true

    var bar = this.props.getApp().getBar()
    bar.hideSuggestions()

    setTimeout(function () {
      if (self.getPage().getWebView().getWebContents() != null) {
        // refresh navigation icons in Menu
        var menu = currentWindow.getChildWindows()[0]
        var webview = self.getPage().getWebView()
        menu.send('webview:can-go-back', webview.canGoBack())
        menu.send('webview:can-go-forward', webview.canGoForward())

        self.props.getApp().updateBarText(webview.getURL())
        if (bar.getText() === '') {
          bar.input.focus()
        }
      }
    }, 1)

    this.props.getTabBar().updateTabs()
  }
  /*
    * deselects tab
    */
  deselect = () => {
    this.setState(
      {
        backgroundColor: '#E0E0E0',
        selected: false,
        zIndex: 1,
        animateBackgroundColor: false,
        closeVisible: false
      }
    )

    this.getPage().setState({visible: false})

    this.selected = false

    this.props.getTabBar().updateTabs()
  }
  /*
    * gets tab
    * @return {Tab}
    */
  getTab = () => {
    return this
  }

  render () {
    var self = this
    var tabHandlers = {
      onMouseDown: onMouseDown,
      onDoubleClick: onDoubleClick,
      onMouseEnter: onMouseEnter,
      onMouseLeave: onMouseLeave
    }
    var borderRightStyle = {
      right: -1,
      display: (this.state.selected || !this.state.rightBorderVisible && this.state.visible)
        ? 'none'
        : 'block',
      backgroundColor: this.props.getTabBar().state.borderColor
    }
    var borderRight2Style = {
      display: (this.state.selected && this.state.visible)
        ? 'block'
        : 'none',
      right: 0,
      backgroundColor: this.props.getTabBar().state.borderColor
    }
    var borderLeftStyle = {
      display: (this.state.selected && tabs.indexOf(this) !== 0 && this.state.visible)
        ? 'block'
        : 'none',
      backgroundColor: this.props.getTabBar().state.borderColor
    }

    var titleMaxWidth = 0
    if (this.state.closeVisible) {
      titleMaxWidth += 32
    } else {
      titleMaxWidth += 16
    }
    if (this.state.favicon === '' && !this.state.loading) {
      titleMaxWidth += 16
    } else {
      titleMaxWidth += 32
    }

    var titleStyle = {
      display: (this.state.titleVisible)
        ? 'block'
        : 'none',
      maxWidth: `calc(100% - ${titleMaxWidth}px)`,
      left: (this.state.favicon === '' && !this.state.loading)
        ? 12
        : 32
    }
    var faviconStyle = {
      backgroundImage: (this.state.favicon !== '') ? 'url(' + this.state.favicon + ')' : '',
      display: (this.state.favicon === '') ? 'none' : 'block'
    }
    var closeStyle = {
      opacity: (this.state.closeVisible)
        ? 1
        : 0
    }

    /*
    events
    */
    function onMouseDown (e) {
      self.props.getTabBar().selectTab(self)
      self.props.getTabBar().dragData = {
        tabX: e.currentTarget.offsetLeft,
        mouseClickX: e.clientX,
        canDrag: !self.pinned,
        tab: self
      }
      window.addEventListener('mousemove', self.props.getTabBar().onMouseMove)
    }

    function onMouseEnter () {
      if (!self.selected) {
        var rgba = Colors.shadeColor(self.state.backgroundColor, 0.05)
        self.mouseLeaveBgColor = self.state.backgroundColor
        self.setState({backgroundColor: rgba, animateBackgroundColor: true})
        if (!self.pinned) {
          self.setState({closeVisible: true})
        }
      }
    }

    function onMouseLeave () {
      if (!self.selected) {
        self.setState({backgroundColor: self.mouseLeaveBgColor, animateBackgroundColor: true, closeVisible: false})
        setTimeout(function () {
          self.setState({animateBackgroundColor: false})
        }, 200)
      }
    }

    function onCloseClick () {
      if (self.state.closeVisible) {
        self.props.getTabBar().closeTab(self)
      }
    }

    function onDoubleClick () {
      if (self.selected) {
        self.props.getApp().getBar().show()
      }
    }

    function onRest () {
      if (!self.hiding) {
        self.setState({render: false})
      }
    }

    if (this.state.render) {
      return (
        <Motion style={{
          x: this.state.left,
          width: this.state.width
        }} onRest={onRest}>
          {value => <div {...tabHandlers} ref={(tab) => { this.tab = tab }} className='tab' style={{
            width: value.width,
            backgroundColor: this.state.backgroundColor,
            zIndex: this.state.zIndex,
            left: value.x,
            transition: (this.state.animateBackgroundColor)
              ? '0.2s background-color'
              : 'none'
          }}>
            <div className='tab-mask'>
              <div className='tab-title' style={titleStyle}>
                {this.state.title}
              </div>
              <div className='tab-close-container' style={closeStyle}>
                <div className='tab-close' onClick={onCloseClick} />
              </div>
              <div className='tab-favicon' style={faviconStyle} />
            </div>
            <div className='tab-border' style={borderRightStyle} />
            <div className='tab-border2' style={borderLeftStyle} />
            <div className='tab-border2' style={borderRight2Style} />
          </div>}
        </Motion>
      )
    }
    return null
  }
}

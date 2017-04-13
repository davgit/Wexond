import React from 'react'
import Storage from '../../../helpers/browser-storage'

export default class Page extends React.Component {
  constructor () {
    super()

    this.state = {
      render: true,
      visible: false,
      webviewHeight: 0
    }

    checkFiles()
  }
  /*
    * lifecycle
    */
  componentDidMount () {
    var self = this
    this.props.getTab().getPage = this.getPage
    this.props.getTab().onPageInitialized()
    this.resize()

    // webview events
    this.getWebView().addEventListener('ipc-message', function (e) {
      if (e.channel === 'webview:mouse-left-button') {
        // hide bar on webview click
        var bar = self.props.getApp().getBar()
        if (!bar.locked) {
          bar.hide()
        }
      }
    })

    this.getWebView().addEventListener('did-start-loading', function () {
      // refresh navigation icons in Menu
      var menu = currentWindow.getChildWindows()[0]
      menu.send('webview:can-go-back', self.getWebView().canGoBack())
      menu.send('webview:can-go-forward', self.getWebView().canGoForward())
    })

    this.getWebView().addEventListener('did-finish-load', function () {
      var webview = self.getWebView()
      // check if tab is selected
      if (self.props.getTab() != null && self.props.getTab().selected) {
        self.props.getApp().updateBarText(webview.getURL())
      }
      // add history item
      Storage.addHistoryItem(webview.getTitle(), webview.getURL())
    })

    this.getWebView().addEventListener('page-title-updated', function (e) {
      self.props.getTab().setState({title: e.title})
    })

    this.getWebView().addEventListener('page-favicon-updated', function (e) {
      self.props.getTab().setState({favicon: e.favicons[0]})
    })
  }

  /*
    * resizes contents of page
    */
  resize = () => {
    this.setState({
      webviewHeight: window.innerHeight - 32
    })
  }
  /*
    * gets page
    * @return {Page}
    */
  getPage = () => {
    return this
  }
  /*
    * gets webview
    * @return {<webview>}
    */
  getWebView = () => {
    return this.refs.webview
  }

  render () {
    var pageStyle = {}

    var webviewStyle = {
      height: this.state.webviewHeight
    }

    if (this.state.visible) {
      pageStyle.opacity = 1
      pageStyle.position = 'relative'
      pageStyle.height = '100vh'
    } else {
      pageStyle.opacity = 0
      pageStyle.position = 'absolute'
      pageStyle.height = 0
    }

    if (this.state.render) {
      return (
        <div className='page' style={pageStyle}>
          <webview preload='../webview-preload/global.js' className='page-webview' style={webviewStyle} src={this.props.getTab().props.data.url} ref='webview' />
        </div>
      )
    }
    return null
  }
}

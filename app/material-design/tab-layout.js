import React from 'react'
import {Motion, spring} from 'react-motion'
import ReactDOM from 'react-dom'

import '../resources/material-design/scss/tab-layout.scss'

export default class TabLayout extends React.Component {
  constructor () {
    super()

    this.state = {
      tabs: [],
      width: 0,
      dividerLeft: 0,
      dividerWidth: 0
    }
    this.tabs = []

    this.lastSelectedIndex = -1
    this.lastSelectedIndex2 = -1
  }

  componentDidMount () {
    this.setState({width: this.refs.tabLayout.offsetWidth})

    if (this.props.onSelect != null) {
      ReactDOM.findDOMNode(this).addEventListener('selected', this.props.onSelect)
    }
  }
  /*
    * selects and deselects tabs
    */
  selectTab = (tab) => {
    for (var i = 0; i < this.tabs.length; i++) {
      if (this.tabs[i] !== tab && this.tabs[i].selected) {
        this.tabs[i].deselect()
      }
    }
    tab.select()
    var event = document.createEvent('Event')
    event.initEvent('selected', true, true)
    event.page = tab.props.data.page
    ReactDOM.findDOMNode(this).dispatchEvent(event)
  }
  /*
    * gets tab layout
    * @return {TabLayout}
    */
  getTabLayout = () => {
    return this
  }

  render () {
    var tabStyle = {
      width: this.state.width / this.state.tabs.length
    }
    return (
      <div ref='tabLayout' style={this.props.style} className='tab-layout' onMouseDown={this.onMouseDown}>
        {this.state.tabs.map((object, i) => {
          return <Tab style={tabStyle} getTabLayout={this.getTabLayout} key={i} data={object} />
        })}
        <Motion style={{
          left: this.state.dividerLeft,
          width: this.state.dividerWidth
        }}>
          {value => <div className='indicator' style={{
            backgroundColor: this.props.color,
            width: value.width,
            left: value.left
          }} />}
        </Motion>
        {this.props.children}
      </div>
    )
  }
}

class Tab extends React.Component {
  constructor () {
    super()
    this.state = {
      color: '#fff'
    }
    this.selected = false
  }

  componentDidMount () {
    var tabLayout = this.props.getTabLayout()
    this.setState({color: tabLayout.props.defaultColor})
    tabLayout.tabs.push(this)

    setTimeout(function () {
      tabLayout.selectTab(tabLayout.tabs[0])
    }, 1)
  }
  /*
  events
  */
  onClick = () => {
    this.props.getTabLayout().selectTab(this)
  }
  /*
    * deselects tab
    */
  deselect = () => {
    var tabLayout = this.props.getTabLayout()
    this.setState({color: tabLayout.props.defaultColor})
    tabLayout.lastSelectedIndex = tabLayout.tabs.indexOf(this)
    var page = this.getPage()

    this.selected = false
  }
  /*
  * selects tab
  */
  select = () => {
    this.selected = true
    var tabLayout = this.props.getTabLayout()
    this.setState({color: tabLayout.props.color})
    tabLayout.setState({
      dividerWidth: spring(this.refs.tab.offsetWidth, tabLayoutAnimationData.tabsDividerSpring),
      dividerLeft: spring(this.refs.tab.offsetLeft, tabLayoutAnimationData.tabsDividerSpring)
    })
    var page = this.getPage()

    page.isVisible = true
    page.setState({display: 'block'})

    if (page != null) {
      if (tabLayout.lastSelectedIndex === -1 || tabLayout.lastSelectedIndex2 === tabLayout.tabs.indexOf(this)) {
        return
      }
      tabLayout.lastSelectedIndex2 = tabLayout.tabs.indexOf(this)

      var lastTab = tabLayout.tabs[tabLayout.lastSelectedIndex]
      var width = tabLayout.refs.tabLayout.offsetWidth
      if (tabLayout.tabs.indexOf(this) > tabLayout.lastSelectedIndex) {
        page.setState({left: window.innerWidth}, function() {
          page.setState({left: spring(0, tabLayoutAnimationData.pageMoveSpring)})
        })
        if (lastTab.getPage() != null) {
          lastTab.getPage().setState({left: spring(-width, tabLayoutAnimationData.pageMoveSpring)})
          lastTab.getPage().isVisible = false
        }
      } else {
        page.setState({left: -window.innerWidth}, function() {
          page.setState({left: spring(0, tabLayoutAnimationData.pageMoveSpring)})
        })
        if (lastTab.getPage() != null) {
          lastTab.getPage().setState({left: spring(width, tabLayoutAnimationData.pageMoveSpring)})
          lastTab.getPage().isVisible = false
        }
      }
    }
  }

  getPage = () => {
    return this.props.data.page
  }

  render () {
    var tabTitleStyle = {
      color: this.state.color
    }

    return (
      <div ref='tab' onClick={this.onClick} style={this.props.style} className='tab'>
        <div style={tabTitleStyle} className='tab-title'>
          {this.props.data.title}
        </div>
      </div>
    )
  }
}

TabLayout.defaultProps = {
  color: '#03A9F4',
  defaultColor: 'rgba(0, 0, 0, 0.54)'
}

import React from 'react'
import Tab from './tab'
import {Motion, spring} from 'react-motion'

export default class TabBar extends React.Component {
  constructor () {
    super()

    this.defaultOptions = {
      url: 'wexond://newtab/',
      select: true
    }

    this.state = {
      tabsToCreate: [],
      addButtonLeft: 0,
      addButtonVisible: true,
      borderColor: 'rgba(0,0,0,0.2)',
      tabbarBorderColor: 'rgba(0,0,0,0.1)'
    }

    this.timer = {
      canReset: false
    }

    this.nextPinnedTabIndex = 0
    this.dragData = {}
  }

  componentDidMount () {
    var self = this

    this.timer.timer = setInterval(function () {
      if (self.timer.canReset) {
        self.setWidths()
        self.setPositions()
        self.timer.canReset = false
      }
    }, 3000)

    // window events

    window.addEventListener('resize', function () {
      setTimeout(function () {
        self.setWidths(false)
        self.setPositions(false, false)

        for (var i = 0; i < tabs.length; i++) {
          tabs[i].getPage().resize()
        }
      }, 1)
    })

    window.addEventListener('mouseup', function () {
      self.dragData.canDrag = false

      self.setState({addButtonVisible: true})

      self.setPositions()

      if (tabs[tabs.indexOf(self.dragData.tab) - 1] != null) {
        tabs[tabs.indexOf(self.dragData.tab) - 1].setState({rightBorderVisible: false})
      }

      window.removeEventListener('mousemove', self.onMouseMove)
    })
  }
  /*
  events
  */
  onMouseMove = (e) => {
    var self = this

    var mouseDeltaX = e.pageX - self.dragData.mouseClickX

    if (Math.abs(mouseDeltaX) > 10) {
      if (self.dragData.canDrag) {
        self.dragData.tab.setState({
          left: self.dragData.tabX + e.clientX - self.dragData.mouseClickX
        })

        self.dragData.tab.reorderTabs(e.clientX)

        if (tabs.indexOf(this.dragData.tab) === tabs.length - 1) {
          self.setState({addButtonVisible: false})
        }

        if (tabs[tabs.indexOf(self.dragData.tab) - 1] != null) {
          tabs[tabs.indexOf(self.dragData.tab) - 1].setState({rightBorderVisible: true})
        }
      }
    }
  }
  /*
    * selects tab and deselects others
    * @param1 {Tab} tab
    */
  selectTab = (tab) => {
    for (var i = 0; i < tabs.length; i++) {
      if (tabs[i] === tab) {
        tab.select()
      } else {
        tabs[i].deselect()
      }
    }
  }
  /*
    * updates tabs' state (borders etc.)
    */
  updateTabs = () => {
    for (var i = 0; i < tabs.length; i++) {
      if (!tabs[i].selected) {
        tabs[i].setState({rightBorderVisible: true})
      }
    }

    for (i = 0; i < tabs.length; i++) {
      if (tabs[i].selected) {
        if (tabs[i - 1] != null) {
          tabs[i - 1].setState({rightBorderVisible: false})
        }
      }
    }
  }
  /*
    * adds tab to render queue
    * @param1 {Function} getPage
    */
  addTab = (options = this.defaultOptions) => {
    this.setState((p) => {
      p.tabsToCreate.push(options)
      return {tabsToCreate: p.tabsToCreate}
    })
  }
  /*
    * closes tab
    * @param1 {Tab} tab
    */
  closeTab = (tab) => {
    if (tabs.length === 1) {
      this.props.getApp().close()
      return
    }

    if (this.lastSelectedTab === tab) {
      this.lastSelectedTab = null
    }

    this.timer.canReset = true
    tab.getPage().setState({render: false})

    var index = tabs.indexOf(tab)
    var nextTab = tabs[index + 1]
    var prevTab = tabs[index - 1]
    tabs.splice(index, 1)

    if (nextTab != null) {
      this.selectTab(nextTab)
    } else {
      if (prevTab != null) {
        this.selectTab(prevTab)
      } else {
        if (tabs[0] != null) {
          this.selectTab(tabs[0])
        }
      }
    }

    if (index === tabs.length) {
      this.setWidths()
      this.setPositions()

      if (tab.width < 190) {
        tab.setState({render: false})
      } else {
        closeAnim()
      }
    } else {
      closeAnim()
    }

    function closeAnim () {
      tab.hiding = false
      tab.setState({
        width: spring(0, tabsAnimationsData.closeTabSpring),
        visible: false
      })
    }

    this.timer.time = 0
    this.setPositions()
  }
  /*
    * sets positions for tabs and add button
    * @param1 {Boolean} animateTabs (optional)
    * @param2 {Boolean} animateAddButton (optional)
    */
  setPositions = (animateTabs = true, animateAddButton = true) => {
    var data = this.getPositions()
    var lefts = data.tabPositions
    var addLeft = data.addButtonPosition

    for (var i = 0; i < tabs.length; i++) {
      if (animateTabs) {
        tabs[i].setState({
          left: spring(lefts[i], tabsAnimationsData.setPositionsSpring)
        })
      } else {
        tabs[i].setState({
          left: lefts[i]
        })
      }
    }

    if (animateAddButton) {
      this.setState({
        addButtonLeft: spring(addLeft, tabsAnimationsData.setPositionsSpring)
      })
    } else {
      this.setState({
        addButtonLeft: addLeft
      })
    }

    this.updateTabs()
  }
  /*
    * sets widths for all tabs
    * @param1 {Boolean} animation
    */
  setWidths = (animation = true) => {
    var widths = this.getWidths(1)

    for (var i = 0; i < tabs.length; i++) {
      if (animation) {
        tabs[i].setState({
          width: spring(widths[i], tabsAnimationsData.setWidthsSpring)
        })
      } else {
        tabs[i].setState({width: widths[i]})
      }

      tabs[i].width = widths[i]
    }

    this.updateTabs()
  }
  /*
    * calculates positions for all tabs and add button
    * @return {Object}
    */
  getPositions = () => {
    var tabCountTemp = 0
    var lefts = []
    var a = 0

    for (var i = 0; i < tabs.length; i++) {
      lefts.push(a)
      a += tabs[i].width + 1
    }

    return {tabPositions: lefts, addButtonPosition: a}
  }
  /*
    * calculates widths for all tabs
    * @return {Number}
    */
  getWidths = (margin = 0) => {
    var tabbarWidth = this.refs.tabbar.clientWidth
    var addButtonWidth = this.addButton.offsetWidth
    var tabWidthsTemp = []
    var tabWidths = []
    var pinnedTabsLength = 0

    for (var i = 0; i < tabs.length; i++) {
      if (tabs[i].pinned) {
        tabWidthsTemp.push({id: i, width: tabsData.pinnedTabWidth})
        pinnedTabsLength += 1
      }
    }

    for (i = 0; i < tabs.length; i++) {
      if (!tabs[i].pinned) {
        var margins = tabs.length * margin
        var pinnedTabsWidth = (pinnedTabsLength * tabsData.pinnedTabWidth)
        var tabWidthTemp = (tabbarWidth - addButtonWidth - margins - pinnedTabsWidth) / (tabs.length - pinnedTabsLength)
        if (tabWidthTemp > tabsData.maxTabWidth) {
          tabWidthTemp = tabsData.maxTabWidth
        }
        tabWidthsTemp.push({id: i, width: tabWidthTemp})
      }
    }

    for (i = 0; i < tabWidthsTemp.length; i++) {
      tabWidths[tabWidthsTemp[i].id] = tabWidthsTemp[i].width
    }

    return tabWidths
  }
  /*
    * gets tab from mouse point
    * @param1 {Tab} callingTab
    * @param2 {Number} cursorX
    * @return {Tab}
    */
  getTabFromMousePoint = (callingTab, xPos) => {
    for (var i = 0; i < tabs.length; i++) {
      if (tabs[i] !== callingTab) {
        if (this.contains(tabs[i], xPos)) {
          if (!tabs[i].locked) {
            return tabs[i]
          }
        }
      }
    }
    return null
  }
  /*
    * checks if {Tab}.refs.tab contains mouse x position
    * @param1 {Tab} tabToCheck
    * @param2 {Number} cursorX
    * @return {Boolean}
    */
  contains = (tabToCheck, xPos) => {
    var rect = tabToCheck.tab.getBoundingClientRect()

    if (xPos >= rect.left && xPos <= rect.right) {
      return true
    }
    return false
  }
  /*
    * replaces tabs
    * @param1 {Number} firstIndex
    * @param2 {Number} secondIndex
    * @param3 {Boolean} changePos (optional)
    */
  replaceTabs = (firstIndex, secondIndex, changePos = true) => {
    var firstTab = tabs[firstIndex]
    var secondTab = tabs[secondIndex]
    tabs[firstIndex] = secondTab
    tabs[secondIndex] = firstTab

    if (tabs.indexOf(firstTab) === 0) {
      firstTab.setState({leftBorderVisible: false})
    } else {
      firstTab.setState({leftBorderVisible: true})
    }

    if (changePos) {
      this.changePos(secondTab)
    }
  }
  /*
   * changes position of tab to its place
   * @param1 {Tab} callingTab
   */
  changePos = (callingTab) => {
    var data = this.getPositions()
    var newTabPos = data.tabPositions[tabs.indexOf(callingTab)]
    callingTab.locked = true
    callingTab.setState({
      left: spring(newTabPos, tabsAnimationsData.setPositionsSpring)
    })
    setTimeout(function () {
      callingTab.locked = false
    }, 200)

    this.updateTabs()

    if (newTabPos === 0) {
      callingTab.setState({leftBorderVisible: false})
    } else {
      callingTab.setState({leftBorderVisible: true})
    }
  }
  /*
    * gets TabBar
    * @return {TabBar}
    */
  getTabBar = () => {
    return this
  }
  /*
    * gets add tab button
    * @return {DOMElement}
    */
  getAddButton = () => {
    return this.refs.addButton
  }

  render () {
    var self = this

    var tabbarBorderStyle = {
      backgroundColor: this.state.tabbarBorderColor
    }

    return (
      <div style={this.props.style} className='tabbar' ref='tabbar'>
        {this.state.tabsToCreate.map((object, i) => {
          return <Tab getApp={self.props.getApp} getTabBar={self.getTabBar} key={i} data={object} />
        })}
        <Motion style={{
          x: this.state.addButtonLeft
        }}>
          {value => <div className='tabbar-add' ref={(addButton) => { this.addButton = addButton }} style={{
            display: (this.state.addButtonVisible)
              ? 'block'
              : 'none',
            left: value.x
          }} onClick={() => this.addTab()} />}
        </Motion>
        <div className='tabbar-border' style={tabbarBorderStyle} />
      </div>
    )
  }
}

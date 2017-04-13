import React from 'react'
import {Motion, spring} from 'react-motion'
import Suggestion from './suggestion'
import Suggestions from '../../../helpers/suggestions'
import Network from '../../../helpers/network'

export default class Bar extends React.Component {
  constructor () {
    super()

    this.state = {
      barTop: -20,
      barOpacity: 0,
      suggestionsOpacity: 0,
      watermarkVisible: true,
      suggestionsToCreate: [],
      barVisible: false,
      suggestionsVisible: false,
      hint: '',
      hintLeft: 0,
      inputText: ''
    }

    this.tempLocked = false
    this.locked = true

    this.canSuggest = false
    this.suggestions = []

    this.input = null
    this.lastText = ''

    this.barVisible = false
    this.suggestionsVisible = false

    this.suggestedURL = ''
  }

  componentDidMount () {
    var self = this
    document.body.addEventListener('mousemove', function (e) {
      if (e.pageY > 120 && !self.locked && !self.tempLocked && self.barVisible) {
        self.hide()
      }
      if (e.pageY <= 32 && !self.barVisible) {
        self.show()
      }
    })
    this.show()
  }

  /*
  * gets selected suggestions
  * @return {Suggestion}
  */
  getSelectedSuggestion = () => {
    var suggestions = this.suggestions
    for (var i = 0; i < suggestions.length; i++) {
      if (suggestions[i].state.selected) {
        return suggestions[i]
      }
    }
    return null
  }
  /*
  * moves to next or previous suggestion
  * @param1 {Number} moveBy
  */
  selectSuggestion = (moveBy) => {
    var suggestions = this.suggestions
    var selectedSuggestion = this.getSelectedSuggestion()
    var selectedIndex = suggestions.indexOf(selectedSuggestion)

    if (selectedSuggestion == null) {
      if (suggestions[0] != null) {
        suggestions[0].setState({selected: true})
      }
    } else {
      if (suggestions[selectedIndex + moveBy] != null) {
        for (var i = 0; i < suggestions.length; i++) {
          suggestions[i].setState({selected: false})
        }
        suggestions[selectedIndex + moveBy].setState({selected: true})
        this.input.value = suggestions[selectedIndex + moveBy].state.url
      }
    }
  }
  /*
  * selects suggestion by index
  * @param1 {Number} index
  */
  selectSuggestionByIndex = (index) => {
    var suggestions = this.suggestions
    if (suggestions[index] != null) {
      for (var i = 0; i < suggestions.length; i++) {
        suggestions[i].setState({selected: false})
      }
      suggestions[index].setState({selected: true})
    }
  }

  /*
  * shows bar
  */
  show = () => {
    this.setState({
      barOpacity: spring(1, barAnimationsData.opacitySpring),
      barTop: spring(0, barAnimationsData.topSpring),
      barVisible: true
    })
    this.barVisible = true
  }
  /*
  * hides bar
  */
  hide = () => {
    this.setState({
      barOpacity: spring(0, barAnimationsData.opacitySpring),
      barTop: spring(-20, barAnimationsData.topSpring)
    })
    this.input.value = this.lastText
    this.removeHint()
    this.barVisible = false
    this.tempLocked = false
    this.input.blur()
    this.updateBar()
    this.hideSuggestions()
  }
  /*
  * hides suggestions
  */
  hideSuggestions = () => {
    this.setState({
      suggestionsOpacity: spring(0, barAnimationsData.suggestionsOpacitySpring)
    })
    this.suggestionsVisible = false
  }
  /*
  * shows suggestions
  */
  showSuggestions = () => {
    this.setState({
      suggestionsOpacity: spring(1, barAnimationsData.suggestionsOpacitySpring),
      suggestionsVisible: true
    })
    this.suggestionsVisible = true
    this.tempLocked = true
    this.show()
  }
  /*
  * sets text
  * @param1 {String} text
  */
  setText = (text) => {
    this.lastText = text
    this.input.value = text
    this.updateBar()
  }
  /*
  * updates bar
  * @param1 {Boolean} toggleSuggestions
  */
  updateBar = (toggleSuggestions = false) => {
    if (this.input.value === '') {
      this.removeHint()
      this.setState({watermarkVisible: true})
      if (toggleSuggestions) {
        this.hideSuggestions()
      }
    } else {
      this.setState({watermarkVisible: false})
    }
  }
  /*
  * auto completes input with given text
  * @param1 {DOMElement} input
  * @param2 {String} text - text to autocomplete
  */
  autoComplete = (text) => {
    var inputText = this.input.value
    if (text != null || text !== '') {
      if (text.toLowerCase().startsWith(inputText.toLowerCase())) {
        var hintText = text.replace(inputText, '')
        this.setState({hint: hintText, hintLeft: this.textWidth.offsetWidth})
        this.suggestedURL = text
      }
    }
  }
  /*
  * removes suggested text from input
  */
  removeHint = () => {
    this.setState({hint: ''})
    this.suggestedURL = ''
  }
  /*
  * shows and focuses bar
  */
  focus = () => {
    this.show()
    this.input.focus()
  }
  /*
  * gets bar
  * @return {Bar}
  */
  getBar = () => {
    return this
  }
  /*
  * gets text
  * @return {String}
  */
  getText = () => {
    return this.lastText
  }

  render () {
    var watermarkStyle = {
      display: (this.state.watermarkVisible)
        ? 'block'
        : 'none'
    }
    var inputEvents = {
      onKeyDown: onKeyDown,
      onChange: onChange,
      onFocus: onFocus
    }

    var self = this

    function onChange (e) {
      self.setState({inputText: self.input.value})
      self.updateBar(true)

      var suggestions = []

      Suggestions.getHistorySuggestions(self.input, function (data) {
        if (!(data.length <= 0)) {
          suggestions.push({type: 'separator', text: 'History'})
        }
        for (var i = 0; i < data.length; i++) {
          var object = {
            type: 'history',
            url: data[i].url,
            title: data[i].title
          }
          suggestions.push(object)
        }

        if (data[0] != null) {
          self.autoComplete(data[0].url)
        } else {
          self.removeHint()
        }

        Suggestions.getSearchSuggestions(self.input, function (data, error) {
          if (!(data.length <= 0)) {
            suggestions.push({type: 'separator', text: 'Google search'})
          }

          if (!error) {
            for (var i = 0; i < data.length; i++) {
              var object = {
                type: 'search',
                title: data[i],
                url: 'https://www.google.com/search?q=' + data[i]
              }
              suggestions.push(object)
            }
          }

          self.setState({suggestionsToCreate: []})
          if (suggestions.length <= 0) {
            self.hideSuggestions()
            return
          } else {
            if (self.barVisible) {
              self.showSuggestions()
            }
          }
          self.setState({suggestionsToCreate: suggestions})
        })
      })
    }

    function onSuggestionsClick () {
      self.hideSuggestions()
    }

    function onKeyDown (e) {
      var key = e.keyCode || e.charCode
      // arrow up
      if (key === 38) {
        self.removeHint()
        self.selectSuggestion(-1)
        e.preventDefault()
      }
      // arrow down
      if (key === 40) {
      self.removeHint()
        self.selectSuggestion(1)
        e.preventDefault()
      }
      // arrow right
      if (key === 39) {
        if (self.suggestedURL !== '') {
          self.input.value = self.suggestedURL
          self.removeHint()
        }
      }
      // enter
      if (key === 13) {
        e.preventDefault()
        if (self.suggestedURL !== '') {
          self.input.value = self.suggestedURL
          self.removeHint()
        }
        for (var i = 0; i < tabs.length; i++) {
          if (tabs[i].selected) {
            var webview = tabs[i].getPage().getWebView()
            if (!e.currentTarget.value.startsWith('wexond://')) {
              if (Network.isURL(e.currentTarget.value)) {
                webview.loadURL(e.currentTarget.value)
              } else {
                if (Network.isURL('http://' + e.currentTarget.value)) {
                  webview.loadURL('http://' + e.currentTarget.value)
                } else {
                  webview.loadURL('https://www.google.com/search?q=' + e.currentTarget.value)
                }
              }
            } else {
              webview.loadURL(e.currentTarget.value)
            }
          }
        }
        self.tempLocked = false
        self.locked = false
        self.hide()
        self.hideSuggestions()
      }
    }

    function onRest () {
      if (!self.barVisible) {
        self.setState({suggestionsVisible: false, barVisible: false})
      }
      if (!self.suggestionsVisible) {
        self.setState({suggestionsVisible: false})
      }
    }

    function onFocus () {
      self.input.setSelectionRange(0, self.input.value.length)
      self.tempLocked = true
    }

    return (
      <Motion style={{
        barTop: this.state.barTop,
        barOpacity: this.state.barOpacity,
        suggestionsOpacity: this.state.suggestionsOpacity
      }} onRest={onRest}>
        {value => <div>
          <div style={{
            marginTop: value.barTop,
            opacity: value.barOpacity,
            display: (this.state.barVisible)
              ? 'block'
              : 'none'
          }} className='bar'>
            <div className='bar-search-icon' />
            <div style={watermarkStyle} className='bar-watermark'>Search</div>
            <div className='bar-hint' style={{marginLeft: this.state.hintLeft}}>{this.state.hint}</div>
            <span ref={(t) => { this.textWidth = t }} style={{opacity: 0, top: -300, fontSize: 14, position: 'absolute'}}>{this.state.inputText}</span>
            <input ref={(t) => {
              this.input = t
            }} {...inputEvents} className='bar-input' />
          </div>
          <div onClick={onSuggestionsClick} className='suggestions' style={{
            opacity: value.suggestionsOpacity,
            display: (this.state.suggestionsVisible)
              ? 'block'
              : 'none'
          }}>
            {this.state.suggestionsToCreate.map((object, i) => {
              if (object.type !== 'separator') {
                return <Suggestion getBar={self.getBar} key={i} data={object} />
              } else {
                return <div key={i} className='suggestions-separator'>{object.text}</div>
              }
            })}
          </div>
        </div>}
      </Motion>
    )
  }
}

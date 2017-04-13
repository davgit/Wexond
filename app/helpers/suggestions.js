import Network from './network'
export default class Suggestions {
  /*
  * gets suggestions from search engine
  * @param1 {DOMElement} input
  * @param2 {function(data)} callback
  */
  static getSearchSuggestions = (input, callback = null) => {
    var inputText = input.value.slice(0, input.selectionStart) + input.value.slice(input.selectionEnd)
    var suggestions = []
    Network.requestUrl('http://google.com/complete/search?client=chrome&q=' + inputText, function (data, error) {
      if (error) {
        if (callback != null) {
          callback(null, error)
        }
        return
      }

      try {
        var json = JSON.parse(data)
        var tempSuggestions = []

        for (var i = 0; i < json[1].length; i++) {
          if (!tempSuggestions.isInArray(json[1][i])) {
            tempSuggestions.push(json[1][i])
          }
        }

        // remove duplicates from array
        var seenSuggestions = []
        for (i = 0; i < tempSuggestions.length; i++) {
          if (!seenSuggestions.isInArray(tempSuggestions[i])) {
            suggestions.push(tempSuggestions[i])
            seenSuggestions.push(tempSuggestions[i])
          }
        }

        // sort array by length
        suggestions.sort(function (a, b) {
          return a.length - b.length
        })

        // set max length for array
        tempSuggestions = []
        var length = 5
        if (suggestions.length > 5) {
          length = 5
        } else {
          length = suggestions.length
        }
        for (i = 0; i < length; i++) {
          tempSuggestions.push(suggestions[i])
        }

        suggestions = tempSuggestions

        if (callback != null) {
          callback(suggestions)
        }
      } catch (e) {
        if (callback != null) {
          callback(null, e)
        }
      }
    })
  }
  /*
  * gets suggestions from history
  * @param1 {DOMElement} input
  * @param2 {function(data)} callback
  */
  static getHistorySuggestions = (input, callback = null) => {
    var suggestions = []
    var inputText = input.value.slice(0, input.selectionStart) + input.value.slice(input.selectionEnd)

    Network.requestUrl(historyPath, function (data, error) {
      var json = JSON.parse(data)
      if (inputText !== '') {
        var tempSuggestions = []
        for (var i = 0; i < json.length; i++) {
          var url = json[i].url
          var title = json[i].title
            // remove http:// and www://
          if (url.startsWith('http://')) {
            url = url.split('http://')[1]
            if (url.startsWith('www.')) {
              url = url.split('www.')[1]
            }
          }
            // remove https:// and www://
          if (url.startsWith('https://')) {
            url = url.split('https://')[1]
            if (url.startsWith('www.')) {
              url = url.split('www.')[1]
            }
          }

          var suggestion = {
            url: url,
            title: title
          }

          if (url.startsWith(inputText)) {
            if (!tempSuggestions.isInArray(suggestion)) {
              tempSuggestions.push(suggestion)
            }
          }
        }

          // remove duplicates from array
        var seenSuggestions = []
        for (i = 0; i < tempSuggestions.length; i++) {
          if (!seenSuggestions.isInArray(tempSuggestions[i].url)) {
            suggestions.push(tempSuggestions[i])
            seenSuggestions.push(tempSuggestions[i].url)
          }
        }

          // sort array by length
        suggestions.sort(function (a, b) {
          return a.url.length - b.url.length
        })
      }

        // set max length for array
      tempSuggestions = []
      var length = 5
      if (suggestions.length > 5) {
        length = 5
      } else {
        length = suggestions.length
      }
      for (i = 0; i < length; i++) {
        tempSuggestions.push(suggestions[i])
      }

      suggestions = tempSuggestions

      if (callback != null) {
        callback(suggestions)
      }
    })
  }
}

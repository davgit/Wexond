// TODO: add removeHistory and getHistoryIndex methods
export default class Storage {
  /*
  * adds history item
  * @param1 {String} title
  * @param2 {String} url
  * @param3 {function} callback
  */
  static addHistoryItem (title, url, callback = null) {
    var fs = require('fs')
    if (title != null && url != null) {
      // get today's date
      var today = new Date()
      var dd = today.getDate()
      var mm = today.getMonth() + 1
      var yyyy = today.getFullYear()

      if (dd < 10) {
        dd = '0' + dd
      }

      if (mm < 10) {
        mm = '0' + mm
      }

      today = mm + '-' + dd + '-' + yyyy

      // read history.json file and append new history items
      fs.readFile(historyPath, function (error1, data) {
        if (error1) {
          console.error(error1)
          return
        }
        var jsonObject = JSON.parse(data)
        if (!url.startsWith('wexond://') && !url.startsWith('about:blank')) {
          // get current time
          var date = new Date()
          var currentHour = date.getHours()
          var currentMinute = date.getMinutes()
          var time = `${currentHour}:${currentMinute}`

          // configure newItem's data
          var newItem = {
            'url': url,
            'title': title,
            'date': today,
            'time': time
          }

          // get newItem's new id
          if (jsonObject[jsonObject.length - 1] == null) {
            newItem.id = 0
          } else {
            newItem.id = jsonObject[jsonObject.length - 1].id + 1
          }

          // push new history item
          jsonObject.push(newItem)

          // save the changes
          Storage.saveHistory(JSON.stringify(jsonObject), callback)
        }
      })
    }
  }
  /*
  * saves history
  * @param1 {String} json
  * @param2 {function} callback
  */
  static saveHistory (json, callback = null) {
    var fs = require('fs')

    fs.writeFile(historyPath, json, function (error) {
      if (error) {
        Storage.resetHistory()
        console.error(error)
      } else {
        if (callback != null) {
          // execute callback
          callback()
        }
      }
    })
  }
  /*
  * resets history
  * @param1 {function} callback
  */
  static resetHistory (callback = null) {
    Storage.saveHistory('[]', callback)
  }
  /*
  * gets history json object
  * @return {Object}
  */
  static getHistory (callback = null) {
    var fs = require('fs')
    fs.readFile(historyPath, function (error, data) {
      if (error) {
        callback(null, error)
      } else {
        callback(data, null)
      }
    })
  }
}

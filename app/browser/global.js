// electron's stuff and things
const {remote, clipboard, ipcRenderer} = require('electron')
const BrowserWindow = remote.BrowserWindow
const app = remote.app
const currentWindow = remote.getCurrentWindow()
const path = require('path')
// global paths to browser's storage
const appData = app.getPath('userData')
const userData = appData + '/userdata'
const historyPath = userData + '/history.json'
const extensionsPath = userData + '/extensions'
const bookmarksDataPath = userData + '/bookmarks.json'
// other requires
const nodeDir = require('node-dir')
const fs = require('fs')
// animations
const tabsAnimationsData = {
  hoverTransparency: 0.1,
  closeTabSpring: durationToSpring(0.3),
  addTabSpring: durationToSpring(0.3),
  setPositionsSpring: durationToSpring(0.3),
  setWidthsSpring: durationToSpring(0.3)
}
const barAnimationsData = {
  opacitySpring: durationToSpring(0.3),
  topSpring: durationToSpring(0.3),
  suggestionsOpacitySpring: durationToSpring(0.3)
}
// tabs
var tabs = []
const tabsData = {
  pinnedTabWidth: 32,
  maxTabWidth: 190
}
// don't display these URLs in bar
const excludeURLs = ['wexond://newtab', 'about:blank', 'wexond://newtab/']

function checkFiles () {
  // check if directory called userdata exists
  if (!fs.existsSync(userData)) {
    fs.mkdir(userData)
  }
  // check if directory called extensions exists
  if (!fs.existsSync(extensionsPath)) {
    fs.mkdir(extensionsPath)
  }
  // check if file called history.json exists
  if (!fs.existsSync(historyPath)) {
    fs.writeFile(historyPath, '[]')
  }
  // check if file called bookmarks.json exists
  if (!fs.existsSync(bookmarksDataPath)) {
    fs.writeFile(bookmarksDataPath, '[]')
  }
}

if (process.env.ENV === 'dev') {
  remote.getCurrentWindow().webContents.openDevTools()
}

console.log('Electron version: ' + process.versions.electron)

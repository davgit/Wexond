const ipcRenderer = require('electron').ipcRenderer
const remote = require('electron').remote

const menuAnimationData = {
  opacitySpring: durationToSpring(0.4),
  topSpring: durationToSpring(0.4),
  menuHeightSpring: durationToSpring(0.4)
}

tabLayoutAnimationData = {
  tabsDividerSpring: durationToSpring(0.4),
  pageMoveSpring: durationToSpring(0.4)
}

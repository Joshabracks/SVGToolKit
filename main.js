const { app, BrowserWindow } = require('electron')
const path = require('path')
require('electron-reload')(__dirname + 'index.html', {
  electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
});
let win

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    },
    frame: false,
    show: false
  })
  win.maximize()
  win.loadFile('index.html')
  // Open the DevTools.
  win.webContents.openDevTools(true)
  win.once('ready-to-show', () => {
    win.show()
  })
  win.on('closed', () => {
    win = null
  })
}

app.on('ready', createWindow)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})
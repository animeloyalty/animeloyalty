const app = require('animesync');
const electron = require('electron');
const fs = require('fs');
const packageData = require('../package.json');
const path = require('path');
let mainTray, mainWindow;

/**
 * ...
 */
function closedWindow() {
  mainWindow = null;
}

/**
 * ...
 */
function createTray() {
  if (process.platform === 'darwin' || mainTray) return;
  mainTray = new electron.Tray(getIconPath('icon.png'));
  mainTray.on('double-click', createWindow);
  mainTray.setContextMenu(electron.Menu.buildFromTemplate([{click: createWindow, label: 'Launch'}, {type: 'separator'}, {role: 'quit'}]));
  mainTray.setToolTip(`${packageData.name} (${packageData.version})`);
}

/**
 * ...
 */
function createWindow() {
  if (!mainWindow) {
    mainWindow = new electron.BrowserWindow({
      backgroundColor: '#303030', show: false,
      useContentSize: true, width: 852, height: 479,
      icon: getIconPath('icon.png'),
      title: `${packageData.name} (${packageData.version})`,
      webPreferences: {contextIsolation: true}
    });
    mainWindow.removeMenu();
    mainWindow.on('ready-to-show', onReadyToShow);
    mainWindow.on('page-title-updated', onPageTitleUpdated);
    mainWindow.webContents.on('before-input-event', onWebBeforeInputEvent);
    mainWindow.loadFile('public/index.html');
  } else if (mainWindow.isMinimized()) {
    mainWindow.restore();
    mainWindow.focus();
  } else {
    mainWindow.focus();
  }
}

/**
 * ...
 * @param {string} name 
 * @returns {string}
 */
function getIconPath(name) {
  const filePath = path.join(__dirname, name);
  return fs.existsSync(filePath) ? filePath : name;
}

/**
 * ...
 */
function onReadyToShow() {
  if (!mainWindow) return;
  mainWindow.show();
  mainWindow.webContents.executeJavaScript('checkStartup()', true);
}

/**
 * ...
 * @param {Electron.Event} event 
 */
function onPageTitleUpdated(event) {
  event.preventDefault();
}

/**
 * ...
 * @param {Electron.Event} event 
 * @param {Electron.Input} input 
 */
function onWebBeforeInputEvent(event, input) {
  if (input.key === 'Escape') {
    mainWindow?.webContents.sendInputEvent({type: input.type, keyCode: 'Backspace'});
    event.preventDefault();
  } else if (input.key === 'F12') {
    mainWindow?.toggleDevTools();
    event.preventDefault();
  }
}

/**
 * ...
 */
function startApplication() {
  app.Server.usingAsync(async () => {
    createTray();
    createWindow();
    await new Promise(() => {});
  });
}

if (electron.app.requestSingleInstanceLock()) {
  electron.app.on('activate', createWindow);
  electron.app.on('ready', startApplication);
  electron.app.on('second-instance', createWindow);
  electron.app.on('window-all-closed', closedWindow);
} else {
  electron.app.quit();
}

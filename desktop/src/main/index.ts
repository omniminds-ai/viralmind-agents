import { app, BrowserWindow, ipcMain } from 'electron';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { setupScreenshotHandlers } from './screenshot.js';
import { setupAgentHandlers } from './agent.js';
import { WindowTracker } from './services/WindowTracker.js';

// ESM replacement for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let mainWindow: BrowserWindow | null = null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: join(__dirname, '../preload/index.js'),
      webSecurity: true
    },
    frame: true,
    alwaysOnTop: true,
    backgroundMaterial: 'mica',
    titleBarStyle: 'hidden',
    vibrancy: 'fullscreen-ui'
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(process.cwd(), 'dist-electron/renderer/index.html'));
  }
};

app.whenReady().then(() => {
  createWindow();
  
  if (!mainWindow) {
    throw new Error('Failed to create main window');
  }
  
  setupScreenshotHandlers(ipcMain);
  setupAgentHandlers(ipcMain, mainWindow);
  
  // Initialize window tracker
  WindowTracker.getInstance().init();
});

app.on('before-quit', () => {
  // Clean up window tracker
  WindowTracker.getInstance().cleanup();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

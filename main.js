const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const process = require("process");
const path = require("path");
const srcFolder = "src";

app.whenReady().then(() => {
  ipcMain.handle("dialog:pickDir", handleDirPick);

  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      /* enableremotemodule: true,
      nodeIntegration: true, */
      preload: path.join(__dirname, srcFolder, "preload.js"),
    },
  });

  win.loadFile(path.join(srcFolder, "index.html"));
}

async function handleDirPick() {
  const { cancelled, filePaths } = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });
  if (!cancelled) return filePaths[0];
}

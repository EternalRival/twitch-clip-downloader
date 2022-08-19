const PROJECTNAME = "Twitch Clip Downloader";
const electron = require("electron");
const { app, BrowserWindow, clipboard, dialog, ipcMain, shell } = electron;
const process = require("process");
const path = require("path");
const srcFolder = "src";
const fs = require("fs");

let win = null;
let isFilePicked = false;
let isDirPicked = false;
let downloadDir = null;
let jsonFile = null;

app.disableHardwareAcceleration();
app.whenReady().then(() => {
  ipcMain.handle("getProjectName", () => PROJECTNAME);
  ipcMain.handle("parseJson", parseJson);
  ipcMain.handle("openURL", openURL);
  ipcMain.handle("dialog:pickFile", handleFilePick);
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
  win = new BrowserWindow({
    width: 800,
    height: 600,
    title: PROJECTNAME,
    webPreferences: {
      preload: path.join(__dirname, srcFolder, "preload.js"),
    },
  });
  win.loadFile(path.join(srcFolder, "index.html"))
  //win.webContents.openDevTools();
}

async function handleFilePick() {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [{ name: "*.json", extensions: ["json"] }],
  });
  if (!isFilePicked && canceled) return "⚠️ файл не выбран!";
  isFilePicked = true;
  jsonFile = filePaths[0] || jsonFile;
  return [`📝 выбран файл ${jsonFile}`, path.basename(jsonFile)];
}
async function handleDirPick() {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });
  if (!isDirPicked && canceled) return "⚠️ папка не выбрана!";
  isDirPicked = true;
  downloadDir = filePaths[0] || downloadDir;

  return [
    `📁 выбрана папка ${downloadDir}`,
    `${path.sep + path.dirname(downloadDir).split(path.sep).pop()}` +
      `${path.sep + path.basename(downloadDir)}`,
  ];
}

async function parseJson() {
  clipboard.writeText(fs.readFileSync("./scripts/for-browser.js", "utf8"));
  return "📑 код для devtools-консоли скопирован в буфер обмена";
}

async function openURL(_event, ...args) {
  const nickname = args[0];
  if (/^[a-zA-Z0-9][\w]{3,25}$/i.test(nickname)) {
    const clipsURL = `https://dashboard.twitch.tv/u/${nickname}/content/clips/channel`;
    setTimeout(() => shell.openExternal(clipsURL), 3000);

    return `🌐 открываем ${clipsURL}`;
  }
  return "⚠️ введите корректный никнейм!";
}

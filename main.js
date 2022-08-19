const PROJECTNAME = "Twitch Clip Downloader";
const electron = require("electron");
const process = require("process");
const path = require("path");
const fs = require("fs");
const { app, BrowserWindow, clipboard, dialog, ipcMain, shell } = electron;
const srcFolder = "src";

let win = null;
let isFilePicked = false;
let isDirPicked = false;
let downloadDir = null;
let jsonFile = null;

app.disableHardwareAcceleration();
app.whenReady().then(() => {
  ipcMain.handle("getProjectName", () => PROJECTNAME);
  ipcMain.handle("parseJson", handleParseJson);
  ipcMain.handle("openURL", handleOpenURL);
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
  win.loadFile(path.join(srcFolder, "index.html"));
  //win.webContents.openDevTools();
}

async function handleParseJson() {
  clipboard.writeText(fs.readFileSync("./scripts/for-browser.js", "utf8"));
  return { log: "📑 код для devtools-консоли скопирован в буфер обмена" };
}

async function handleOpenURL(_event, args) {
  const nickname = args.nickname;
  if (/^[a-zA-Z0-9][\w]{3,25}$/i.test(nickname)) {
    const clipsURL = `https://dashboard.twitch.tv/u/${nickname}/content/clips/channel`;
    setTimeout(() => shell.openExternal(clipsURL), 3000);

    return { log: `🌐 открываем ${clipsURL}` };
  }
  return { log: "⚠️ введите корректный никнейм!" };
}

async function handleFilePick() {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [{ name: "*.json", extensions: ["json"] }],
  });
  if (!isFilePicked && canceled) return { log: "⚠️ файл не выбран!" };
  isFilePicked = true;
  jsonFile = filePaths[0] || jsonFile;
  readyCheck();
  return {
    log: `📝 выбран файл ${jsonFile}`,
    fileName: path.basename(jsonFile),
  };
}

async function handleDirPick() {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });
  if (!isDirPicked && canceled) return { log: "⚠️ папка не выбрана!" };
  isDirPicked = true;
  downloadDir = filePaths[0] || downloadDir;
  readyCheck();
  return {
    log: `📁 выбрана папка ${downloadDir}`,
    dirName:
      `${path.sep + path.dirname(downloadDir).split(path.sep).pop()}` +
      `${path.sep + path.basename(downloadDir)}`,
  };
}

function readyCheck() {
  if (isFilePicked && isDirPicked) win.webContents.send("ready-to-download");
}

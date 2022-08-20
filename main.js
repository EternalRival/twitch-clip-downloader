const PROJECTNAME = "Twitch Clip Downloader";
const electron = require("electron");
const process = require("process");
const path = require("path");
const fs = require("fs");
/* const { getAllClips } = require("./lib/downloader.js"); */
const { app, BrowserWindow, clipboard, dialog, ipcMain, shell } = electron;
const electronDl = require("electron-dl");
const srcDir = "src";

let win = null;
let isFilePicked = false;
let isDirPicked = false;
let downloadDir = null;
let jsonFile = null;

electronDl();
app.disableHardwareAcceleration();
app.whenReady().then(() => {
  ipcMain.handle("btnClipboardClick", onBtnClipboardClick);
  ipcMain.handle("openURL", handleOpenURL);
  ipcMain.handle("dialog:pickFile", handleFilePick);
  ipcMain.handle("dialog:pickDir", handleDirPick);
  ipcMain.on("request-downloads", handleRequestDownload);

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
      preload: path.join(__dirname, srcDir, "preload.js"),
    },
  });
  win.loadFile(path.join(srcDir, "index.html"));
  win.webContents.on("did-finish-load", () =>
    win.webContents.send("sendProjectName", PROJECTNAME)
  );
  //win.webContents.openDevTools();
}

function onBtnClipboardClick() {
  clipboard.writeText(fs.readFileSync("./scripts/for-browser.js", "utf8"));
  return { log: "📑 код для devtools-консоли скопирован в буфер обмена" };
}

function handleOpenURL(_event, args) {
  const username = args.username?.trim();
  if (/^[a-zA-Z0-9][\w]{3,25}$/i.test(username)) {
    const clipsURL = `https://dashboard.twitch.tv/u/${username}/content/clips/channel`;
    setTimeout(() => shell.openExternal(clipsURL), 5000);
    let log = `🌐 открываем ${clipsURL}\n🌐 открой инструменты разработчика (F12).\n🌐 открой консоль и вставь код (Ctrl+V).\n🌐 запусти процесс прокрутки (Enter).\n🌐 не сворачивай страницу браузера во время автопрокрутки!`;
    return { log };
  }
  return { log: "⚠️ введите корректный никнейм!" };
}

async function handleFilePick() {
  let resolve = { log: null, fileName: null };
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [{ name: "*.json", extensions: ["json"] }],
  });
  if (!isFilePicked && canceled) {
    resolve.log = "⚠️ файл не выбран!";
  } else {
    jsonFile = filePaths[0] || jsonFile;
    isFilePicked = true;
    readyCheck();
    resolve = {
      log: `📝 выбран файл ${jsonFile}`,
      fileName: path.basename(jsonFile),
    };
  }
  return resolve;
}

async function handleDirPick() {
  let resolve = { log: null, dirName: null };
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });
  if (!isDirPicked && canceled) {
    resolve.log = "⚠️ папка не выбрана!";
  } else {
    downloadDir = filePaths[0] || downloadDir;
    isDirPicked = true;
    readyCheck();
    resolve = {
      log: `📁 выбрана папка ${downloadDir}`,
      dirName:
        `${path.sep + path.dirname(downloadDir).split(path.sep).pop()}` +
        `${path.sep + path.basename(downloadDir)}`,
    };
  }
  return resolve;
}

function readyCheck() {
  if (isFilePicked && isDirPicked) win.webContents.send("ready-to-download");
}

function handleRequestDownload() {
  /* const tjson = "W:\\@Inbox\\8888\\rival220822.json";
  const tdir = "W:\\@Inbox\\8888\\tdir";
  const list = JSON.parse(fs.readFileSync(tjson));
  let a = list[0];
  let b = list.at(-1);

  electronDl.download(win, a.URL, {
    directory: "W:\\@Inbox\\8888\\tdir",
    filename: a.title + ".mp4",
  });

  electronDl.download(win, b.URL, {
    directory: "W:\\@Inbox\\8888\\tdir",
    filename: b.title + ".mp4",
  }); */
}
/* 
function download(e) {
  return new Promise(resolve => {
    resolve(
      electronDl.download(win, e.URL, {
        directory: "W:\\@Inbox\\8888\\tdir",
        filename: e.title + ".mp4",
      })
    );
  });
} */
/* 
async function as1() {
  return 52;
}
async function as2() {}

let ass1, ass2, ass3, ass4, ass5, ass6;
(async () => {
  ass1 = as1();
  ass2 = as2();
  as1().then(v => {
    ass3 = v;
  });
  as2().then(v => {
    ass4 = v;
  });
  ass5 = await as1();
  ass6 = await as2();

  console.log(ass1);
  console.log(ass2);
  console.log(ass3);
  console.log(ass4);
  console.log(ass5);
  console.log(ass6);
})();
 */

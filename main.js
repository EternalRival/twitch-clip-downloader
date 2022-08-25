const PROJECTNAME = "ER Twitch Clip Downloader";
const electron = require("electron");
const process = require("process");
const path = require("path");
const fs = require("fs");
const { app, BrowserWindow, clipboard, dialog, ipcMain, shell } = electron;
const { fixName, getUniqueName } = require("./lib/handle-names");
const https = require("https");
const srcDir = "src";

let win = null;
let isFilePicked = false;
let isDirPicked = false;
let downloadDir = null || "W:\\@Inbox\\8888\\tdir";
let jsonFile = null || "W:\\@Inbox\\8888\\rival220822.json";
let streamer = "Streamer";

electron.nativeTheme.themeSource = "dark";
app.disableHardwareAcceleration();
app.whenReady().then(() => {
  ipcMain.handle("btnClipboardClick", onBtnClipboardClick);
  ipcMain.handle("openURL", handleOpenURL);
  ipcMain.handle("dialog:pickFile", handleFilePick);
  ipcMain.handle("dialog:pickDir", handleDirPick);
  ipcMain.once("request-downloads", handleRequestDownload);

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
    show: false,
    icon: path.join(__dirname, "assets/img/icon.ico"),
    backgroundColor: "#ccc",
    autoHideMenuBar: true,
    opacity: 0.975,

    webPreferences: {
      preload: path.join(__dirname, srcDir, "preload.js"),
    },
  });
  win.loadFile(path.join(srcDir, "index.html"));
  win.webContents.on("did-finish-load", () => {
    win.webContents.send("send-project-name", PROJECTNAME);
    /* win.webContents.send("ready-to-download"); */
  });
  win.once("ready-to-show", () => {
    win.show();
  });

  //win.webContents.openDevTools();
}

function onBtnClipboardClick() {
  clipboard.writeText(
    fs.readFileSync(path.join(__dirname + "/scripts/for-browser.js"), "utf8")
  );
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

function handleRequestDownload(_, { channel, size }) {
  let idNumber = 0;
  let pending = null;
  const log = str => win.webContents.send("downloader-message", str);
  const EXTENSION = ".mp4";
  let list = JSON.parse(fs.readFileSync(jsonFile)).reduce((p, c) => {
    let name = path.join(
      downloadDir,
      channel || streamer,
      fixName(c.game),
      fixName(c.author),
      fixName(c.title) + EXTENSION
    );

    return [...p, { name: getUniqueName(name, p), url: c.URL }];
  }, []);

  downloadAll(list);

  async function downloadAll(list) {
    pending = list.length;
    let chunked = chunking(list, size);
    for (let chunk of chunked) {
      await Promise.all(remap(chunk));
    }
    log("🏁 все загрузки завершены! можно закрыть программу");
    shell.openPath(downloadDir);
  }

  function chunking(list, size) {
    return list.reduce((p, c, i) => {
      return i % size == 0 ? [...p, [c]] : [...p.slice(0, -1), [...p.pop(), c]];
    }, []);
  }

  function remap(list) {
    return list.map(e => dl(e));
  }

  function dl(clip) {
    const args = { id: `id${idNumber++}`, name: path.basename(clip.name) };
    const dirName = path.dirname(clip.name);
    if (!fs.existsSync(dirName)) fs.mkdirSync(dirName, { recursive: true });
    return new Promise((resolve, reject) =>
      https.get(clip.url, res => {
        const stream = fs.createWriteStream(clip.name);
        stream
          .on("finish", () => {
            --pending;
            stream.close();
            win.webContents.send("download-finished", args);
            win.webContents.send("progress-counter", { counter: pending });
            resolve(clip.name);
          })
          .on("error", err => {
            reject(err.message);
          })
          .on("pipe", () => {
            win.webContents.send("download-started", args);
          });
        res.pipe(stream);
      })
    );
  }
}

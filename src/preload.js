const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("myAPI", {
  pickDir: () => ipcRenderer.invoke("dialog:pickDir"),
});

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("myAPI", {
  listen: (eventName, callback) => ipcRenderer.on(eventName, callback),
  invoke: (eventName, args) => ipcRenderer.invoke(eventName, args),
  send: (eventName, args) => ipcRenderer.send(eventName, args),
});


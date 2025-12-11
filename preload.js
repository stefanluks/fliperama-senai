const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  onConfigLoaded: (callback) => ipcRenderer.on("config-data", (event, data) => {
    callback(data);
  })
});

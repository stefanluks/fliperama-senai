const { app, BrowserWindow } = require("electron");
const path = require("path");
const fs = require("fs");

let splash;
let mainWindow;

function createSplash() {
  splash = new BrowserWindow({
    fullscreen: true,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true
  });

  splash.loadFile("./arquivos/interface/splash.html");
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    fullscreen: true,
    show: false,
    frame: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      devTools: true
    }
  });

  mainWindow.loadFile("./arquivos/interface/home.html");

  // Bloqueio de DevTools
  mainWindow.webContents.on("before-input-event", (event, input) => {
    // if (
    //   (input.control && input.shift && input.key.toLowerCase() === "i") ||
    //   (input.control && input.shift && input.key.toLowerCase() === "j") ||
    //   input.key === "F12"
    // ) {
    //   event.preventDefault();
    // }
  });
}

// Função que lê o JSON antes de abrir a home
function loadConfig() {
  return new Promise((resolve, reject) => {
    const filePath = path.join(__dirname, "config.json");

    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        console.log("Erro ao ler config.json:", err);
        return reject(err);
      }

      try {
        const json = JSON.parse(data);
        resolve(json);
      } catch (e) {
        console.log("JSON inválido:", e);
        reject(e);
      }
    });
  });
}
let configData = null; // armazenar o json

app.whenReady().then(async () => {
  createSplash();

  try {
    configData = await loadConfig(); // guardar o JSON
    await new Promise(resolve => setTimeout(resolve, 2000));
  } catch (error) {
    console.log("Erro carregando JSON:", error);
  }

  createMainWindow();

  mainWindow.webContents.once("did-finish-load", () => {
    // envia o json assim que a home carregar
    mainWindow.webContents.send("config-data", configData);
  });

  mainWindow.once("ready-to-show", () => {
    splash.close();
    mainWindow.show();
  });
});


app.on("window-all-closed", () => {
  app.quit();
});

const { app, BrowserWindow, Menu } = require("electron");
const shell = require("electron").shell;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({ width: 1000, height: 800 });

    // and load the index.html of the app.
    win.loadFile("main.html");

    // Open the DevTools.

    // win.webContents.openDevTools();

    // Emitted when the window is closed.
    win.on("closed", () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null;
    });

    let menu = Menu.buildFromTemplate([
        {
            label: "File",
            submenu: [
                {
                    label: "New File",
                    click() {
                        win.webContents.send("newFile");
                    }
                },
                {
                    label: "Save File",
                    click() {
                        win.webContents.send("saveFile");
                    }
                },
                {
                    type: "separator"
                },
                {
                    label: "Exit",
                    click() {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: "Edit",
            submenu: [
                {
                    label: "Undo",
                    accelerator: "CmdOrCtrl+Z",
                    click() {
                        win.webContents.send("Undo");
                    }
                }
            ]
        },
        {
            label: "View",
            submenu: [
                {
                    label: "Refresh",
                    accelerator: "CmdOrCtrl+R",
                    click() {
                        win.reload();
                    }
                }
            ]
        },
        {
            label: "Format",
            submenu: [
                {
                    label: "Colors",
                    submenu: [
                        {
                            label: "Black",
                            click() {
                                win.webContents.send("changeColor", {
                                    color: "black"
                                });
                            }
                        },
                        {
                            label: "Green",
                            click() {
                                win.webContents.send("changeColor", {
                                    color: "green"
                                });
                            }
                        },
                        {
                            label: "Yellow",
                            click() {
                                win.webContents.send("changeColor", {
                                    color: "yellow"
                                });
                            }
                        },
                        {
                            label: "Red",
                            click() {
                                win.webContents.send("changeColor", {
                                    color: "red"
                                });
                            }
                        },
                        {
                            label: "Blue",
                            click() {
                                win.webContents.send("changeColor", {
                                    color: "blue"
                                });
                            }
                        },
                        {
                            label: "Purple",
                            click() {
                                win.webContents.send("changeColor", {
                                    color: "purple"
                                });
                            }
                        },
                        {
                            label: "Pink",
                            click() {
                                win.webContents.send("changeColor", {
                                    color: "pink"
                                });
                            }
                        }
                    ]
                },
                {
                    label: "Mode",
                    submenu: [
                        {
                            label: "Line",
                            accelerator: "CmdOrCtrl+1",
                            click() {
                                win.webContents.send("changeMode", {
                                    mode: "line"
                                });
                            }
                        },
                        {
                            label: "Circle",
                            accelerator: "CmdOrCtrl+2",
                            click() {
                                win.webContents.send("changeMode", {
                                    mode: "circle"
                                });
                            }
                        },
                        {
                            label: "Square",
                            accelerator: "CmdOrCtrl+3",
                            click() {
                                win.webContents.send("changeMode", {
                                    mode: "square"
                                });
                            }
                        }
                    ]
                },
                {
                    label: "Size",
                    submenu: [
                        {
                            label: "Change Line Thickness",
                            submenu: [
                                {
                                    label: "10",
                                    click() {
                                        win.webContents.send(
                                            "changeLineThickness",
                                            {
                                                thickness: 10
                                            }
                                        );
                                    }
                                },
                                {
                                    label: "20 (default)",
                                    click() {
                                        win.webContents.send(
                                            "changeLineThickness",
                                            {
                                                thickness: 20
                                            }
                                        );
                                    }
                                },
                                {
                                    label: "30",
                                    click() {
                                        win.webContents.send(
                                            "changeLineThickness",
                                            {
                                                thickness: 30
                                            }
                                        );
                                    }
                                }
                            ]
                        },
                        {
                            label: "Change circle radius",
                            submenu: [
                                {
                                    label: "5 (default)",
                                    click() {
                                        win.webContents.send(
                                            "changeCircleRadius",
                                            {
                                                radius: 5
                                            }
                                        );
                                    }
                                },
                                {
                                    label: "10",
                                    click() {
                                        win.webContents.send(
                                            "changeCircleRadius",
                                            {
                                                radius: 10
                                            }
                                        );
                                    }
                                },
                                {
                                    label: "20",
                                    click() {
                                        win.webContents.send(
                                            "changeCircleRadius",
                                            {
                                                radius: 20
                                            }
                                        );
                                    }
                                }
                            ]
                        },
                        {
                            label: "Change square width",
                            submenu: [
                                {
                                    label: "10 (default)",
                                    click() {
                                        win.webContents.send(
                                            "changeSquareWidth",
                                            {
                                                width: 10
                                            }
                                        );
                                    }
                                },
                                {
                                    label: "20",
                                    click() {
                                        win.webContents.send(
                                            "changeSquareWidth",
                                            {
                                                width: 20
                                            }
                                        );
                                    }
                                },
                                {
                                    label: "30",
                                    click() {
                                        win.webContents.send(
                                            "changeSquareWidth",
                                            {
                                                width: 30
                                            }
                                        );
                                    }
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            label: "Dev",
            submenu: [
                {
                    label: "Developer Tools",
                    click() {
                        win.openDevTools();
                    }
                }
            ]
        }
    ]);

    Menu.setApplicationMenu(menu);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

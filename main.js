const app = require( 'electron' ).app;
const { BrowserWindow, ipcMain, screen } = require( 'electron' );
const isDev = process.argv.includes( '--dev' );
const path = require( 'path' );
const settings = require( 'electron-settings' );

console.log( __dirname );

const webPreferences = {
    webSecurity: false,
    nodeIntegration: true
};

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

async function createWindow() {
    const bounds = getBounds();

    // Create the browser window.
    mainWindow = new BrowserWindow( {
        ...bounds,
        frame: false,
        webPreferences
    } )

    if( bounds.isMaximized ) {
        mainWindow.maximize();
    }

    if( isDev ) {
        mainWindow.loadURL( 'http://localhost:4200' );
        // mainWindow.webContents.openDevTools()
    } else {
        mainWindow.loadFile( path.join( __dirname, 'dist/poe-prices/index.html' ) )
        // mainWindow.webContents.openDevTools()
    }

    [ 'resize', 'move', 'close' ].forEach( event => {
        mainWindow.on( event, () => {
            setBounds( mainWindow )
        } );
    } );

    // Emitted when the window is closed.
    mainWindow.on( 'closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    } )
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on( 'ready', createWindow )

// Quit when all windows are closed.
app.on( 'window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if( process.platform !== 'darwin' ) app.quit()
} )

app.on( 'activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if( mainWindow === null ) createWindow()
} )

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

function getBounds() {
    // Restore from appConfig
    if( settings.has( `windowState` ) ) {
        return settings.get( `windowState` );
    }

    // Default
    return {
        x: undefined,
        y: undefined,
        width: 1000,
        height: 800,
    };
}

function setBounds( window ) {
    let windowState;

    if( window.isMaximized() ) {
        windowState = getBounds();
    } else {
        windowState = window.getBounds();
    }

    windowState.isMaximized = window.isMaximized();

    settings.set( `windowState`, windowState );
}
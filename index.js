const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const fs = require('fs');
const { app, BrowserWindow } = require('electron');
const {ipcMain} = require('electron')
const path = require('path')
const url = require('url');
const { log } = require('console');
const fetch = require("node-fetch")
const { autoUpdater } = require('electron-updater');
const Store = require('electron-store');

function getPdf(args){
    console.log(args)
    for(let i = 0; i < args.directory.in.length; i++) {
        fs.readFile(args.directory.in[i] + '/' + args.directory.names[i], (err,data) => {
            if(err) throw err;
            createPdf(args, data, args.directory.names[i], args.directory.in[i])
        })
    }
}

function hexToRGB(h) {
    let r = 0, g = 0, b = 0;

    // 3 digits
    if (h.length == 4) {
        r = "0x" + h[1] + h[1];
        g = "0x" + h[2] + h[2];
        b = "0x" + h[3] + h[3];

        // 6 digits
    } else if (h.length == 7) {
        r = "0x" + h[1] + h[2];
        g = "0x" + h[3] + h[4];
        b = "0x" + h[5] + h[6];
    }

    return rgb(parseFloat(r/255),parseFloat(g/255),parseFloat(b/255));
}

async function createPdf(args, file, name, path) {

    const existingPdfBytes = file;
    const pdfDoc = await PDFDocument.load(existingPdfBytes, {ignoreEncryption: true})

    const pages = pdfDoc.getPages()
    const firstPage = pages[0]
    const { width, height } = firstPage.getSize()

    const fontSize = parseInt(args.font.size)

    if(args.box.toggle === true) {
        firstPage.drawRectangle({
            x: parseInt(args.font.x),
            y: parseInt(args.font.y),
            width: parseInt(args.box.w),
            height: parseInt(args.box.h),
            borderWidth: 1,
            borderColor: hexToRGB(args.box.color),
            color: rgb(1, 1, 1),
        });
    }
    firstPage.drawText(args.textId, {
        x: parseInt(args.font.x),
        y: parseInt(args.font.y),
        size: fontSize,
        //font: timesRomanFont,
        color: hexToRGB(args.font.color), //TODO COLOR CODE TO RGB ?
    })

    fs.promises.mkdir(path + '/output/', { recursive: true }).catch(console.error);
    try {
        fs.writeFileSync(path + '/output/' + name, await pdfDoc.save(), {flag: 'wx'});
    } catch (err){
        mainWindow.webContents.send('triggerClientModal', {'Error': err});
    }
    mainWindow.webContents.send('updateProgressBar', {'Written': 'File written'});
}

async function previewPDF(args) {
    

    let existingPdfBytes = fs.readFileSync(args.directory.in[0] + '/' + args.directory.names[0] , (err, data) => {
        if(err) throw err;

        return data
    })

    const pdfDoc = await PDFDocument.load(existingPdfBytes, {ignoreEncryption: true})

    const pages = pdfDoc.getPages()
    const firstPage = pages[0]
    const { width, height } = firstPage.getSize()

    const fontSize = parseInt(args.font.size)

    if(args.box.toggle === true) {
        firstPage.drawRectangle({
            x: parseInt(args.font.x),
            y: parseInt(args.font.y),
            width: parseInt(args.box.w),
            height: parseInt(args.box.h),
            borderWidth: 1,
            borderColor: hexToRGB(args.box.color),
            color: rgb(1, 1, 1),
        });
    }
    firstPage.drawText(args.textId, {
        x: parseInt(args.font.x),
        y: parseInt(args.font.y),
        size: fontSize,
        //font: timesRomanFont,
        color: hexToRGB(args.font.color), //TODO COLOR CODE TO RGB ?
    })

    //fs.writeFileSync('./out/' + name , await pdfDoc.save());
    const pdfDataUri = await pdfDoc.saveAsBase64({ dataUri: true });
    let response = JSON.stringify(pdfDataUri)
    return response
}


//LICENSE STUFF
async function validateLicenseByActivationToken(token) {
    const res = await fetch('https://api.keygen.sh/v1/accounts/4b46b331-a8c6-414b-88ec-e8a89d879008/licenses/actions/validate-key', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/vnd.api+json',
        'Accept': 'application/vnd.api+json'
    },
    body: JSON.stringify({
        meta: {
        key: token
        }
    })
    })
    
    const { meta } = await res.json()
    console.log(meta.valid);
    return meta.valid
}

//TODO AUTO VALIDATE MUSS UNBEDING NOCH VERBESSERT WERDEN !!!!

async function gateCreateWindowWithLicense(createWindow) {

    const store = new Store();
    
    //store.set('token', 123);

    let gateWindow = new BrowserWindow({
                resizable: false,
                frame: true,
                width: 420,
                height: 350,
                icon: `${__dirname}/assets/Logo.png`,
                autoHideMenuBar: true,
                webPreferences: {
                    preload: path.join(__dirname, 'gate.js'),
                    devTools: true,
                },
            })

    gateWindow.loadFile('loading.html')

    console.log(store.get('token'));
    let code = await validateLicenseByActivationToken(store.get('token'))
    if(code == true){
        gateWindow.close()
        createWindow()
    } else {
        gateWindow.loadFile('gate.html')
    }


    ipcMain.on('GATE_SUBMIT', async (_event, { token }) => {
        store.set('token', token);
        let code = await validateLicenseByActivationToken(store.get('token'))
        validate(code, createWindow, gateWindow);
    })
}

async function validate(code, createWindow, gateWindow){
        switch (code) {
            case true:
                // Close the license gate window
                gateWindow.close()

                // Create our main window
                createWindow()
                console.log('valid')
                break
            case false:
                // Close the license gate window
                console.log('false')
                //gateWindow.close()
                break
            case undefined:
                    // Close the license gate window
                    console.log('undefined')
                    //gateWindow.close()
                    break
            default:
                // Exit the application
                app.exit(1)

                break
        }
}

//MAIN APP STUFF

let mainWindow

function MainWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 600,
        minHeight: 600,
        minWidth: 1000,
        icon: `${__dirname}/assets/Logo.png`,
        title: "Slick-PDF500",
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
    });
    mainWindow.loadURL(`file://${__dirname}/main.html`);
    mainWindow.webContents.openDevTools();

    mainWindow.once('ready-to-show', () => {
        console.log('looking for update')
        autoUpdater.checkForUpdates();
    });

    if (process.platform === 'darwin') {
        app.dock.setIcon(path.join(__dirname, '/assets/Logo.png'));
    }

    setTimeout(() => {
        app.dock.bounce();
     }, 5000);

    mainWindow.on('blur', () => {
        const badgeString = app.dock.getBadge();
            if (badgeString === '') {
                app.dock.setBadge('1');
            } else {
                app.dock.setBadge((parseInt(badgeString) + 1).toString());
            }
    });

    //AUTOUPDATE

    autoUpdater.on('update-available', () => {
        mainWindow.webContents.send('update_available');
    });

    autoUpdater.on('update-downloaded', () => {
        mainWindow.webContents.send('update_downloaded');
    });
}

//Create MAIN WINDOW

app.whenReady().then(() => gateCreateWindowWithLicense(MainWindow));

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

// IPC STUFF

ipcMain.on("sign",function (event, arg) {
    getPdf(arg)
});

ipcMain.on('restart_app', () => {
    autoUpdater.quitAndInstall();
});

ipcMain.on('preview', async function(event, args){
    event.reply('asynchronous-reply', await previewPDF(args))
})
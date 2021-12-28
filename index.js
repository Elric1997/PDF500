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

function sniffDirec(data){
    console.log(data)
    let files = fs.readdirSync(data.directory.in)
    let outPath = data.directory.out;
    console.log(files)
    files.forEach(function (file) {
        fs.readFile(data.directory.in + '/' + file, (err,data) => {
            if(err) throw err;
            createPdf(data, file, outPath)
        })
    });
}

async function createPdf(document, name, out) {
    console.log(out);
    const existingPdfBytes = document;
    const pdfDoc = await PDFDocument.load(existingPdfBytes, {ignoreEncryption: true})
    //const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)

    //const page = pdfDoc.addPage()
    const pages = pdfDoc.getPages()
    const firstPage = pages[0]
    const { width, height } = firstPage.getSize()
    const fontSize = 8
    firstPage.drawRectangle({
        x: 5,
        y: height - 2.5 * fontSize,
        width: 85,
        height: 15,
        borderWidth: 1,
        borderColor: rgb(1,0,0),
        color: rgb(1,1,1),
    });

    firstPage.drawText('c/o ECHT-ID 157002', {
        x: 10,
        y: height - 2 * fontSize,
        size: fontSize,
        //font: timesRomanFont,
        color: rgb(0, 0, 0),
    })

    fs.promises.mkdir(out, { recursive: true }).catch(console.error);
    fs.writeFileSync(out + '/' + name , await pdfDoc.save(), { flag: 'wx' });
}

async function previewPDF(document, name, data) {
    

    let existingPdfBytes = fs.readFileSync(data.directory.in, (err, data) => {
        if(err) throw err;

        return data
    })

    const pdfDoc = await PDFDocument.load(existingPdfBytes, {ignoreEncryption: true})

    const pages = pdfDoc.getPages()
    const firstPage = pages[0]
    const { width, height } = firstPage.getSize()
    const fontSize = parseInt(data.font.size)
    firstPage.drawRectangle({
        x: parseInt(data.font.x),
        y: height - 2.5 * fontSize,
        width: parseInt(data.box.w),
        height: parseInt(data.box.h),
        borderWidth: 1,
        borderColor: rgb(1,0,0),
        color: rgb(1,1,1),
    });

    firstPage.drawText(data.textId, {
        x: parseInt(data.font.x),
        y: height - 2 * fontSize,
        size: fontSize,
        //font: timesRomanFont,
        color: rgb(0, 0, 0),
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
                height: 200,
                webPreferences: {
                    preload: path.join(__dirname, 'gate.js'),
                    devTools: true,
                },
            })
        

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

function MainWindow() {
    const mainWindow = new BrowserWindow({
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
    //mainWindow.webContents.openDevTools();

    mainWindow.once('ready-to-show', () => {
        console.log('looking for update')
        autoUpdater.checkForUpdates();
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
    console.log(arg)
    sniffDirec(arg);
});

ipcMain.on('restart_app', () => {
    autoUpdater.quitAndInstall();
});

ipcMain.on('preview', async function(event, args){
    event.reply('asynchronous-reply', await previewPDF('', '', args))
})


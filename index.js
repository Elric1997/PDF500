const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const fs = require('fs');
const { app, BrowserWindow } = require('electron');
const {ipcMain} = require('electron')
const path = require('path')
const url = require('url');
const { log } = require('console');
const fetch = require("node-fetch")
const { autoUpdater } = require('electron-updater');


function sniffDirec(){
    let files = fs.readdirSync(__dirname + '/in')
    files.forEach(function (file) {
        fs.readFile(__dirname + '/in/' + file, (err,data) => {
            if(err) throw err;
            createPdf(data, file)
        })

        //console.log(doc); 
        //createPdf(doc)
    });
}

async function createPdf(document, name) {
    //console.log(document);
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

    fs.writeFileSync('./out/' + name , await pdfDoc.save());
}

async function previewPDF(document, name, data) {
    

    let existingPdfBytes = fs.readFileSync(__dirname + '/in/Test_PDF.pdf', (err, data) => {
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
//LICENSE STUFF
async function validateLicenseByActivationToken(token) {
    console.log('TOKEN ', token)
    const licenseResponse = await fetch('https://api.keygen.sh/v1/accounts/4b46b331-a8c6-414b-88ec-e8a89d879008/me', { headers: { authorization: `Bearer ${token}` } })
    const licensePayload = await licenseResponse.json()
    if (licensePayload.errors) {
        console.log("licensePayload ",licensePayload.errors)
    }

    const validateResponse = await fetch(`https://api.keygen.sh/v1/accounts/4b46b331-a8c6-414b-88ec-e8a89d879008/licenses/${licensePayload.data.id}/actions/validate`, { method: 'POST', headers: { authorization: `Bearer ${token}` } })
    const validatePayload = await validateResponse.json()
    if (validatePayload.errors) {
        console.log("validatePayload ", validatePayload.errors)
    }

    return validatePayload.meta.constant
}

async function gateCreateWindowWithLicense(createWindow) {
    const gateWindow = new BrowserWindow({
        resizable: false,
        frame: false,
        width: 420,
        height: 200,
        webPreferences: {
            preload: path.join(__dirname, 'gate.js'),
            devTools: true,
        },
    })

    gateWindow.loadFile('gate.html')


    ipcMain.on('GATE_SUBMIT', async (_event, { token }) => {
        const code = await validateLicenseByActivationToken(token)

        switch (code) {
            case 'VALID':
                // Close the license gate window
                gateWindow.close()

                // Create our main window
                createWindow()
                console.log('valid')
                break
            case 'EXPIRED':
                // Close the license gate window
                console.log('expired')
                gateWindow.close()
            default:
                // Exit the application
                app.exit(1)

                break
        }
    })
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
    //sniffDirec();
});

ipcMain.on('restart_app', () => {
    autoUpdater.quitAndInstall();
});

ipcMain.on('preview', async function(event, args){
    event.reply('asynchronous-reply', await previewPDF('', '', args))
})


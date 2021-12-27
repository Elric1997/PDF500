const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const fs = require('fs');
const { app, BrowserWindow } = require('electron');
const {ipcMain} = require('electron')
const path = require('path')
const url = require('url');
const { log } = require('console');

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
    

    existingPdfBytes = fs.readFileSync(__dirname + '/in/Test_PDF.pdf', (err, data) => {
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


app.on("ready", () => {
    const mainWindow = new BrowserWindow({
        width: 1000,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
    });
    mainWindow.loadURL(`file://${__dirname}/index.html`);
    mainWindow.webContents.openDevTools();
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

ipcMain.on("sign",function (event, arg) {
    console.log(arg)
    //sniffDirec();
});

ipcMain.on('preview', async function(event, args){
    event.reply('asynchronous-reply', await previewPDF('', '', args))
})


"use strict"

const numberPattern = /^[0-9]*$/;
const pdfNumberPattern = /^(.*?)/;
const errorText = "Bitte nur Zahlen eingeben";

const validInputPdfNumber = () => {
    const inputPdfNumber = document.getElementById("id");
    let errorMessagePdfNumber = document.getElementById('pdf-text');

    if (inputPdfNumber.value === "")
    {
        errorMessagePdfNumber.innerHTML = "Bitte eine PDF-Nummer eingeben";
        inputPdfNumber.classList.add("invalid");
    }
    else if (inputPdfNumber.value.match(pdfNumberPattern))
    {
        errorMessagePdfNumber.innerHTML = "";
        inputPdfNumber.classList.remove("invalid");
    }
    else
    {
        errorMessagePdfNumber.innerHTML = errorText;
        inputPdfNumber.classList.add("invalid")
    }
}

const validInputFontCoordinateX = () => {
    const inputFontCoordinateX = document.getElementById("font-x");
    let errorMessageFontX = document.getElementById('font-x-text');

    if (inputFontCoordinateX.value.match(numberPattern))
    {
        errorMessageFontX.innerHTML = "";
        inputFontCoordinateX.classList.remove("invalid");
    }
    else
    {
        errorMessageFontX.innerHTML = errorText;
        inputFontCoordinateX.classList.add("invalid")
    }
}

const validInputFontCoordinateY = () => {
    const inputFontCoordinateY = document.getElementById("font-y");
    let errorMessageFontY = document.getElementById('font-y-text');

    if (inputFontCoordinateY.value.match(numberPattern))
    {
        errorMessageFontY.innerHTML = "";
        inputFontCoordinateY.classList.remove("invalid");
    }
    else
    {
        errorMessageFontY.innerHTML = errorText;
        inputFontCoordinateY.classList.add("invalid")
    }
}

const validInputFontSize = () => {
    const inputFontSize = document.getElementById("font-size");
    let errorMessageSize = document.getElementById('font-size-text');

    if (inputFontSize.value.match(numberPattern))
    {
        errorMessageSize.innerHTML = "";
        inputFontSize.classList.remove("invalid");
    }
    else
    {
        errorMessageSize.innerHTML = errorText;
        inputFontSize.classList.add("invalid")
    }
}

const validInputBoxHeight = () => {
    const inputBoxHeight = document.getElementById("box-h");
    let errorMessageBoxHeight = document.getElementById('font-box-h-text');

    if (inputBoxHeight.value.match(numberPattern))
    {
        errorMessageBoxHeight.innerHTML = "";
        inputBoxHeight.classList.remove("invalid");
    }
    else
    {
        errorMessageBoxHeight.innerHTML = errorText;
        inputBoxHeight.classList.add("invalid")
    }
}

const validInputBoxWidth = () => {
    const inputBoxWidth= document.getElementById("box-w");
    let errorMessageBoxWidth = document.getElementById('font-box-w-text');

    if (inputBoxWidth.value.match(numberPattern))
    {
        errorMessageBoxWidth.innerHTML = "";
        inputBoxWidth.classList.remove("invalid");
    }
    else
    {
        errorMessageBoxWidth.innerHTML = "Bitte nur Zahlen eingeben";
        inputBoxWidth.classList.add("invalid")
    }
}

/**
 * Funktion zur Überprüfung, ob die Checkbox geklickt wurde oder nicht
 * Initial wurde "disabled" in den Eingabefeldern gesetzt
*/
const detectCheckboxState = () => {
    const checkbox = document.getElementById("box-toggle");
    const boxHeight = document.getElementById("box-h");
    const boxWidth = document.getElementById("box-w");
    const boxColor = document.getElementById("box-color");

    if (checkbox.checked) {
        boxHeight.disabled = false;
        boxWidth.disabled = false;
        boxColor.disabled = false;
    }
    else {
        boxHeight.disabled = true;
        boxWidth.disabled = true;
        boxColor.disabled = true;
    }
}

/**
 * TODO: 1. Ausgabe des Farbcodes kopierbar machen
 * TODO: 2. eignen Farbe einfügen + Anpassung in der Farbauswahl (Farbfeld)
 */
const changeBoxColorCode = () => {
    const colorField = document.getElementById("box-color");
    const colorHexCode = document.getElementById("color-box-code");

    colorHexCode.innerHTML = colorField.value.toUpperCase();
}

const changeFontColorCode = () => {
    const colorField = document.getElementById("font-color");
    const colorHexCode = document.getElementById("color-font-code");

    colorHexCode.innerHTML = colorField.value.toUpperCase();
}

const closeModal = () => {
    document.getElementById("triggerClientModal").style.display = "none";
}
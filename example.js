"use strict"

/** TODO: Validierung zwecks Code-Stil überarbeiten */
const validation = () => {
    const inputFontCoordinateX = document.getElementById("font-x");
    const inputFontCoordinateY = document.getElementById("font-y");
    const inputFontSize = document.getElementById("font-size");
    const inputBoxHeight = document.getElementById("box-h");
    const inputBoxWidth= document.getElementById("box-w");

    let errorMessageFontX = document.getElementById('font-x-text');
    let errorMessageFontY = document.getElementById('font-y-text');
    let errorMessageSize = document.getElementById('font-size-text');
    let errorMessageBoxHeight = document.getElementById('font-box-h-text');
    let errorMessageBoxWidth = document.getElementById('font-box-w-text');
    const pattern = /^[0-9]*$/;

    if (inputFontCoordinateX.value.match(pattern))
    {
        errorMessageFontX.innerHTML = "";
        inputFontCoordinateX.classList.remove("invalid");
    }
    else
    {
        errorMessageFontX.innerHTML = "Bitte nur Zahlen eingeben";
        inputFontCoordinateX.classList.add("invalid")
    }

    if (inputFontCoordinateY.value.match(pattern))
    {
        errorMessageFontY.innerHTML = "";
        inputFontCoordinateY.classList.remove("invalid");
    }
    else
    {
        errorMessageFontY.innerHTML = "Bitte nur Zahlen eingeben";
        inputFontCoordinateY.classList.add("invalid")
    }

    if (inputFontSize.value.match(pattern))
    {
        errorMessageSize.innerHTML = "";
        inputFontSize.classList.remove("invalid");
    }
    else
    {
        errorMessageSize.innerHTML = "Bitte nur Zahlen eingeben";
        inputFontSize.classList.add("invalid")
    }

    if (inputBoxHeight.value.match(pattern))
    {
        errorMessageBoxHeight.innerHTML = "";
        inputBoxHeight.classList.remove("invalid");
    }
    else
    {
        errorMessageBoxHeight.innerHTML = "Bitte nur Zahlen eingeben";
        inputBoxHeight.classList.add("invalid")
    }

    if (inputBoxWidth.value.match(pattern))
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
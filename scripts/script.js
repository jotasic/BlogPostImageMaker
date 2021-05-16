const imageWidth      = document.getElementById('imageWidth');
const imageHeight     = document.getElementById('imageHeight');
const imageColor      = document.getElementById('imageColor');
const imageColorLabel = document.getElementById('imageColorLabel');
const imageColorPasteButton = document.getElementById('imageColorPasteButton');

const contents       = document.getElementById('textContents');
const fontSize       = document.getElementById('fontSize');
const fontColor      = document.getElementById('fontColor');
const fontColorLabel = document.getElementById('fontColorLabel');
const fontColorPasteButton = document.getElementById('fontColorPasteButton');


// 값이 변경시 updateValue 함수 호출 하도록 설정
imageWidth.addEventListener("change", updateValue);
imageHeight.addEventListener("change", updateValue);
imageColor.addEventListener("change", updateValue);
contents.addEventListener("change", updateValue);
fontSize.addEventListener("change", updateValue);
fontColor.addEventListener("change", updateValue);

fontColorPasteButton.addEventListener('click', pasteColorToBackground.bind(event, fontColor), false);
imageColorPasteButton.addEventListener('click', pasteColorToBackground.bind(event, imageColor), false);

// Web Storage
const options = []
options.push(imageWidth);
options.push(imageHeight);
options.push(imageColor);
options.push(contents);
options.push(fontSize);
options.push(fontColor);


function updateValue(e) {
    drawCanvas();
    showColorValue();
    updateData();
}


// 페이지가 로드시 실행
window.onload = function () {
    loadData();
    drawCanvas();
    showColorValue();
    
}


const snackbar = document.getElementById('snackbar'); 
let isToastShown = false;


function showSnackbarMessage(message) {
    if(snackbar.classList.contains('show')) {
        return;
    }

    snackbar.innerText = message
    snackbar.classList.add('show');
    setTimeout(function () {
        snackbar.classList.remove('show');
    }, 2700);
}


//https://stackoverflow.com/questions/39193878/javascript-execcommandpaste-not-working/56034438#56034438
//https://www.codegrepper.com/code-examples/javascript/javascript+pass+parameter+to+named+function+event+handler
// https://stackoverflow.com/questions/10000083/javascript-event-handler-with-parameters
function pasteColorToBackground(target, event) {
    navigator.clipboard.readText().then(function(text) { 
        if(isVaildColor(text)) {
        target.value = "#" + text;
        updateValue(NaN);
        }
        else {
            showSnackbarMessage("유효하지 않은 클립보드 입니다. (예시:FFFF00)");
        }
    });
}

function isVaildColor(text) {
    if(text.length == 6) {
        for(let i = 0 ; i < text.length ; i++) {
            if(!((text[i] >= 'a' && text[i] <= 'z') ||
               (text[i] >= 'A' || text[i] <= 'Z') ||
               (text[i] >= '0' || text[i] <= '9'))) {
                   return false;
               }
        }
        return true;
    }
    else {
        return false;
    }

}

function showColorValue() {
    imageColorLabel.innerText = imageColor.value;
    fontColorLabel.innerText  = fontColor.value;
}

function updateData() {
    options.forEach((item, index, array) => localStorage.setItem(item.id, item.value));
}

function loadData() {
    options.forEach((item, index, array) => item.value = localStorage.getItem(item.id));
}

function drawCanvas() {
    var w = imageWidth.value;
    var h = imageHeight.value;
    var c = contents.value;

    // Image View 설정
    // id가 imagePreview SVG로 변환한다.
    var imagePreview = SVG("#imagePreview");
    imagePreview.size(w, h);

    //Text Style 설정
    // id가 imageBackground SVG로 변환한다.
    var imageBackground = SVG("#imageBackground");
    imageBackground.fill(imageColor.value);

    // font 설정
    // id가 imageText를 SVG로 변환한다.
    var imageText = SVG("#imageText");
    imageText.font("weight", "bold");
    imageText.font("size", fontSize.value);
    imageText.fill(fontColor.value);


    fillTextLine(imageText, c, w / 2, h / 2);

}

function fillTextLine(el, text, x, y) {

    var lines     = text.split("\n");
    var lineCount = lines.length;
    var fontSize  = el.font("size");

    // 여려줄일 시, 시작(맨 첫줄) y좌표값을 조절 하는 작업
    var offset = (lineCount - 1) * fontSize / 2;

    el.text(function (add) {
        for (var i = 0; i < lineCount; i++)
            add.tspan(lines[i]).ax(x).ay(y + i * fontSize - offset);
    });
}



//https://stackoverflow.com/questions/28226677/save-inline-svg-as-jpeg-png-svg
function downloadImage() {
    convertImageAfterAction(function(canvas) {
        var imgURI = canvas
            .toDataURL('image/png')
            .replace('image/png', 'image/octet-stream');

            triggerDownload(imgURI);
    });
}

function triggerDownload(imgURI) {
    var evt = new MouseEvent('click', {
        view      : window,
        bubbles   : false,
        cancelable: true
    });

    var a = document.createElement('a');
    a.setAttribute('download', 'MY_COOL_IMAGE.png');
    a.setAttribute('href', imgURI);
    a.setAttribute('target', '_blank');

    a.dispatchEvent(evt);
}


function copyImageToClipboard() {
    convertImageAfterAction(function (canvas) {
        canvas.toBlob(function (blob) {
            const item = new ClipboardItem({ "image/png": blob });
            navigator.clipboard.write([item]);
        });
    });
}


function convertImageAfterAction(callback) {
    var svg    = document.getElementById("imagePreview");
    var canvas = document.createElement("canvas");

    canvas.width  = svg.getBoundingClientRect().width;
    canvas.height = svg.getBoundingClientRect().height;

    var ctx = canvas.getContext('2d');

    var data   = (new XMLSerializer()).serializeToString(svg);
    var DOMURL = window.URL || window.webkitURL || window;

    var img     = new Image();
    var svgBlob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
    var url     = DOMURL.createObjectURL(svgBlob);

    img.onload = function () {
        ctx.drawImage(img, 0, 0);
        DOMURL.revokeObjectURL(url);
        
        callback(canvas);
    };
    img.src = url;
}
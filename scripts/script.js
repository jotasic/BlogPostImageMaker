const imageWidth      = document.getElementById('imageWidth');
const imageHeight     = document.getElementById('imageHeight');
const imageColor      = document.getElementById('imageColor');
const imageColorLabel = document.getElementById('imageColorLabel');

const contents       = document.getElementById('textContents');
const fontSize       = document.getElementById('fontSize');
const fontColor      = document.getElementById('fontColor');
const fontColorLabel = document.getElementById('fontColorLabel');


// 값이 변경시 updateValue 함수 호출 하도록 설정
imageWidth.addEventListener("change", updateValue);
imageHeight.addEventListener("change", updateValue);
imageColor.addEventListener("change", updateValue);
contents.addEventListener("change", updateValue);
fontSize.addEventListener("change", updateValue);
fontColor.addEventListener("change", updateValue);


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
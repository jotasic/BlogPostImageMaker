import * as svgjs from '@svgdotjs/svg.js';

const imageWidth = document.getElementById('imageWidth') as HTMLInputElement;
const imageHeight = document.getElementById('imageHeight') as HTMLInputElement;
const imageColor = document.getElementById('imageColor') as HTMLInputElement;
const imageColorLabel = document.getElementById(
  'imageColorLabel'
) as HTMLLabelElement;
const imageColorPasteButton = document.getElementById('imageColorPasteButton');
const contents = document.getElementById('textContents') as HTMLInputElement;
const fontSize = document.getElementById('fontSize') as HTMLInputElement;
const fontColor = document.getElementById('fontColor') as HTMLInputElement;

const fontColorLabel = document.getElementById(
  'fontColorLabel'
) as HTMLLabelElement;
const fontColorPasteButton = document.getElementById(
  'fontColorPasteButton'
) as HTMLButtonElement;

const downloadImageButton = document.getElementById(
  'downloadImageButton'
) as HTMLButtonElement;
const copyImageToClipboardButton = document.getElementById(
  'copyImageToClipboardButton'
) as HTMLButtonElement;
const snackbar = document.getElementById('snackbar');

// Web Storage
const options = [
  imageWidth,
  imageHeight,
  imageColor,
  contents,
  fontSize,
  fontColor,
];

function updateValue(e: any) {
  drawCanvas();
  showColorValue();
  updateData();
}

// 페이지가 로드시 실행
window.onload = function () {
  loadData();
  drawCanvas();
  showColorValue();
};

setEventListener();

function setEventListener() {
  // 값이 변경시 updateValue 함수 호출 하도록 설정
  imageWidth.addEventListener('change', updateValue);
  imageHeight.addEventListener('change', updateValue);
  imageColor.addEventListener('change', updateValue);
  contents.addEventListener('change', updateValue);
  fontSize.addEventListener('change', updateValue);
  fontColor.addEventListener('change', updateValue);
  downloadImageButton.addEventListener('click', downloadImage);
  copyImageToClipboardButton.addEventListener('click', copyImageToClipboard);
  fontColorPasteButton.addEventListener(
    'click',
    pasteColorToBackground.bind(event, fontColor),
    false
  );
  imageColorPasteButton.addEventListener(
    'click',
    pasteColorToBackground.bind(event, imageColor),
    false
  );
}

//https://stackoverflow.com/questions/39193878/javascript-execcommandpaste-not-working/56034438#56034438
//https://www.codegrepper.com/code-examples/javascript/javascript+pass+parameter+to+named+function+event+handler
// https://stackoverflow.com/questions/10000083/javascript-event-handler-with-parameters
function pasteColorToBackground(target: any, event: any) {
  navigator.clipboard.readText().then(text => {
    if (isValidColor(text)) {
      target.value = text[0] !== '#' ? '#' + text : text;
      updateValue(NaN);
    } else {
      showSnackbarMessage(
        '유효하지 않은 클립보드 입니다. (예시:FFFF00 or #FFFF00)'
      );
    }
  });
}

function isValidColor(text: string): boolean {
  const regex = '^#?[a-fA-F0-9]{6}$';
  return text.match(regex) !== null;
}

function showColorValue() {
  imageColorLabel.innerText = imageColor.value;
  fontColorLabel.innerText = fontColor.value;
}

function updateData() {
  options.forEach(item => localStorage.setItem(item.id, item.value));
}

function loadData() {
  options.forEach(item => (item.value = localStorage.getItem(item.id)));
}

function drawCanvas() {
  const w: number = parseInt(imageWidth.value);
  const h: number = parseInt(imageHeight.value);
  const c = contents.value;

  // Image View 설정
  // id가 imagePreview SVG로 변환한다.
  const imagePreview = svgjs.SVG('#imagePreview');
  imagePreview.size(w, h);

  //Text Style 설정
  // id가 imageBackground SVG로 변환한다.
  const imageBackground = svgjs.SVG('#imageBackground');
  imageBackground.fill(imageColor.value);

  // font 설정
  // id가 imageText를 SVG로 변환한다.
  const imageText = svgjs.SVG('#imageText');
  const fontData: svgjs.FontData = {
    weight: 'bold',
    size: fontSize.value,
  };
  imageText.font(fontData);
  imageText.fill(fontColor.value);

  drawTextToCanvas(imageText, c, w / 2, h / 2);
}

function drawTextToCanvas(el: any, text: string, x: number, y: number) {
  const lines = text.split('\n');
  const lineCount = lines.length;
  const fontSize = parseInt(el.font('size'));

  // 여려줄일 시, 시작(맨 첫줄) y좌표값을 조절 하는 작업
  const offset = ((lineCount - 1) * fontSize) / 2;

  el.text((add: svgjs.Text) => {
    lines.forEach((element, index) => {
      add
        .tspan(element)
        .ax(x.toString())
        .ay((y + index * fontSize - offset).toString());
    });
  });
}

//https://stackoverflow.com/questions/28226677/save-inline-svg-as-jpeg-png-svg
function downloadImage() {
  convertImageAfterAction((canvas: HTMLCanvasElement) => {
    const imgURI = canvas
      .toDataURL('image/png')
      .replace('image/png', 'image/octet-stream');
    triggerDownload(imgURI);
  });
}

function triggerDownload(imgURI: string) {
  const evt = new MouseEvent('click', {
    view: window,
    bubbles: false,
    cancelable: true,
  });

  const a = document.createElement('a');
  a.setAttribute('download', 'image.png');
  a.setAttribute('href', imgURI);
  a.setAttribute('target', '_blank');
  a.dispatchEvent(evt);
}

function copyImageToClipboard() {
  convertImageAfterAction((canvas: HTMLCanvasElement) => {
    canvas.toBlob((blob: any) => {
      const item = new ClipboardItem({'image/png': blob});
      navigator.clipboard.write([item]);
      showSnackbarMessage('성공적으로 이미지 복사를 하였습니다.');
    });
  });
}

function convertImageAfterAction(callback: Function) {
  const svg = document.getElementById('imagePreview');
  const canvas = document.createElement('canvas');
  canvas.width = svg.getBoundingClientRect().width;
  canvas.height = svg.getBoundingClientRect().height;

  const ctx = canvas.getContext('2d');
  const data = new XMLSerializer().serializeToString(svg);
  const domUrl = window.URL || window.webkitURL;
  const img = new Image();
  const svgBlob = new Blob([data], {type: 'image/svg+xml;charset=utf-8'});
  const url = domUrl.createObjectURL(svgBlob);

  img.onload = () => {
    ctx.drawImage(img, 0, 0);
    domUrl.revokeObjectURL(url);
    callback(canvas);
  };
  img.src = url;
}

function showSnackbarMessage(message: string) {
  if (snackbar.classList.contains('show')) {
    return;
  }

  snackbar.innerText = message;
  snackbar.classList.add('show');
  setTimeout(() => {
    snackbar.classList.remove('show');
  }, 2700);
}

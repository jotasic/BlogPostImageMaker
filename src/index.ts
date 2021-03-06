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
const optionElements = [
  imageWidth,
  imageHeight,
  imageColor,
  contents,
  fontSize,
  fontColor,
];

// 페이지가 로드시 실행
window.onload = () => {
  setEventListener();
  loadLocalStorageData();
  drawCanvas();
  updateColorTextValue();
};

const setEventListener = () => {
  // 값이 변경시 updateValue 함수 호출 하도록 설정
  imageWidth.addEventListener('change', valueChanged);
  imageHeight.addEventListener('change', valueChanged);
  imageColor.addEventListener('change', valueChanged);
  contents.addEventListener('change', valueChanged);
  fontSize.addEventListener('change', valueChanged);
  fontColor.addEventListener('change', valueChanged);
  downloadImageButton.addEventListener('click', downloadImage);
  copyImageToClipboardButton.addEventListener('click', copyImageToClipboard);
  fontColorPasteButton.addEventListener(
    'click',
    pasteColorToInputElement.bind(event, fontColor),
    false
  );
  imageColorPasteButton.addEventListener(
    'click',
    pasteColorToInputElement.bind(event, imageColor),
    false
  );
};

const loadLocalStorageData = () => {
  for (const el of optionElements) {
    el.value = localStorage.getItem(el.id);
  }
};

const updateColorTextValue = () => {
  imageColorLabel.innerText = imageColor.value;
  fontColorLabel.innerText = fontColor.value;
};

const drawCanvas = (() => {
  // id가 imagePreview SVG로 변환한다.
  const imagePreview = svgjs.SVG('#imagePreview');
  // id가 imageBackground SVG로 변환한다.
  const imageBackground = svgjs.SVG('#imageBackground');
  // id가 imageText를 SVG로 변환한다.
  const imageText = svgjs.SVG('#imageText');

  return () => {
    const w: number = parseInt(imageWidth.value);
    const h: number = parseInt(imageHeight.value);
    const content = contents.value;

    // Image View 설정
    imagePreview.size(w, h);

    //Text Style 설정
    imageBackground.fill(imageColor.value);

    // font 설정
    const fontData: svgjs.FontData = {
      weight: 'bold',
      size: fontSize.value,
    };
    imageText.font(fontData);
    imageText.fill(fontColor.value);

    drawTextToCanvas(imageText, {content, x: w / 2, y: h / 2});
  };
})();

const valueChanged = () => {
  drawCanvas();
  updateColorTextValue();
  updateLocalStorageData();
};

const updateLocalStorageData = () => {
  for (const el of optionElements) {
    localStorage.setItem(el.id, el.value);
  }
};

//https://stackoverflow.com/questions/39193878/javascript-execcommandpaste-not-working/56034438#56034438
//https://www.codegrepper.com/code-examples/javascript/javascript+pass+parameter+to+named+function+event+handler
// https://stackoverflow.com/questions/10000083/javascript-event-handler-with-parameters
const pasteColorToInputElement = (target: HTMLInputElement) => {
  navigator.clipboard.readText().then((text: string) => {
    text = text.trim();

    if (isValidColor(text)) {
      target.value = text[0] !== '#' ? '#' + text : text;
      valueChanged();
    } else {
      showSnackbarMessage(
        '유효하지 않은 클립보드 입니다. (예시:FFFF00 or #FFFF00)'
      );
    }
  });
};

const isValidColor = (text: string): boolean => {
  const regex = '^#?[a-fA-F0-9]{6}$';
  return text.match(regex) !== null;
};

const drawTextToCanvas = (
  el: any,
  drawInfo: {content: string; x: number; y: number}
) => {
  const lines = drawInfo.content.split('\n');
  const fontSize = parseInt(el.font('size'));

  // 여려줄일 시, 시작(맨 첫줄) y좌표값을 조절 하는 작업
  const offset = ((lines.length - 1) * fontSize) / 2;

  el.text((text: svgjs.Text) => {
    for (const [index, line] of lines.entries()) {
      text
        .tspan(line)
        .ax(drawInfo.x.toString())
        .ay((drawInfo.y + index * fontSize - offset).toString());
    }
  });
};

//https://stackoverflow.com/questions/28226677/save-inline-svg-as-jpeg-png-svg
const downloadImage = async () => {
  const canvas = await svgToCanvas();
  const imgURI = canvas
    .toDataURL('image/png')
    .replace('image/png', 'image/octet-stream');

  const event = new MouseEvent('click', {
    view: window,
    bubbles: false,
    cancelable: true,
  });

  const a = document.createElement('a');
  a.setAttribute('download', 'image.png');
  a.setAttribute('href', imgURI);
  a.setAttribute('target', '_blank');
  a.dispatchEvent(event);
};

const copyImageToClipboard = async () => {
  const canvas = await svgToCanvas();
  canvas.toBlob((blob: any) => {
    const item = new ClipboardItem({'image/png': blob});
    navigator.clipboard.write([item]);
    showSnackbarMessage('성공적으로 이미지 복사를 하였습니다.');
  });
};

const svgToCanvas = (() => {
  const svg = document.getElementById('imagePreview');

  return async (): Promise<HTMLCanvasElement> => {
    const canvas = document.createElement('canvas');
    canvas.width = svg.getBoundingClientRect().width;
    canvas.height = svg.getBoundingClientRect().height;

    const context = canvas.getContext('2d');
    const data = new XMLSerializer().serializeToString(svg);
    const domUrl = window.URL || window.webkitURL;
    const image = new Image();
    const svgBlob = new Blob([data], {type: 'image/svg+xml;charset=utf-8'});
    const url = domUrl.createObjectURL(svgBlob);

    // https://medium.com/dailyjs/image-loading-with-image-decode-b03652e7d2d2
    image.src = url;
    await image.decode().catch(() => {
      throw new Error('Could not load/decode big image.');
    });

    context.drawImage(image, 0, 0);
    domUrl.revokeObjectURL(url);
    return canvas;
  };
})();

const showSnackbarMessage = (message: string) => {
  if (snackbar.classList.contains('show')) {
    return;
  }
  snackbar.innerText = message;
  snackbar.classList.add('show');
  setTimeout(() => {
    snackbar.classList.remove('show');
  }, 2700);
};

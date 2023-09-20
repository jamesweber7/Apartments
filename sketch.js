/* Get the documentElement (<html>) to display the page in fullscreen */
var elem = document.documentElement;

let windowIsFullscreen = false;

const NUMBER_OF_ANIMATIONS = 4;
let windowAnimations = [];

const WINDOW_WIDTH = 40;
const WINDOW_HEIGHT = 30;
const GAP_WIDTH = 10;
const GAP_HEIGHT = 25;

var sizeScale = 0.75;
const MIN_SIZE_SCALE = 0.35;
const MAX_SIZE_SCALE = 1.5;

let windWidth;
let windHeight;
let gapWidth;
let gapHeight;
let xIncrement;
let yIncrement;
let windows;
let startX;
let startY;
let endX, endY;
let windowTypeX;
let windowTypeY;

const LINE_HEIGHT = 5;

let windowImage;

let pixelatedCharacters;
let specialCharIndexes;
let charStack;

const SLIDER_WIDTH = 80;

function preload() {
  // windowImage = loadImage("assets/palm-trees-sky.jpg");
  for (let i = 0; i < NUMBER_OF_ANIMATIONS; i++) {
    windowAnimations[i] = new WindowAnimation(i);
  }

  pixelatedCharacters = loadJSON("pixelatedCharacters.json");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  if (document.getElementsByTagName('popup').length) {
    const popup = document.getElementsByTagName('popup')[0];
    document.getElementById('defaultCanvas0').after(popup);
    document.getElementById('get-started-btn').onclick = () => {popup.remove();}
  }
  imageMode(CENTER);

  specialCharIndexes = [];
  for (let key in pixelatedCharacters) {
    if (!/[A-Z0-9]/.test(pixelatedCharacters[key].char))
      specialCharIndexes[pixelatedCharacters[key].char] = key;
  }

  initializeValues();
}

function initializeValues() {
  windWidth = WINDOW_WIDTH * sizeScale;
  windHeight = WINDOW_HEIGHT * sizeScale;
  gapWidth = GAP_WIDTH * sizeScale;
  gapHeight = GAP_HEIGHT * sizeScale;
  xIncrement = windWidth + gapWidth;
  yIncrement = windHeight + gapHeight;
  startX = windWidth;
  startY = windHeight;
  windowTypeX = 0;
  windowTypeY = 0;

  const NUM_ROWS = Math.floor(height/yIncrement - 1);
  const NUM_COLUMNS = Math.floor((width - SLIDER_WIDTH) /xIncrement - 1);
  windows = Array(NUM_ROWS);
  for (let i = 0; i < NUM_ROWS; i++) {
    windows[i] = Array(NUM_COLUMNS);
    for (let j = 0; j < NUM_COLUMNS; j++) {
      windows[i][j] = new Window(startX + j*xIncrement, startY + i*yIncrement);
    }
  }
  endX = startX + (width/xIncrement - 2)*xIncrement;
  endY = startY + (height/yIncrement - 1)*yIncrement;

  // loadWindowsToImage(windowImage, 255);
  charStack = [];
}

function draw() {
  background(0);
  
  for (let i = 0; i < windows.length; i++) {
    for (let j = 0; j < windows[i].length; j++) {
      windows[i][j].draw();
    }
  }
  
  drawSlider();
}

function shuffleWindows() {
  for (let i = 0; i < windows.length; i++) {
    for (let j = 0; j < windows[i].length; j++) {
      if (random() > 0.5) {
        windows[i][j].turnOn();
      } else {
        windows[i][j].turnOff();
      }
    }
  }
}

function mousePressed() {
  if (document.getElementsByTagName('popup').length)
    return;

  for (let i = 0; i < windows.length; i++)
    for (let j = 0; j < windows[i].length; j++)
      if (windows[i][j].inBounds(mouseX, mouseY))
        return windows[i][j].toggle();

  moveSlider();
}

function mouseDragged() {
  if (document.getElementsByTagName('popup').length)
    return;
  if (!mouseIsPressed)
    return;
  moveSlider();
}

function loadWindowsToImage(image, brightLine) {

  if (!validParameter(brightLine)) {
    brightLine = 50;
  }

  let imgWidth = image.width;
  let imgHeight = image.height;
  for (let i = 0; i < windows.length; i++) {
    for (let j = 0; j < windows[i].length; j++) {
      let c = image.get(j*imgWidth/windows[i].length, i*imgHeight/windows.length)
      if (red(c) + blue(c) + green(c) < brightLine) {
        windows[i][j].turnOff();
      }
    }
  }

}

function validParameter(parameter) {

  return parameter != null && parameter != undefined;

}

function changeScale(newSizeScale) {
  sizeScale = constrain(newSizeScale, MIN_SIZE_SCALE, MAX_SIZE_SCALE);
  initializeValues();
}

function rightclick() {
  if (document.addEventListener) {
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    }, false);
} else {
    document.attachEvent('oncontextmenu', function() {
        window.event.returnValue = false;
    });
}
  return false;
}

function toggleFullscreen() {

  if (windowIsFullscreen) {
    closeFullscreen();
  } else {
    openFullscreen();
  }

}
      
/* View in fullscreen */
function openFullscreen() {
  windowIsFullscreen = true;
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) { /* Safari */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { /* IE11 */
    elem.msRequestFullscreen();
  }
}

/* Close fullscreen */
function closeFullscreen() {
  windowIsFullscreen = false;
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) { /* Safari */
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) { /* IE11 */
    document.msExitFullscreen();
  }
}

function keyPressed(e) {
  if (document.getElementsByTagName('popup').length)
    return;
  if (e.ctrlKey)
    return;
  if (keyCode == BACKSPACE) {
    deleteCharacter();
  } else {
    addCharacter(charToIndex(key));
  }

}

function addCharacter(characterKey) {
  if (characterKey === undefined)
    return;

  let characterData = pixelatedCharacters[characterKey];
  let characterPixels = characterData.pixels;
  let charWidth = characterPixels[0].length;
  let charHeight = characterPixels.length;

  if (windowTypeX > windows[windowTypeY].length - charWidth - 2) {
    if (windowTypeY + 2*(LINE_HEIGHT + 1) < windows.length) {
      windowTypeX = 0;
      windowTypeY += LINE_HEIGHT + 1;
    }
  }
  if (windowTypeX <= windows[windowTypeY].length - charWidth - 2) {
    charStack.push(characterData.char);

    let yWindowIndexOffset = windowTypeY + 1;
    let xWindowIndexOffset = windowTypeX + 1;
    for (let i = -1; i < charHeight+1; i++) {
      // don't go below min
      if (i + yWindowIndexOffset < 0)
        i = 0;
      for (let j = -1; j < charWidth+1; j++) {
        // don't go below min
        if (j + xWindowIndexOffset < 0)
          j = 0;
        if (i == constrain(i, 0, charHeight - 1) && j == constrain(j, 0, charWidth - 1)) {
          if (characterPixels[i][j] == 1) {
            windows[i + yWindowIndexOffset][j + xWindowIndexOffset].turnOff();
          } else {
            windows[i + yWindowIndexOffset][j + xWindowIndexOffset].turnOn();
          }
        } else {
          windows[i + yWindowIndexOffset][j + xWindowIndexOffset].turnOn();
        }
        // don't go above max
        if (j + xWindowIndexOffset + 1 >= windows[i + yWindowIndexOffset].length)
          j ++;
      }
      // don't go over max
      if (i + yWindowIndexOffset + 1 >= windows.length)
        i++;
    }
    windowTypeX = constrain(windowTypeX+4, 0, windows[windowTypeY].length - 1);
  }
}

function deleteCharacter() {
  if (!charStack.length)
    return;
  let ch = charStack.pop();
  let characterData = pixelatedCharacters[charToIndex(ch)];
  let characterPixels = characterData.pixels;
  let charWidth = characterPixels[0].length;
  let charHeight = characterPixels.length;

  if (windowTypeX <= 0) {
    if (windowTypeY - LINE_HEIGHT - 1 >= 0) {
      windowTypeX = windows[windowTypeY].length - 1 - ((windows[windowTypeY].length - 1) % (charWidth + 1));
      windowTypeY -= LINE_HEIGHT + 1;
    }
  }
  
  if (windowTypeX - charWidth >= 0) {
    
    for (let i = Math.max(windowTypeY, 0); i < Math.min(windowTypeY + charHeight + 2, windows.length); i++) {
      for (let j = Math.max(windowTypeX, 0); j > Math.min(windowTypeX - charWidth - 2, windows[windowTypeY].length); j--) {
        windows[i][j].turnOn();
      }
    }
    windowTypeX = constrain(windowTypeX-charWidth - 1, 0, windows[windowTypeY].length - 1);
  }
}

function charToIndex(char) {
  if (/^[a-z]$/.test(char)) {
    return char.charCodeAt(0) - 'a'.charCodeAt(0);
  }

  if (/^[A-Z]$/.test(char)) {
    return char.charCodeAt(0) - 'A'.charCodeAt(0);
  }

  if (/^[0-9]$/.test(char)) {
    return 26 + char.charCodeAt(0) - '0'.charCodeAt(0);
  }

  return specialCharIndexes[char];
}

function drawSlider() {
  let x = width - SLIDER_WIDTH / 2; 
  let topY = SLIDER_WIDTH / 2;
  let bottomY = height - SLIDER_WIDTH / 2;

  stroke(255);
  strokeWeight(5);
  line(x, topY, x, bottomY);

  fill(255, 0, 0);
  let y = Math.sqrt( (sizeScale - MIN_SIZE_SCALE) / (MAX_SIZE_SCALE - MIN_SIZE_SCALE) ) * (bottomY - topY) + topY;
  circle(x, y, 10);
  // circle(x, ( (Math.sqrt(sizeScale) - Math.sqrt(0.125)) / (Math.sqrt(2) - Math.sqrt(0.125)) ) * (bottomY - topY), 10);
}

function moveSlider() {
  let x = width - SLIDER_WIDTH / 2; 
  let topY = SLIDER_WIDTH / 2;
  let bottomY = height - SLIDER_WIDTH / 2;

  const cushion = 20;
  if (abs(mouseX - x) > cushion)
    return;
  if (mouseY < topY - cushion || mouseY > bottomY + cushion)
    return;
  let y = constrain(mouseY, topY, bottomY);
  let newSizeScale = ( (y - topY) / (bottomY - topY) )**2 * (MAX_SIZE_SCALE - MIN_SIZE_SCALE) + MIN_SIZE_SCALE;
  if (sizeScale != newSizeScale) {
    const NUM_CHANGES_FOR_MASTERPIECE = 8;
    let numChanges = 0;
    for (let i = 0; i < windows.length; i++) {
      for (let j = 0; j < windows[i].length; j++) {
        if (!windows[i][j].isOn) {
          numChanges ++;
          if (numChanges >= NUM_CHANGES_FOR_MASTERPIECE) {
            mouseIsPressed = false;
            if (confirm("Resizing the canvas will delete your masterpiece")) {
              return changeScale(newSizeScale);
            } else {
              return;
            }
          }
        }
      }
    }
    changeScale(newSizeScale);
  }
}
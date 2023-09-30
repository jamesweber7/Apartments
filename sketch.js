/*
 *
 * Run Video
 * Configure the following variables (and a little bit of code) to run a video on Apartments
 * 
 */

/* Change the following variables */

// If source image indexes start at 0, change to 0
// If you stop in the middle of running, change to the next file (beware duplicate file names)
var videoFrameCount = 1;

// Smaller sizeScale = more windows/higher resolution, but it's also slower to run.
var sizeScale = 0.35; // be careful trying to make this too small

// set the brightness threshold between black/white (between 1 and 764)
const threshold = 382;

// filepath for images from video
const source_path = 'bad_apple_images/bad_apple_';
const source_filetype = 'png';

// set to false if you don't want to save images
const save_video = true;

/* If you're not saving the images, ignore the following */

// change to what you want image filename to start as
// will have the video frame count appended at end of string
const result_filename = 'bad_apple_';
const result_filetype = 'jpg';

/* Modify this function to get the index matching your images (do they have leading zeroes? etc.) */
function getImagePath(videoFrameCount) {
  let source_image_index = videoFrameCount.toString();
  while (source_image_index.length < 3)
    source_image_index = '0' + source_image_index;
  
  return source_path+source_image_index+'.' + source_filetype;
}

function runVideoCapture() {

  const image_path = getImagePath(videoFrameCount);

  loadImage(image_path, (imag) => {
    img = imag;
    let startFrame = frameCount;
    let numFrames = 12;
    let endFrame = startFrame + numFrames;
    continueRun();
    function continueRun() {
      if (frameCount > endFrame) {
        loadWindowsToImage(imag, threshold);
        if (save_video)
          saveCanvas(result_filename+videoFrameCount, result_filetype);
        videoFrameCount ++;
        runVideoCapture();
      } else {
        setTimeout(continueRun, 0);
      }
    }
  });
}

/*
 *  
 * Code
 * 
 */

/* Get the documentElement (<html>) to display the page in fullscreen */
var elem = document.documentElement;

let windowIsFullscreen = false;

const NUMBER_OF_ANIMATIONS = 4;
let windowAnimations = [];

const WINDOW_WIDTH = 40;
const WINDOW_HEIGHT = 30;
const GAP_WIDTH = 10;
const GAP_HEIGHT = 25;

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
let imageThreshold = undefined;
let img;

let pixelatedCharacters;
let specialCharIndexes;
let charStack;

const SLIDER_WIDTH = 80;

function preload() {
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

  document.getElementById('get-started-btn').addEventListener('click', () => {
    runVideoCapture();
  })

  specialCharIndexes = [];
  for (let key in pixelatedCharacters) {
    if (!/[A-Z0-9]/.test(pixelatedCharacters[key].char))
      specialCharIndexes[pixelatedCharacters[key].char] = key;
  }

  initializeValues();
  if (document.getElementById('upload-img') && document.getElementById('upload-input')) {
    const upload = document.getElementById('upload-img');
    upload.style.left = `${width - SLIDER_WIDTH / 2 - upload.width / 2}px`;
    upload.style.top = `${height*0.925 - SLIDER_WIDTH / 2 - upload.height / 2}px`;

    const upload_input = document.getElementById('upload-input');

    upload.onclick = () => {
      upload_input.click();
    }
    upload_input.onchange = () => {
      if (upload_input.files.length) {
        const file = upload_input.files[0];
        
        const preview = document.getElementById('invisible-img');
        preview.src = URL.createObjectURL(file);
        preview.onload = function() {
          img = loadImage(preview.src, () => {
            loadWindowsToImage(img, imageThreshold);
            URL.revokeObjectURL(preview.src);  // Free memory
          });
        }
      }
    }
  }

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
  drawImageSlider();
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
  moveImageSlider();
}

function mouseDragged() {
  if (document.getElementsByTagName('popup').length)
    return;
  if (!mouseIsPressed)
    return;
  moveSlider();
  moveImageSlider();
}

function loadWindowsToImage(image, brightLine=undefined) {
  let imgWidth = image.width;
  let imgHeight = image.height;
  let imgAspectRatio = imgWidth / imgHeight;

  let screenWidth = xIncrement * windows[0].length;
  let screenHeight = yIncrement * windows.length;
  let screenAspectRatio = screenWidth / screenHeight;

  let windows_x_start, windows_x_end;
  let windows_y_start, windows_y_end;
  if (imgAspectRatio < screenAspectRatio) {
    windows_y_start = 0;
    windows_y_end = windows.length;

    let num_windows_x = floor(windows[0].length / imgAspectRatio);
    if (num_windows_x % 2 != windows[0].length % 2)
      num_windows_x ++;
    
    windows_x_start = windows[0].length / 2 - num_windows_x / 2;
    windows_x_end = windows[0].length / 2 + num_windows_x / 2;
  } else {
    windows_x_start = 0;
    windows_x_end = windows[0].length;

    let num_windows_y = floor(windows.length / imgAspectRatio);
    if (num_windows_y % 2 != windows.length % 2)
      num_windows_y ++;
    
    windows_y_start = windows.length / 2 - num_windows_y / 2;
    windows_y_end = windows.length / 2 + num_windows_y / 2;
  }


  if (!brightLine) {
    let sum = 0;
    let n = 0;
    for (let i = 0; i < windows.length / 10; i++) {
      for (let j = 0; j < windows[i].length / 10; j++) {
        let c = image.get(j*imgWidth/windows[i].length, i*imgHeight/windows.length);
        n++;
        sum += alpha(c)/255 * (red(c) + blue(c) + green(c));
      }
    }
    brightLine = sum / n;
  }
  for (let i = 0; i < windows.length; i++) {
    for (let j = 0; j < windows[i].length; j++) {
      if (i < windows_y_start || i >= windows_y_end ||
          j < windows_x_start || j >= windows_x_end) {
          // border
          windows[i][j].turnOff();
      } else {
        let c = image.get(j*imgWidth/windows[i].length, i*imgHeight/windows.length);
        if (alpha(c)/255 * (red(c) + blue(c) + green(c)) < brightLine) {
          windows[i][j].turnOff();
        } else {
          windows[i][j].turnOn();
        }
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
  let bottomY = height*0.85 - SLIDER_WIDTH / 2;

  stroke(255);
  strokeWeight(5);
  line(x, topY, x, bottomY);

  fill(255, 0, 0);
  let y = Math.sqrt( (sizeScale - MIN_SIZE_SCALE) / (MAX_SIZE_SCALE - MIN_SIZE_SCALE) ) * (bottomY - topY) + topY;
  circle(x, y, 10);
}

function moveSlider() {
  let x = width - SLIDER_WIDTH / 2; 
  let topY = SLIDER_WIDTH / 2;
  let bottomY = height*0.85 - SLIDER_WIDTH / 2;

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

function drawImageSlider() {
  if (!img)
    return;
  let leftX = width - SLIDER_WIDTH * 0.95; 
  let rightX = width - SLIDER_WIDTH * 0.1;
  let topY = height*0.85 - SLIDER_WIDTH / 2 + SLIDER_WIDTH / 2;
  let bottomY = height - SLIDER_WIDTH / 2;
  let y = (topY + bottomY) / 2 + document.getElementById('upload-img').height*0.75;

  stroke(255);
  strokeWeight(5);
  line(leftX, y, rightX, y);
  let x;
  if (imageThreshold) {
    x = map(imageThreshold, 1, 764, rightX, leftX);
  } else {
    x = map(122, 1, 764, rightX, leftX);
  }
  fill(255, 0, 0);
  circle(x, y, 10);
}

function moveImageSlider() {
  if (!img)
    return;
  let leftX = width - SLIDER_WIDTH * 0.95; 
  let rightX = width - SLIDER_WIDTH * 0.1;
  let topY = height*0.85 - SLIDER_WIDTH / 2 + SLIDER_WIDTH / 2;
  let bottomY = height - SLIDER_WIDTH / 2;
  let y = (topY + bottomY) / 2 + document.getElementById('upload-img').height*0.75;

  const cushion = 20;
  if (abs(mouseY - y) > cushion)
    return;
  if (mouseX < leftX - cushion || mouseX > rightX + cushion)
    return;
  let x = constrain(mouseX, leftX, rightX);
  let newImageThreshold = map(x, leftX, rightX, 764, 1);
  if (imageThreshold != newImageThreshold) {
    imageThreshold = newImageThreshold;
    loadWindowsToImage(img, imageThreshold);
  }
}

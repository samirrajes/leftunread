let names_list = []; // list of names to redact
let frequency = {}; // holds pre-generated n-gram freq table
let current_gram = ""; // holds current gram from freq table

// variables for text rendering/positioning
let curr_x, curr_y;
let char_spacing = 1;
let line_spacing = 30;

// word/letter handling
let word_queue = [];
let curr_word = "";
let letter_idx = 0;

// afinn/sentiment handling
let afinn_data;
let afinn = {};  // afinn dictionary
let word_sentiment = 0; // sentiment score for current word

// probability variables for neutral words to be rendered asemically:
// we want some neutral words to also be rendered asemically to further
// strip information from the text
let asemic_prob = 0.15; // 15% chance
let render_asemic = false;

let font;

// separate graphics buffer to render text
let text_layer;
let square_size;

// var for pause timing
let pause_timer = 0;

function preload() {
  // load names & afinn
  names_list = loadStrings('data-processing/names_final.txt');
  afinn_data = loadStrings('data-processing/AFINN165.txt');
  
  // load pre-generated freq table from JSON.
  frequency = loadJSON('data-processing/ngram_1.json');
  
  // load font file
  font = loadFont('fonts/VT323.ttf');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);
  
  // creating a square graphics buffer for text generation
  square_size = height * 0.8;
  text_layer = createGraphics(square_size, square_size);
  text_layer.background(0);
  text_layer.textSize(26);
  text_layer.textFont(font);
  text_layer.fill(0, 210, 0);
  text_layer.noStroke();
  
  // set initial text position
  curr_x = 20;
  curr_y = 40;

  // lower frame rate for more natural typing speed
  frameRate(25); 

  // parse afinn file into a lookup dictionary.
  for (let i = 0; i < afinn_data.length; i++) {
    let line_data = afinn_data[i];
    let parts = line_data.split('\t'); // separate by tab char
    if (parts.length >= 2) {
      let word = parts[0];
      let score = parseInt(parts[1]);
      afinn[word] = score;
    }
  }

  // use the pre-generated frequency table
  let keys = Object.keys(frequency);
  current_gram = random(keys); // random first word(s)
  word_queue = current_gram.split(/\s+/); // split words, for drawing
  curr_word = word_queue.shift(); // get first word from queue
}

function draw() {
  background(0);
  
  // calc margins to center the text graphics buffer
  let marginX = (width - square_size) / 2;
  let marginY = (height - square_size) / 2;
  
  // display text graphics buffer onto main canvas
  image(text_layer, marginX, marginY);
  
  // check for pause
  if (millis() < pause_timer) {
    // wait
  } else {
    // update text when not pausing
    if (letter_idx === 0) {
      word_sentiment = getWordSentiment(curr_word);
      if (word_sentiment === 0) {
        render_asemic = random(1) < asemic_prob; // probability check to render 0 sentiment word asemically
      } else {
        render_asemic = false;
      }
      // debugging test
      // console.log(curr_word + " - " + word_sentiment +
      //   (word_sentiment === 0 ? " (neutral, asemic: " + render_asemic + ")" : ""));
    }
    
    let next_letter = curr_word.charAt(letter_idx);
    let letter_width = text_layer.textWidth(next_letter);
    let isPunct = /[.,:;!?]/.test(next_letter);
    
    // wrap to next line if > margin
    if (curr_x + letter_width > square_size - 20) {
      curr_x = 20;
      curr_y += line_spacing;
      text_layer.fill(0, 210, 0);
      text_layer.text("-", curr_x, curr_y);
      curr_x += text_layer.textWidth("-");
    }
    
    // render next letter.
    if (isPunct) {
      text_layer.noStroke();
      text_layer.fill(0, 210, 0);
      text_layer.text(next_letter, curr_x, curr_y);
    } else {
      if (word_sentiment !== 0 || (word_sentiment === 0 && render_asemic)) {
        renderAsemicLetter(next_letter, curr_x, curr_y);
      } else {
        text_layer.noStroke();
        text_layer.strokeWeight(1);
        text_layer.fill(0, 210, 0);
        text_layer.text(next_letter, curr_x, curr_y);
      }
    }
    
    // update current x, and letter index
    curr_x += letter_width;
    letter_idx++;
    
    // when current word is complete move to next word
    if (letter_idx >= curr_word.length) {
      curr_x += text_layer.textWidth(' ');
      letter_idx = 0;
      let finished_word = curr_word;
      // check for a word ending in punctuation
      // in which case we move to the next line and pause for 0.75s
      if (/[.!?]$/.test(finished_word)) {
        curr_x = 20;
        curr_y += line_spacing;
        // pause for 750ms at sentence end
        pause_timer = millis() + random(500,1500);
        // use last word as key context for next word
        if (frequency.hasOwnProperty(finished_word)) {
          curr_word = random(frequency[finished_word]);
        } else {
          let keys = Object.keys(frequency);
          curr_word = random(keys);
        }
        return;
      } else {
        // use last word as key context for next word
        if (frequency.hasOwnProperty(finished_word)) {
          curr_word = random(frequency[finished_word]);
        } else {
          let keys = Object.keys(frequency);
          curr_word = random(keys);
        }
      }
    }
  }

  // HELPERS
  
  // draw translucent noise-driven scanlines
  drawScanlines(marginX, marginY, square_size);
  
  // scroll if necessary
  if (curr_y + line_spacing > square_size) {
    scroll();
    curr_y -= line_spacing;
  }
  
  // draw a blinking cursor/caret
  if (frameCount % 7) {
    let caretX = marginX + (curr_x + char_spacing);
    let caretY = marginY + curr_y;
    let caretHeight = 17;
    stroke(0, 210, 0);
    strokeWeight(2);
    line(caretX, caretY - caretHeight, caretX, caretY);
  }
}

// function to draw translucent scanlines that shift vertically based on noise
function drawScanlines(mX, mY, size) {
  push();
  noStroke();
  for (let y = 0; y < size; y += 2) {
    let offset = map(noise(y * 0.05, frameCount * 0.05), 0, 1, -10, 10);
    let alphaVal = map(noise(y * 0.05, frameCount * 0.05), 0, 1, 100, 255);
    fill(0, alphaVal);
    rect(mX, mY + y + offset, size, 0.5);
  }
  pop();
}
  
// function to scroll the graphics buffer when the text reaches the bottom of the buffer
function scroll() {
  let scrolled = text_layer.get(0, line_spacing, square_size, square_size - line_spacing);
  text_layer.clear();
  text_layer.background(0);
  text_layer.image(scrolled, 0, 0);
}

// function to check if a word is a name from the list of names
function isName(word) {
  let cleanWord = word.replace(/[^\w]/g, ''); // remove punctuation/non alpha-numeric characters
  // loop through list of names, return true if it exists in the list
  for (let i = 0; i < names_list.length; i++) {
    if (cleanWord.toLowerCase() === names_list[i].toLowerCase()) {
      return true;
    }
  }
  return false;
}

// removes punctuation from the beginning and end of a word
// keeps punctuation in the middle the same (example: we dont want words like i'll to become ill)
function sanitize(word) {
  return word.replace(/(^[^\w']+)|([^\w']+$)/g, '');
}

// function that takes a word, and returns its sentiment score from afinn
function getWordSentiment(word) {
  if (isName(word)) {
    return 1; // names are given a sentiment of 1, so that they are rendered asemically
  }

  // check original word
  let lookup = word.toLowerCase();
  if (afinn.hasOwnProperty(lookup)) {
    return afinn[lookup];
  }

  // check sanitized word
  let sanitized = sanitize(word).toLowerCase();
  if (afinn.hasOwnProperty(sanitized)) {
    return afinn[sanitized];
  }

  // return 0 if not found (neutral word)
  return 0;
}

// samples 'count' points from an array of points, and shuffles them
// used for our asemic generations:
// when a word is to be rendered asemically, we sample points from its outline, and shuffle them
function samplePoints(points, count) {
  let sampled = [];
  if (points.length <= count) {
    return points;
  } else {
    let step = points.length / count;
    for (let i = 0; i < count; i++) {
      sampled.push(points[floor(i * step)]);
    }
    sampled = shuffle(sampled);
    return sampled;
  }
}

// function that takes a letter, and xy pos, and renders a textured asemic character
function renderAsemicLetter(letter, x, y) {
  let pts = font.textToPoints(letter, x, y, 26, { sampleFactor: 0.1 }); // sample points with textToPoints
  let sampledPts = samplePoints(pts, 5); // further sample 6 points from the sampled points
  let layers = 3; // draw 2 layers, higher number -> more scratchy sort of texture
  for (let l = 0; l < layers; l++) {
    text_layer.noFill();
    text_layer.strokeWeight(random(1, 3)); // random strokeweight
    text_layer.stroke(0, 210, 0, random(150, 255)); // random alpha
    text_layer.beginShape();
    for (let pt of sampledPts) {
      text_layer.curveVertex(pt.x, pt.y);
    }
    // close loop by passing first 2 points back into curveVertex
    if (sampledPts.length >= 2) {
      let pt = sampledPts[0];
      text_layer.curveVertex(pt.x, pt.y);
      pt = sampledPts[1];
      text_layer.curveVertex(pt.x, pt.y);
    }
    text_layer.endShape();
  }
}

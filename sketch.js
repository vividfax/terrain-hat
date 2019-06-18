let rows = 66;
let stitches = 96;
let patternScale = 0.1;
let texture = 0.18;

let stitchSlider, rowSlider, scaleSlider, textureSlider;
const validStitches = [72, 84, 96, 108, 120, 132];
let saveButton;

const cellSize = 8;

const simplex = new SimplexNoise();

function setup() {

	let canvas = createCanvas(cellSize * stitches + 200, cellSize * rows + 70);
	canvas.parent('sketch-holder');

	makeControls();

	pixelDensity(4);
	// background('#ccc');
	noStroke();
	rectMode(CENTER);

	// noLoop();
}

function makeControls() {

	stitchSlider = makeSlider(stitchSlider, 'Stitches', 0, validStitches.length - 1, 2, 1);
	rowSlider = makeSlider(rowSlider, 'Rows', 50, 90, rows, 1);
	scaleSlider = makeSlider(scaleSlider, 'Scale', 0.01, 0.3, patternScale, 0.01);
	textureSlider = makeSlider(textureSlider, 'Texture', 0, 0.9, texture, 0.1);

	saveButton = makeButton(saveButton, 'Save image', saveImage)
}

function makeSlider(sliderName, label, min, max, defaultValue, step) {

	createElement('label', label).parent('controls').attribute('for', label).class('').id(label + "Label");

	sliderName = createSlider(min, max, defaultValue, step);
	sliderName.id(label);
	sliderName.parent('controls');
	sliderName.class('form-control-range mb-2');

	return sliderName;
}

function makeButton(buttonName, text, action) {

	buttonName = createButton(text);
	buttonName.parent('controls');
	buttonName.class('btn btn-outline-light btn-block mt-4');
	buttonName.mousePressed(action);

	return buttonName;
}

function saveImage() {
	saveCanvas(stitches + '-sts-' + rows + '-rows', 'png');
}

function draw() {

	if (update() || frameCount == 1) {

		const canvasScale = 0.8;

		resizeCanvas(canvasScale * (cellSize * stitches + 195), canvasScale * (cellSize * rows + 85));
		scale(canvasScale);

		background('#fff');

		translate(40, 50);
		drawKey();

		translate(110, -5);
		drawChart();

		translate(-cellSize / 2, -cellSize / 2);
		drawGuides();

		select('#StitchesLabel').html('Stitches · ' + stitches);
		select('#RowsLabel').html('Rows · ' + rows);
		select('#ScaleLabel').html('Scale · ' + patternScale);
		select('#TextureLabel').html('Texture · ' + texture);
	}
}

function update() {

	const newStitches = validStitches[stitchSlider.value()];
	const newRows = rowSlider.value();
	const newScale = scaleSlider.value();
	const newTexture = textureSlider.value();

	if (stitches != newStitches ||
		rows != newRows ||
		patternScale != newScale ||
		texture != newTexture) {

		stitches = newStitches;
		rows = newRows;
		patternScale = newScale;
		texture = newTexture;
		return true;
	}
	return false;
}

function drawKey() {

	const labels = ['knit', 'purl', 'k2tog', 'p2tog'];
	const lineHeight = 35;

	for (let i = 0; i < labels.length; i++) {
		const label = labels[i];

		noStroke();
		fill('#222');
		textSize(13);
		textAlign(LEFT, BASELINE);
		text(label, 15, lineHeight * i + 4);
		drawStitch(0, lineHeight * i, label);
	}
}

function drawChart() {

	const sections = getSections(stitches);
	const sectionLength = stitches / sections
	const decreaseRows = getDecreaseRows(sections);

	let emptyStitches = 0;
	let decreaseStitch = false;
	let stitchCount = stitches;

	for (let j = rows - 1; j >= 0; j--) {

		if (decreaseRows.includes(j)) {

			emptyStitches++;
			stitchCount -= sections;
			decreaseStitch = true;

		} else {
			decreaseStitch = false;
		}
		for (let g = 0; g < sections; g++) {
			for (let h = 0; h < sectionLength; h++) {
				const i = g * sectionLength + h;

				let stitchType;
				// const ratio = 2/ 3; // stitch/row gauge
				const ratio = 1; // stitch/row gauge

				const x = stitchCount / sections * g + h - sectionLength + stitchCount / sections;
				const noise = getSimplex(x, (rows - j) * ratio, stitchCount);

				if (decreaseStitch && emptyStitches == h) {
					if (noise == 0) {
						stitchType = 'k2tog';
					} else {
						stitchType = 'p2tog';
					}
				} else if (emptyStitches - h > 0) {
					stitchType = 'empty';
				} else if (noise == 0) {
					stitchType = 'knit';
				} else {
					stitchType = 'purl';
				}

				drawStitch(i * cellSize, j * cellSize, stitchType);
			}
		}
	}
}

function getSections(stitchCount) {

	for (let i = 6; i <= 8; i++) {
		if (stitchCount % i == 0) {
			return i;
		}
	}
}

function getDecreaseRows(sections) {

	let decreaseRows = [];
	let stitchCount = stitches;

	for (let i = 0; i < 30; i++) {

		stitchCount -= sections;
		if (stitchCount >= 10) {
			decreaseRows.push(i);
		}
		if (i >= 11) {
			i++;
		}
	}
	return decreaseRows;
}

function getSimplex(x, y, stitchCount) {

	let thisScale = patternScale;
	const octaves = 5;

	let noise = 0;
	let power = 0;
	let fraction = 1;

	const angle = TWO_PI / stitchCount * x;
	const radius = stitchCount / TWO_PI;
	x = radius * cos(angle);
	const z = radius * sin(angle);

	for (let i = 0; i < octaves; i++) {

		noise += simplex.noise3D(x * thisScale, y * thisScale, z * thisScale) * fraction;
		power += fraction;
		fraction *= texture;
		thisScale *= 2;
	}
	noise /= power;

	noise = map(noise, -1, 1, 0, 1);
	noise = Math.round(noise);

	return noise;
}

function drawStitch(x, y, type) {

	noStroke();
	fill('#ccc');
	rect(x, y, cellSize, cellSize);
	fill('#fff');
	rect(x, y, cellSize * 0.9, cellSize * 0.9);

	fill('#555');

	switch (type) {
		case 'empty':
			fill('#ccc');
			rect(x, y, cellSize, cellSize);
			break;
		case 'knit':
			break;
		case 'purl':
			ellipse(x, y, cellSize / 3);
			break;
		case 'k2tog':
			stroke(0);
			line(x - 2, y + 2, x + 2, y - 2);
			break;
		case 'p2tog':
			stroke(0);
			line(x - 2, y + 2, x + 2, y - 2);
			ellipse(x - 2, y - 2, 1);
			break;
	}
}

function drawGuides() {

	fill('#555');
	textAlign(CENTER, CENTER);
	textSize(10);
	const gridSize = stitches / getSections(stitches) / 2;

	for (let i = stitches; i > -gridSize; i -= gridSize) {
		if (i < 0) {
			i = 0;
		}
		const x = cellSize * i;
		const y = rows * cellSize
		stroke('#999');
		line(x, 0, x, y);
		noStroke();
		text(stitches - i, x, y + cellSize);
	}
	for (let i = rows; i > -gridSize; i -= gridSize) {
		if (i < 0) {
			i = 0;
		}
		const x = stitches * cellSize;
		const y = cellSize * i;
		stroke('#999');
		line(0, y, x, y);
		noStroke();
		text(rows - i, x + cellSize, y);
	}
}

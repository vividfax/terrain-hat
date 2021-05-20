let rows = 51;
let stitches = 0;
let patternScale = 0.2;
let texture = 0.9;

let stitchSlider, rowSlider, scaleSlider, textureSlider;
let saveButton;
const validStitches = [60, 70, 72, 80, 84, 90, 96, 100, 108, 110, 120];
const minRows = 25;
const maxRows = 70;

let decreaseRows;

const cellSize = 8;

const simplex = new SimplexNoise();

function setup() {

	let canvas = createCanvas(cellSize * stitches + 200, cellSize * rows + 70);
	canvas.parent('sketch-holder');

	makeControls();

	pixelDensity(8);
	noStroke();
	rectMode(CENTER);

	draw();
}

function draw() {

	if (!change()) {
		return;
	}
	const canvasScale = 0.8;
	const canvasWidth = canvasScale * (cellSize * stitches + 195);
	let canvasHeight = canvasScale * (cellSize * rows + 85);

	if (canvasHeight < 385) {
		canvasHeight = 385;
	}

	resizeCanvas(canvasWidth, canvasHeight);
	scale(canvasScale);

	background('#fff');

	translate(40, 220);
	drawKey();

	translate(110, -176);
	drawChart();

	translate(-cellSize / 2, -cellSize / 2);
	drawGuides();

	drawLabel();

	updateClass('.Stitches', stitches);
	updateClass('.Rows', rows);
	updateClass('.Scale', patternScale.toFixed(1));
	updateClass('.Texture', texture.toFixed(1));
	updateClass('.Interval', stitches / getSections(stitches) / 2);
}

function updateClass(className, html) {

	let classItems = selectAll(className);
	for (let i = 0; i < classItems.length; i++) {
		classItems[i].html(html);
	}
}

function change() {

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

	const labels = ['knit', 'purl', 'k2tog', 'p2tog', 'no stitch'];
	const lineHeight = 30;

	textSize(13);
	textAlign(LEFT, BASELINE);

	for (let i = 0; i < labels.length; i++) {
		const label = labels[i];

		noStroke();
		fill('#555');
		text(label, 15, lineHeight * i + 4);
		drawStitch(0, lineHeight * i, label);
	}
	noStroke();
	fill('#555');
	textSize(10);
	text('scale: ' + patternScale, 15, lineHeight * (labels.length + 2));
	text('texture: ' + texture, 15, lineHeight * (labels.length + 2.5) + 3.5);
}

function drawChart() {

	const sections = getSections(stitches);
	const sectionLength = stitches / sections
	decreaseRows = getDecreaseRows(sections);

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
				// const ratio = 2 / 3; // stitch/row gauge
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
					stitchType = 'no stitch';
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

	for (let i = 6; i >= 4; i--) {
		if (stitchCount % (i * 2) == 0) {
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
		if (i >= stitches / sections / 2) {
			i++;
		}
	}
	return decreaseRows;
}

function getSimplex(x, y, stitchCount) {

	let thisScale = patternScale / 10;
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
		case 'no stitch':
			fill('#ccc');
			rect(x, y, cellSize, cellSize);
			break;
		case 'knit':
			break;
		case 'purl':
			ellipse(x, y, cellSize / 3);
			break;
		case 'k2tog':
			stroke('#555');
			line(x - 2, y + 2, x + 2, y - 2);
			break;
		case 'p2tog':
			stroke('#555');
			line(x - 2, y + 2, x + 2, y - 2);
			noStroke();
			ellipse(x - 2, y - 2, 2);
			break;
	}
}

function drawGuides() {

	fill('#555');
	textAlign(CENTER, CENTER);
	textSize(10);
	const gridSize = stitches / getSections(stitches) / 2;

	noStroke();
	text('1', stitches * cellSize - cellSize / 2, rows * cellSize + cellSize);
	text('1', stitches * cellSize + cellSize, rows * cellSize - cellSize / 2 + 1);

	for (let i = stitches; i > -gridSize; i -= gridSize) {
		if (i < 0) {
			i = 0;
		}
		const x = cellSize * i;
		const y = rows * cellSize
		stroke('#999');
		line(x, 0, x, y);

		if (i != stitches) {
			noStroke();
			text(stitches - i, x + cellSize / 2, y + cellSize);
		}
	}
	for (let i = rows; i > -gridSize; i -= gridSize) {
		if (i < 0) {
			i = 0;
		}
		const x = stitches * cellSize;
		const y = cellSize * i;
		stroke('#999');
		line(0, y, x, y);

		if (i != rows) {
			noStroke();
			text(rows - i, x + cellSize, y + cellSize / 2 + 1);
		}
	}
}

function drawLabel() {

	stroke('#999');
	let crownDecreases = decreaseRows[decreaseRows.length - 1];

	if (crownDecreases > rows - 1) {
		crownDecreases = rows - 1;
	}
	const n = cellSize * crownDecreases + cellSize;
	line(-cellSize * 2, 0, -cellSize * 4 / 3, 0)
	line(-cellSize * 2, 0, -cellSize * 2, n);
	line(-cellSize * 2, n, -cellSize * 4 / 3, n)

	noStroke();
	fill('#555');
	textSize(13);
	text('crown decreases', -60, n / 2, 20, 50);
}

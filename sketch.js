const rows = 66;
const stitches = 96;

const cellSize = 10;

let simplex = new SimplexNoise();

function setup() {

	pixelDensity(2);
	createCanvas(cellSize * stitches + 200, cellSize * rows + 70);

	background('#ccc');
	noLoop();
	noStroke();
	rectMode(CENTER);
}

function draw() {

	translate(50, 50);
	drawKey();

	translate(100, -10);
	drawChart();

	translate(-cellSize / 2, -cellSize / 2);
	drawGuides();
}

function drawKey() {

	let labels = ['knit', 'purl', 'k2tog', 'p2tog'];

	for (let i = 0; i < labels.length; i++) {
		const label = labels[i];

		const x = 0;
		const lineHeight = 35;

		noStroke();
		fill('#222');
		textSize(16);
		text(label, x + 15, lineHeight * i + 4);
		drawStitch(x, lineHeight * i, label);
	}
}

function drawChart() {

	let sections = getSections(stitches);
	let sectionLength = stitches / sections
	let decreaseRows = getDecreaseRows(sections);

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
				let i = g * sectionLength + h;

				let stitchType;
				const ratio = 2 / 3; // stitch/row gauge

				let x = stitchCount / sections * g + h;
				const noise = getSimplex(x, j * ratio, stitchCount);

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

	for (let i = 5; i <= 8; i++) {
		if (stitchCount % i == 0) {
			return i;
		}
	}
	console.log('error: non divisible into sections ' + stitchCount);
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

	let scale = 0.1;
	const roughness = 0.6;

	const octaves = 4;
	let noise = 0;
	let power = 0;
	let fraction = 1;

	const angle = TWO_PI / stitchCount * x;
	const radius = stitchCount / TWO_PI;
	x = radius * cos(angle);
	const z = radius * sin(angle);

	for (let i = 0; i < octaves; i++) {

		noise += simplex.noise3D(x * scale, y * scale, z * scale) * fraction;
		power += fraction;
		fraction *= roughness;
		scale *= 2;
	}
	noise /= power;

	noise = map(noise, -1, 1, 0, 1);
	noise = Math.round(noise);

	return noise;
}

function drawStitch(x, y, type) {

	noStroke();
	fill('#fff');
	rect(x, y, cellSize * 0.9, cellSize * 0.9);

	fill('#555');

	switch (type) {
		case 'empty':
			fill('#ccc');
			rect(x, y, cellSize * 0.9, cellSize * 0.9);
			break;
		case 'knit':
			break;
		case 'purl':
			ellipse(x, y, cellSize / 3);
			break;
		case 'k2tog':
			stroke(0);
			line(x - 3, y + 3, x + 3, y - 3);
			break;
		case 'p2tog':
			stroke(0);
			line(x - 3, y - 3, x + 3, y + 3);
			break;
	}
}

function drawGuides() {

	fill('#555');
	textAlign(CENTER, CENTER);
	textSize(10);
	let gridSize = stitches / getSections(stitches) / 2;

	for (let i = stitches; i > -gridSize; i -= gridSize) {
		if (i < 0) {
			i = 0;
		}
		let x = cellSize * i;
		let y = rows * cellSize
		stroke('#999');
		line(x, 0, x, y);
		noStroke();
		text(stitches - i, x, y + cellSize);
	}
	for (let i = rows; i > -gridSize; i -= gridSize) {
		if (i < 0) {
			i = 0;
		}
		let x = stitches * cellSize;
		let y = cellSize * i;
		stroke('#999');
		line(0, y, x, y);
		noStroke();
		text(rows - i, x + cellSize, y);
	}
}

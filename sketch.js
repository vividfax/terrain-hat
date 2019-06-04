const rows = 75;
const stitches = 96;

const cellSize = 10;

let simplex = new SimplexNoise();

function setup() {

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
}

function drawKey() {

	let labels = ['knit', 'purl'];

	for (let i = 0; i < labels.length; i++) {
		const label = labels[i];

		const x = 0;
		const lineHeight = 35;

		fill('#222');
		textSize(16);
		text(label, x + 15, lineHeight * i + 4);
		drawStitch(x, lineHeight * i, label);
	}

}

function drawChart() {

	for (let i = 0; i < stitches; i++) {
		for (let j = 0; j < rows; j++) {

			let stitchType;

			const ratio = 2 / 3; // stitch/row gauge
			// const ratio = 1;
			const noise = getSimplex(i, j * ratio);

			if (noise == 0) {
				stitchType = 'knit';
			} else {
				stitchType = 'purl';
			}
			drawStitch(i * cellSize, j * cellSize, stitchType);
		}
	}
}

function getSimplex(x, y) {

	const octaves = 4;
	const falloff = 0.9;
	let scale = 0.04;

	let noise = 0;
	let power = 0;
	let fraction = 1;

	const angle = TWO_PI / stitches * x;
	const radius = stitches / TWO_PI;
	x = radius * cos(angle);
	const z = radius * sin(angle);

	for (let i = 0; i < octaves; i++) {

		noise += simplex.noise3D(x * scale, y * scale, z * scale) * fraction;
		power += fraction;
		fraction *= falloff;
		scale *= 2;
	}
	noise /= power;

	noise = map(noise, -1, 1, 0, 1);
	noise = Math.round(noise);

	return noise;
}

function drawStitch(x, y, type) {

	fill('#fff');
	rect(x, y, cellSize * 0.9, cellSize * 0.9);

	fill('#555');

	switch (type) {
		case 'knit':
			break;
		case 'purl':
			ellipse(x, y, cellSize / 3);
			break;
	}
}

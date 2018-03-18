let g;
let py1, py2;
let px = 0;

function setup() {
	g = new Game(16);
	createCanvas(800, 1100);
	py1 = py2 = height / 2;

	line(0, height / 2, width, height / 2);
}

function draw() {

	g.evolve();
}

function graph(p1, p2) {

	console.log(p1 + ' --> ' + p2);


	let x = Math.sqrt(frameCount) * 10;
	let y1 = map(p1, -200, 200, height, 0);
	let y2 = map(p2, -200, 200, height, 0);

	stroke(0, 255, 0);
	line(px, py1, x, y1);

	stroke(255, 0, 0);
	line(px, py2, x, y2);

	px = x;
	py1 = y1;
	py2 = y2;
}
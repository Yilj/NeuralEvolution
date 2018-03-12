const inputs = [[0, 0], [0, 1], [1, 0], [1, 1]];
const targets = [[0], [1], [1], [0]];
const res = 20;
let pop, px, py;

function setup() {
	createCanvas(800, 800);
	rect(0, 0, width - 1, height - 1);

	let nn = new NeuralNetwork([2, 4, 8, 1]);
	pop = new Population(nn, 400, 0.05);
}

function draw() {
	pop.resetError();

	for (let i = 0; i < inputs.length; i++) {
		topOrganism = pop.test(inputs[i], targets[i]);
	}

	pop.evolve();

	for (let i = 0; i < res; i++) {
		for (let j = 0; j < res; j++) {
			let guess = pop.organisms[0].guess([i / res, j / res])
			if (guess > 0) {
				fill(guess * 255);
			} else if (guess < 0) {
				fill(Math.abs(guess) * 255, 0, 0);
			} else {
				fill(guess * 255);
			}
			noStroke();
			rect(i * (width / res), j * (height / res), width / res, height / res);
		}
	}

	let x = Math.sqrt(frameCount) * 10;
	let y = height - map(pop.organisms[0].error, 0, 0.01, 0, height);

	line(x, y, px, py);

	px = x;
	py = y;



	console.log(pop.organisms[0].error);
}
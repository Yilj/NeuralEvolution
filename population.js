/** @class */
class Population {
	/**
		* Population constructor
		* @param {NeuralNetwork} nn NeuralNetwork moddel to base Population on
		* @param {number} size Number of members in population (has to be '% 4 = 0')
		* @param {number} mRate NeuralNetwork moddel to base Population on
		* @returns {Population}
		* @constructor
	*/
	constructor(nn, size, mRate) {
		// Create population array with given size
		this.organisms = new Array(size).fill();
		// Deepcoppy NeuralNetwork modell as each organism
		this.organisms = math.map(this.organisms, () => nn.copy());
		// Randomize weights and biases of each organism (probability = 1)
		math.forEach(this.organisms, org => org.mutate(1));

		//Set mutationRate
		this.mutationRate = mRate;
	}

	/**
		* Test each Organism for given input and target
		* @param {number[]} inputs Array of input values
		* @param {number[]} targets Array of target values
	*/
	test(input, target) {
		// Loop over all organisms
		math.forEach(this.organisms, org => {
			// Let the organism guess
			let guess = org.guess(input);
			// Initialize this organisms error
			let error = 0;
			// Sum up the error for each of the output nodes
			for (let i = 0; i < guess.length; i++) {
				error += Math.abs(target[i] - guess[i])
			}
			// Set the orgnisms error
			org.error += error;
		});
	}

	/**
		* Evolve the population
	*/
	evolve() {
		// SORT POPULATION
		this.rank();

		// INITIALIZE MATING POOL
		let pool = [];
		// Loop over all organims ...
		for (let i = 0; i < this.organisms.length; i++) {
			// And add the orgnism to the pool based on  their ranking
			let ammount = (this.organisms.length - i) / 1;
			for (let j = 0; j < ammount; j++) {
				pool.push(this.organisms[i]);
			}
		}

		// CROSSOVER NEW CHILDREN
		// Keep the first quarter of organisms
		let keep = this.organisms.length / 4;
		// Discard last quarter
		let discard = this.organisms.length - keep;
		// Loop over center half of organisms
		for (let i = keep; i < discard; i++) {
			// Pick two random parents from mating pool
			let a = Math.floor(math.random(pool.length));
			let b = Math.floor(math.random(pool.length));
			// Produce child as crossover of parents
			let child = NeuralNetwork.crossOver(pool[a], pool[b]);
			// Replace organism with new child
			this.organisms[i] = child;
		}

		// MUTATE ORGANISMS
		// Completly mutate the last quarter of organisms (rate = 1)
		for (let i = discard; i < this.organisms.length; i++) {
			this.organisms[i].mutate(1);
		}

		for (let i = 1; i < discard; i++) {
			this.organisms[i].mutate(this.mutationRate);
		}
	}

	/**
		* Rank the orgnisms by theyr individual error
	*/
	rank() {
		this.organisms.sort((a, b) => {
			return (a.error > b.error) ? 1 : ((b.error > a.error) ? -1 : 0);
		});
	}

	/**
		* Reset error propertie of each organism
	*/
	resetError() {
		this.organisms.forEach(org => org.error = 0);
	}
}
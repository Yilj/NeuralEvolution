/** @class */
class Game {
	/**
		* Create a new Game
		* @param {number} playersNr Number of total players
		* @returns {Game}
		* @constructor
	*/
	constructor(playersNr) {
		// Create player array
		this.players = new Array(playersNr).fill();
		// Initialize players
		this.players = this.players.map(() => new Player());
	}

	/**
		* Evolve one new generation
	*/
	evolve() {
		// PLAY
		this.play();

		// RANK
		// Sort players in descending order based on their points
		this.players.sort((a, b) => b.points - a.points);

		// INITIALIZE MATING POOL
		let pool = [];
		// Loop over all organims ...
		for (let i = 0; i < this.players.length; i++) {
			// And add the orgnism to the pool based on  their ranking
			let ammount = (this.players.length - i) / 1;
			for (let j = 0; j < ammount; j++) {
				pool.push(this.players[i]);
			}
		}

		// Keep the first quarter of players
		let keep = this.players.length / 4;
		// Discard last quarter
		let discard = this.players.length - 1;

		// Loop over center half of players
		for (let i = keep; i < discard; i++) {
			// Pick two random parents from mating pool
			let a = Math.floor(math.random(pool.length));
			let b = Math.floor(math.random(pool.length));
			// Produce child as crossover of parents
			let child = NeuralNetwork.crossOver(pool[a].nn, pool[b].nn);
			// Replace organism with new child
			this.players[i].nn = child;
		}

		// Completly mutate the last quarter of players (rate = 1)
		for (let i = discard; i < this.players.length; i++) {
			this.players[i].nn.mutate(1);
		}
		// Mutate rest of players using their rate
		for (let i = 1; i < discard; i++) {
			this.players[i].nn.mutate();
		}

		graph(this.players[0].points, this.players[4].points);

		//RESET
		this.players.forEach(p => p.resetPoints());
	}

	/**
		* Play all necesarry combinations
	*/
	play() {
		// PLAY
		function k_combinations(set, k) {
			var i, j, combs, head, tailcombs;

			// There is no way to take e.g. sets of 5 elements from
			// a set of 4.
			if (k > set.length || k <= 0) {
				return [];
			}

			// K-sized set has only one K-sized subset.
			if (k == set.length) {
				return [set];
			}

			// There is N 1-sized subsets in a N-sized set.
			if (k == 1) {
				combs = [];
				for (i = 0; i < set.length; i++) {
					combs.push([set[i]]);
				}
				return combs;
			}

			combs = [];
			for (i = 0; i < set.length - k + 1; i++) {
				// head is a list that includes only our current element.
				head = set.slice(i, i + 1);
				// We take smaller combinations from the subsequent elements
				tailcombs = k_combinations(set.slice(i + 1), k - 1);
				// For each (k-1)-combination we join it with the current
				// and store it to the set of k-combinations.
				for (j = 0; j < tailcombs.length; j++) {
					combs.push(head.concat(tailcombs[j]));
				}
			}
			return combs;
		}

		// const combinations = k_combinations(this.players, 4);


		// combinations.forEach(c => this.playRound(c));

		for (let i = 0; i < 13; i++) {
			this.playRound([this.players[i], this.players[13], this.players[14], this.players[15]]);
		}
	}

	/**
		* Play one round
		* @param {number[]} players Players participating
	*/
	playRound(players) {
		// INITIALIZE CARDSTACK 
		// Initialize cardStack array
		let cardStack = new Array(33);
		// Set card values
		for (let i = 0; i < cardStack.length; i++) {
			cardStack[i] = i + 3;
		}
		// Remove nine cards
		for (let i = 0; i < 9; i++) {
			cardStack.splice([Math.floor(math.random(0, 33))], 1);
		}
		// Shuffle cards
		Game.shuffleArray(cardStack);

		// RESET PLAYERS
		// Call reset round
		players.forEach(p => p.resetRound());
		// Shuffle players
		Game.shuffleArray(players);
		// Initialize playerIndex
		let playerIndex = 0;

		// PLAY GAME
		// While there are cards left
		while (cardStack.length > 0) {
			// Take first card
			const card = cardStack.splice(0, 1);
			// Reset chipsOnCard
			let chipsOnCard = 0;

			// While no one has taken the card
			while (true) {
				const decision = players[playerIndex].showCard(card, chipsOnCard, cardStack.length, players, playerIndex);
				// If player took card ...
				if (decision) {
					// ... end turn
					break;
				} else {
					// Put chip on card
					chipsOnCard++;
					// Set playerIndex to next player
					playerIndex = playerIndex == players.length - 1 ? 0 : ++playerIndex;
				}
			}
		}
	}

	/**
		* Shuffle array
		* @param {Array} arr Array to shuffle
	*/
	static shuffleArray(arr) {
		for (let i = arr.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[arr[i], arr[j]] = [arr[j], arr[i]];
		}
	}
}
/** @class */
class Player {
	/**
		* Create a new Player
		* @returns {Player}
		* @constructor
	*/
	constructor() {
		// Deepycopy NeuralNetwork
		this.nn = new NeuralNetwork([135, 270, 27, 1]);

		// Mutate NeuralNetwork
		this.nn.mutate(1);

		// Initialize parameters
		this.resetRound();
		this.resetPoints();

	}

	/**
		* Reset the player for next round
	*/
	resetRound() {
		// Reset player chips
		this.chips = 11;
		this.cards = new Array(33).fill(-1);
	}

	/**
		* Reset the player for next generation
	*/
	resetPoints() {
		this.points = 0;
	}

	/**
		* Show card to player
		* @param {number} card Card value
		* @param {number} chipsOnCard Number of chips on card
		* @param {number} cardsLeft Number of cards left on stack
		* @param {NeuralNetwork[]} players All players in round
		* @param {number} playerIndex Index of this player in players
		* @returns {boolean}
	*/
	showCard(card, chipsOnCard, cardsLeft, players, playerIndex) {
		// Create nn inputs array
		let inputs = new Array();
		// Add card value
		inputs.push(map(card, 3, 35, 0, 1));
		// Add chipsOnCard value
		inputs.push(map(chipsOnCard, 0, 55, 0, 1));
		//Add cardsLeft value
		inputs.push(map(cardsLeft, 0, 33, 0, 1));

		// Move this player to index 0 of players array
		[[players[0]], [players[playerIndex]]] = [[players[playerIndex]], [players[0]]];
		// Add all players cards
		players.forEach(p => {
			p.cards.forEach(c => {
				inputs.push(c == -1 ? 0 : 1);
			})
		});


		// Decide wheter to take card or not
		let decision = this.nn.guess(inputs);

		// If no chips left take card
		decision = this.chips == 0 ? 1 : decision;

		// Take card
		if (decision > 0) {
			// Add chips
			this.chips += chipsOnCard;
			// Add card
			this.cards[card - 3] = 1;
			// Add points
			this.points -= card;
			this.points += chipsOnCard;

			return true;
		}
		// Don't take card
		else {
			// Remove chip
			this.chips--;
			// Remove point
			this.points--;

			return false;
		}
	}
}
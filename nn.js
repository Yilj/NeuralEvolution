/** @class */
class NeuralNetwork {
	/**
		* Create a new NeuralNetwork
		* @param {number[]} shape Number of nodes on each layer
		* @returns {NeuralNetwork}
		* @constructor
	*/
	constructor(shape) {
		// Set activation functions
		this._functions = {
			// 0: Identity
			identity: val => val * this._settings.accumulator,
			// 1: Binary step
			binaryStep: val => val < 0 ? 0 : 1,
			// 2: Logistic (a.k.a. Soft step) (a.k.a. Sigmoid)
			logistic: val => (1 / (1 + Math.exp(-val))) * this._settings.accumulator,
			// 3: CenteredLogistic
			centeredLogistic: val => (1 / (1 + Math.exp(-val)) - 0.5) * this._settings.accumulator,
			// 4: TanH
			tanH: val => Math.tanh(val) * this._settings.accumulator,
			// 5: ArcTan
			arcTan: val => Math.atan(val) * this._settings.accumulator,
			// 6: Rectified Linear Unit (ReLU)
			reLU: val => val < 0 ? 0 : val * this._settings.accumulator,
			// 7: Parametric Rectifier Linear Unit (pReLU) (a.k.a. leaky ReLU)
			pReLU: val => val < 0 ? 0.01 * val * this._settings.accumulator : val * this._settings.accumulator,
			// 8: Exponential Liner Unit (ELU)
			eLU: val => val < 0 ? 1 * (Math.exp(val) - 1) * this._settings.accumulator : val * this._settings.accumulator,
			// 9: SoftPlus
			softPlus: val => Math.log(1 + Math.exp(val)) * this._settings.accumulator
		};

		// Initialize parameters
		this.shape = shape;
		this.set_settings();

		// Initialize matrices
		this.initMatrices(shape);
	}

	/**
		* Initialize settings
	*/
	set_settings() {
		this._settings = {
			// Mutation rate
			mutationRate: 0.01,
			mutationRateMin: 0,
			mutationRateMax: 0.1,
			mutationRate$: true,
			// Accumulator the activation function get's mulitplyed with
			accumulator: 1,
			accumulatorMin: 0,
			accumulatorMax: 10,
			accumulator$: true,
			// Hidden layer activation function
			hFunction: this._functions.identity,
			hFunctionMin: 2,
			hFunctionMax: 9,
			hFunction$: true,
			// Output layer activation function
			oFunction: this._functions.identity,
			oFunctionMin: 2,
			oFunctionMax: 9,
			oFunction$: true,
		}
	}

	/**
		* Initialize matrices
	*/
	initMatrices() {
		/**
		* Make random biases
		* @param {number} nr Number of nodes on layer
		*/
		const makeBiases = (nr) => math.random([nr], -1, 1);
		/**
		* Make random weights
		* @param {number} nrP Number of nodes on previous layer
		* @param {number} nrN Number of nodes on next layer
		*/
		const makeWeights = (nrP, nrN) => math.random([nrN, nrP], -1, 1);

		// Initialize biases array with according length
		this.biases = new Array(this.shape.length - 1);
		// Initialize weights array with according length
		this.weights = new Array(this.shape.length - 1);

		// Iterate over layers and ...
		for (let i = 0; i < this.shape.length - 1; i++) {
			// ... make biases for each layer
			this.biases[i] = makeBiases(this.shape[i + 1]);
			// ... make weights inbetween each layer
			this.weights[i] = makeWeights(this.shape[i], this.shape[i + 1]);
		}
	}

	/**
		* Process the inputs with the NeuralNetwork
		* @param {number[]} inputs Array of input values
		* @returns {number[]} Array of output values
	*/
	guess(inputs) {
		// Iterate over layers and ...
		for (let i = 0; i < this.shape.length - 1; i++) {
			// ... multiply with layer weights
			inputs = math.multiply(this.weights[i], inputs);
			// ... add layer biases
			inputs = math.add(inputs, this.biases[i]);
			// ... rum layer activation function
			inputs = i < this.shape.length - 2 ? math.map(inputs, this._settings.hFunction) : math.map(inputs, this._settings.oFunction);
		}

		return inputs;
	}

	/**
		* Deep coppy NeuralNetwork
		* @returns {NeuralNetwork} Deep coppy of NeuralNetwork
	*/
	copy() {
		// Create new NeuralNetwork
		let nn = new NeuralNetwork(this.shape);

		// Iterate over layers and ...
		for (let i = 0; i < this.shape.length - 1; i++) {
			// ... deep copy all matrices
			nn.biases[i] = math.clone(this.biases[i]);
			nn.weights[i] = math.clone(this.weights[i]);
		}

		// Deep coppy settings
		nn._settings = Object.assign({}, this._settings);

		return nn;
	}

	/**
		* Mutate NeuralNetwork's weights and biases
		* @param {number} rate Mutation probabilty between 0(none) and 1(all)
	*/
	mutate(rate) {
		if (rate === undefined) rate = this._settings.mutationRate;

		// Return new random value between -1 and 1 or val using rate
		const mutate = val => rate > Math.random() ? val + math.random(-1, 1) : val;

		// Retrun random _function
		const random_function = (min, max) => {
			return this._functions[Object.keys(this._functions)[Math.floor(math.random(min, max))]];
		};

		// Iterate over layers and ...
		for (let i = 0; i < this.shape.length - 1; i++) {
			// ... and mutate all weights and biases
			this.biases[i] = math.map(this.biases[i], mutate);
			this.weights[i] = math.map(this.weights[i], mutate);
		}

		// Mutate mutationRate
		if (this._settings.mutationRate$ && rate > Math.random()) {
			this._settings.mutationRate = math.random(this._settings.mutationRateMin, this._settings.mutationRateMax);
		}

		// Mutate accumulator
		if (this._settings.accumulator$ && rate > Math.random()) {
			this._settings.accumulator = Math.floor(math.random(this._settings.accumulatorMin, this._settings.accumulatorMax));
		}

		// Mutate hFunction
		if (this._settings.hFunction$ && rate > Math.random()) {
			this._settings.hFunction = random_function(this._settings.hFunctionMin, this._settings.hFunctionMax);
		}

		// Mutate oFunction
		if (this._settings.oFunction$ && rate > Math.random()) {
			this._settings.oFunction = random_function(this._settings.oFunctionMin, this._settings.oFunctionMax);
		}
	}

	/**
		* Crossover two NeuralNetwork's weights and biases
		* @param {NeuralNetwork} a First NeuralNetwork to cross over
		* @param {NeuralNetwork} b Second NeuralNetwork to cross over
		* @returns {NeuralNetwork} New NeuralNetwork as combination of a and b
		* @static
	*/
	static crossOver(a, b) {
		// Deep copy a
		let nn = a.copy();

		// Crossover matrix a and b
		const cross = (a, b, nn) => {
			nn = math.clone(a);
			// Loop over the array
			for (let i = 0; i < a.length; i++) {
				// If 'a' is a matrix
				if (a[0].constructor === Array) {
					for (let j = 0; j < a[i].length; j++) {
						// Copy value of a or of b by random
						nn[i][j] = (0.5 > Math.random() ? a[i][j] : b[i][j]);
					}
				} else {
					nn[i] = (0.5 > Math.random() ? a[i] : b[i]);
				}
			}
		}

		// Iterate over layers and ...
		for (let i = 0; i < a.shape.length - 1; i++) {
			// ... crossover all matrices
			cross(a.biases[i], b.biases[i], nn.biases[i]);
			cross(a.weights[i], b.weights[i], nn.weights[i]);
		}

		// Crossover accumulator, hFunction and oFunction
		nn._settings.accumulator = 0.5 > Math.random() ? a._settings.accumulator : b._settings.accumulator;
		nn._settings.hFunction = 0.5 > Math.random() ? a._settings.hFunction : b._settings.hFunction;
		nn._settings.oFunction = 0.5 > Math.random() ? a._settings.hFunction : b._settings.oFunction;;

		return nn;
	}
}
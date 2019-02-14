const states = {
	pending: 'Pending',
	resolved: 'Resolved',
	rejected: 'Rejected'
};

class Nancy {
	constructor(executor) {
		const getCallback = state => value => {
			this.value = value;
			this.state = state;
		};

		const resolve = getCallback(states.resolved);
		const reject = getCallback(states.rejected);
		this.state = states.pending;
		try {
			executor(resolve, reject);
		} catch (error) {
			reject(error);
		}
	}

	static resolve(value) {
		return new Nancy(resolve => resolve(value));
	}

	static reject(value) {
		return new Nancy((_, reject) => reject(value));
	}
}

module.exports = {Nancy, states};

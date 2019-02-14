const states = {
	pending: 'Pending',
	resolved: 'Resolved',
	rejected: 'Rejected'
};

class Nancy {
	constructor(executor) {
		const members = {
			[states.resolved]: {
				state: states.resolved,
				then: onResolved => Nancy.resolve(onResolved(this.value))
			},
			[states.rejected]: {
				state: states.rejected,
				then: _ => this
			},
			[states.pending]: {
				state: states.pending
			}
		};
		const changeState = state => Object.assign(this, members[state]);
		const getCallback = state => value => {
			this.value = value;
			changeState(state);
		};

		const resolve = getCallback(states.resolved);
		const reject = getCallback(states.rejected);
		changeState(states.pending);
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

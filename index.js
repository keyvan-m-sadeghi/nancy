const states = {
	pending: 'Pending',
	resolved: 'Resolved',
	rejected: 'Rejected'
};

class Nancy {
	constructor(executor) {
		const tryCall = callback => Nancy.try(() => callback(this.value));
		const members = {
			[states.resolved]: {
				state: states.resolved,
				then: tryCall,
				catch: _ => this
			},
			[states.rejected]: {
				state: states.rejected,
				then: _ => this,
				catch: tryCall
			},
			[states.pending]: {
				state: states.pending
			}
		};
		const changeState = state => Object.assign(this, members[state]);
		const getCallback = state => value => {
			if (this.state === states.pending) {
				this.value = value;
				changeState(state);
			}
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

	static try(callback) {
		return new Nancy(resolve => resolve(callback()));
	}
}

module.exports = {Nancy, states};

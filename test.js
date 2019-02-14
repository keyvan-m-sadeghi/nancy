import test from 'ava';
import {Nancy, states} from '.';

test('empty executor results in a pending promise', t => {
	const p = new Nancy(() => {});
	t.is(p.state, states.pending);
});

const throwSomethingWrong = () => {
	throw new Error('Something went wrong...');
};

test('error thrown during resolve execution results in a rejected promise', t => {
	const p = new Nancy(throwSomethingWrong);
	t.is(p.state, states.rejected);
});

test('simple resolve and reject works', t => {
	let p = Nancy.resolve(42);
	t.is(p.state, states.resolved);
	t.is(p.value, 42);
	p = Nancy.reject(42);
	t.is(p.state, states.rejected);
	t.is(p.value, 42);
});

test('chain then sync', t => {
	const p = Nancy.reject(42)
		.then(() => 0)
		.then(() => 1)
		.then(() => 2);
	t.is(p.state, states.rejected);
	t.is(p.value, 42);

	Nancy.resolve(0)
		.then(value => {
			t.is(value, 0);
			return 1;
		})
		.then(value => {
			t.is(value, 1);
			return 2;
		})
		.then(value => {
			t.is(value, 2);
		});
});

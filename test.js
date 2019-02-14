import test from 'ava';
import {Nancy, states} from '.';

test('empty executor results in a pending promise', t => {
	const p = new Nancy(() => {});
	t.is(p.state, states.pending);
});

test('simple resolve works', t => {
	const p = Nancy.resolve(42);
	t.is(p.state, states.resolved);
	t.is(p.value, 42);
});

test('simple reject works', t => {
	const p = Nancy.reject(42);
	t.is(p.state, states.rejected);
	t.is(p.value, 42);
});

const throwSomethingWrong = () => {
	throw new Error('Something went wrong...');
};

test('error thrown during resolve execution results in a rejected promise', t => {
	const p = new Nancy(throwSomethingWrong);
	t.is(p.state, states.rejected);
});

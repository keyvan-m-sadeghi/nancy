import test from 'ava';
import {asyncCounter} from 'async-counter';
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
    let p = Nancy.reject(42)
        .then(() => 0)
        .then(() => 1)
        .then(() => 2);
    t.is(p.state, states.rejected);
    t.is(p.value, 42);

    p = Nancy.resolve(0)
        .then(value => {
            t.is(value, 0);
            return 1;
        })
        .then(value => {
            t.is(value, 1);
            return 2;
        })
        .then(throwSomethingWrong);
    t.is(p.state, states.rejected);
});

const anything = t => () => t.fail('anything should never be called.');

test.cb('chain catch sync', t => {
    Nancy.reject(42)
        .catch(error => error)
        .catch(anything(t))
        .then(throwSomethingWrong)
        .catch(throwSomethingWrong)
        .catch(() => t.end());
});

test('subsequent resolves and rejects are ignored', t => {
    const p = new Nancy((resolve, reject) => {
        reject(42);
        resolve(24);
        reject();
    });
    t.is(p.state, states.rejected);
    t.is(p.value, 42);
});

test.cb('unpack promise value on resolve, not reject', t => {
    Nancy.reject(Nancy.resolve(Nancy.reject(42)))
        .catch(value => {
            t.is(value instanceof Nancy, true);
            return value;
        })
        .catch(value => {
            t.is(value, 42);
            return value;
        })
        .then(value => t.is(value, 42))
        .then(() => Nancy.reject(24))
        .catch(value => t.is(value, 24))
        .then(() => t.end());
});

const delay = () => new Nancy(resolve => setTimeout(resolve, 500));

test.cb('chain then async', t => {
    delay()
        .then(delay)
        .then(delay)
        .then(() => t.end());
});

test.cb('chain catch async', t => {
    delay()
        .then(() => Nancy.reject())
        .catch(throwSomethingWrong)
        .catch(() => 42)
        .catch(anything(t))
        .then(value => t.is(value, 42))
        .then(delay)
        .then(throwSomethingWrong)
        .catch(() => t.end());
});

test.cb('multiple then on single promise', t => {
    const counter = asyncCounter(3, {onFinished: () => t.end()});
    const p = delay();
    p.then(counter.count);
    p.then(counter.count);
    p.then(delay).then(counter.count);
});

test.cb('multiple catch on single promise', t => {
    const counter = asyncCounter(3, {onFinished: () => t.end()});
    const p = delay()
        .then(() => Nancy.reject());
    p.then(anything(t));
    p.catch(counter.count);
    p.catch(counter.count);
    p.catch(delay).then(counter.count);
});

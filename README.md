# mocha-promise-me
[![Build Status](https://api.travis-ci.org/benjhess/mocha-promise-me.svg?branch=master)](https://travis-ci.org/benjhess/mocha-promise-me) [![Coverage Status](https://coveralls.io/repos/benjhess/mocha-promise-me/badge.svg?branch=master)](https://coveralls.io/github/benjhess/mocha-promise-me)

mocha-promise-me is a little helper to make mocha tests easier, when you want to:
* assert that a promise fails (but check the exception with an assertion)
* assert that a promise resolves (but run assertion(s) when it was resolved)

## The problem with promise testing
When you write an async test, you have 2 options with mocha:
1. Call the "done" callback function when the test is done
2. Return a promise

When you write an async test that asserts that a promise rejects, you can't use the "done" 
callback, because you can't run "done()" after your exception. You also can't just throw an exception
if the test fails. This will lead to an unresolved promise. 

For example:
```javascript
it('should test that a promise rejects', () =>{
  let promise = new Promise((resolve, reject) => resolve());
  
  promise
    .then(() => {
      throw Error('Promise should reject. Instead it resolved')
    })
});
```
Will output:
```bash
(node:2892) UnhandledPromiseRejectionWarning: Unhandled promise rejection (rejection id: 1): Error: Promise should reject. Instead it resolved
(node:2892) DeprecationWarning: Unhandled promise rejections are deprecated. In the future, promise rejections that are not handled will terminate the Node.js process with a non-zero exit code.
```

In this case you have to wrap this into a new promise and return it:
```javascript
it('should test that a promise rejects', () =>{
  let promise = new Promise((resolve, reject) => resolve());
  
  return new Promise((resolve, reject) => {
    promise
      .then(() => {
        reject(Error('Promise should reject. Instead it resolved'))
      })
      .catch((error) => resolve())
  });
});
```

Now mocha will fail this test and there will be no unhandled promise rejection warning:
```bash
  1) should test that a promise rejects

  0 passing (7ms)
  1 failing

  1)  should test that a promise rejects:
     Error: Promise should reject. Instead it resolved
     ...
```

While the solution above works, it will unnecessarily bloat up your test code and makes it unreadable. 
The more complex your test, the more unreadable it will get. For example: What happens when you want to
not only assert that a promise rejects, but also want to assert that a certain message was thrown?

```javascript
const assert = require('assert');

it('should test that a promise rejects', () =>{
  let promise = new Promise((resolve, reject) => reject(Error('Promise failed')));
  
  return new Promise((resolve, reject) => {
    promise
      .then(() => {
        reject(Error('Promise should reject. Instead it resolved'))
      })
      .catch((error) => {
        try {
          assert.equal('Promise failed', error.message);
          resolve();
        } catch(e) {
          reject(e);
        }
      })
  });
});
```

Well, that's not really readable, is it? And that's exactly where this module will come in handy :)

## The solution
The next time you have to write an async test that asserts that a promise rejects, you can just use
this module. Thus your code stays readable and you don't have to hassle with wrapping promises.

Instead of writing something like this:
```javascript
it('should test that a promise rejects', () =>{
  let promise = new Promise((resolve, reject) => resolve());
  
  return new Promise((resolve, reject) => {
    promise
      .then(() => {
        reject(Error('Promise should reject. Instead it resolved'))
      })
      .catch((error) => resolve())
  });
});
```

You can now do it this way:
```javascript
const promiseMe = require('mocha-promise-me');
it('should test that a promise rejects', () =>{
  let promise = new Promise((resolve, reject) => resolve());
  
  return promiseMe.thatYouReject(promise);
});
```

... and when you need to assert that a promise rejects with a certain message, you no longer have to do this:
```javascript
const assert = require('assert');

it('should test that a promise rejects', () =>{
  let promise = new Promise((resolve, reject) => reject(Error('Promise failed')));
  
  return new Promise((resolve, reject) => {
    promise
      .then(() => {
        reject(Error('Promise should reject. Instead it resolved'))
      })
      .catch((error) => {
        try {
          assert.equal('Promise failed', error.message);
          resolve();
        } catch(e) {
          reject(e);
        }
      })
  });
});
```

Instead you can simply write it like this now:
```javascript
const assert = require('assert');
const promiseMe = require('mocha-promise-me');

it('should test that a promise rejects', () =>{
  let promise = new Promise((resolve, reject) => reject(Error('Promise failed')));
  let assertion = (error) => assert.equal('Promise failed', error.message);
  return promiseMe.thatYouReject(promise, assertion);
});
```
### Test promises that should resolve 
You can also test, that a promise resolves with some additional assertions.

For Example:

```javascript
const assert = require('assert');
const promiseMe = require('mocha-promise-me');

it('should successfully return some data from the api', () => {
  let someApi = {
    getData: () => {
      return new Promise((resolve,reject) => {
        setTimeout(()=> resolve({
          success: true,
          data: []
        }), 10);
      });
    }
  }
  let assertion = (result) => {
    assert.ok(result);
    assert.equal(true, result.success);
  };
  return promiseMe.thatYouResolve(someApi.getData(), assertion);
});
```

Btw: You don't have to provide an assertion function. Same as with ```promiseMe.thatYouReject``` :)

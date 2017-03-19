let promiseMe = require('../index.js');
let assert = require('assert');

describe('promiseMe.thatYouReject', () => {
  it('should resolve when given promise rejects', () => {
    let rejectingPromise = new Promise((resolve, reject) => reject());
    return promiseMe.thatYouReject(rejectingPromise);
  });

  it('should reject when given promise resolves', () => {
    let resolvingPromise = new Promise((resolve, reject) => resolve());
    return new Promise((resolve, reject) => {
      promiseMe.thatYouReject(resolvingPromise)
        .then(() => {
          reject(Error('Did not reject as expected'))
        })
        .catch((error) => {
          try {
            assert.equal('Did not reject promise as expected', error.message);
            resolve();
          } catch (e) {
            reject(e)
          }
        })
    });
  });

  it('should resolve when given promise rejects and given assertion succeeds', () => {
    let rejectingPromise = new Promise((reject) => {throw Error('Promise was rejected')});
    let succeedingAssertion = (error) => assert.equal('Promise was rejected', error.message);
    return promiseMe.thatYouReject(rejectingPromise, succeedingAssertion);
  });

  it('should reject when given promise rejects but given assertion fails', () => {
    let rejectingPromise = new Promise((resolve, reject) => {throw Error('Promise was rejected')});
    let failingAssertion = (error) => {assert.equal('Other message', error.message)};
    return new Promise((resolve, reject) => {
      promiseMe.thatYouReject(rejectingPromise, failingAssertion)
        .then(() => {
          reject(Error('Did not reject as expected'))
        })
        .catch((error) => {
          resolve();
        })
    });
  });
});

describe('promiseMe.thatYouResolve', () => {
  it('should resolve when given promise resolves', () => {
    let resolvingPromise = new Promise((resolve, reject) => resolve());
    return promiseMe.thatYouResolve(resolvingPromise);
  });

  it('should reject when given promise rejects', () => {
    let resolvingPromise = new Promise((resolve, reject) => reject());
    return new Promise((resolve, reject) => {
      promiseMe.thatYouResolve(resolvingPromise)
        .then(() => {
          reject(Error('Did not reject as expected'))
        })
        .catch((error) => {
          resolve();
        })
    });
  });

  it('should resolve when given promise resolves and given assertion succeeds', () => {
    let resolvingPromise = new Promise((resolve, reject) => resolve());
    let succeedingAssertion = () => assert.equal(true,true);
    return promiseMe.thatYouResolve(resolvingPromise, succeedingAssertion);
  });

  it('should reject when given promise resolves but given assertion fails', () => {
    let resolvingPromise = new Promise((resolve, reject) => resolve());
    let failingAssertion = (error) => {assert.equal(true,false)};
    return new Promise((resolve, reject) => {
      promiseMe.thatYouResolve(resolvingPromise, failingAssertion)
        .then(() => {
          reject(Error('Did not reject as expected'))
        })
        .catch((error) => {
          resolve();
        })
    });
  });
});
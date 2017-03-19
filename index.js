let promiseMe = {
  thatYouReject: (promise, assertion) => {
    return new Promise((resolve, reject) => {
      promise
        .then(() => {
          reject(Error('Did not reject promise as expected'))
        })
        .catch((error) => {
          if (typeof assertion == 'function') {
            try {
              assertion(error);
            } catch (e) {
              reject(e);
            }
          }
          resolve();
        });
    }).catch((error) => {
      throw error
    });
  },
  thatYouResolve: (promise, assertion) => {
    return new Promise((resolve, reject) => {
      promise
        .then((result) => {
          if (typeof assertion == 'function') {
            try {
              assertion(result);
            } catch (e) {
              reject(e);
            }
          }
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
};

module.exports = promiseMe;
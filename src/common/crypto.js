const crypt = require('crypto');

module.exports =  function sha256(str) {
  return crypt.createHash('sha256').update(str).digest('hex');
};

module.exports =  function md5(str) {
  return crypt.createHash('md5').update(str).digest('hex');
};

'use strict';

const userHandler = require('./src/components/user/handler');
const authHandler = require('./src/components/auth/handler');

module.exports = Object.assign(
    authHandler,
    userHandler
);

'use strict';

const userHandler = require('./src/components/user/handler');
const authHandler = require('./src/components/auth/handler');
const myHandler = require('./src/components/my/handler');
const uploadHandler = require('./src/components/upload/handler');

module.exports = Object.assign(
    authHandler,
    userHandler,
    myHandler,
    uploadHandler,
);

'use strict';

const authRegister = require('./auth/auth-register');
const authLogin = require('./auth/auth-login');
const authDelete = require('./auth/auth-delete');
const userReadAll = require('./user/user-read-all');
const userGetOne = require('./user/user-get-one');
const userUpdate = require('./user/user-update');
const userDelete = require('./user/user-delete');


module.exports.authRegister = (event, context, callback) => {
    authRegister(event, (error, result) => {
        const response = {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin" : "*"
            },
            body: JSON.stringify(result),
        };
        context.succeed(response);
    });
};

module.exports.authLogin = (event, context, callback) => {
    authLogin(event, (error, result) => {
        const response = {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin" : "*"
            },
            body: JSON.stringify(result),
        };
        context.succeed(response);
    });
};

module.exports.authDelete = (event, context, callback) => {
    authDelete(event, (error, result) => {
        const response = {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin" : "*"
            },
            body: JSON.stringify(result),
        };
        context.succeed(response);
    });
};

module.exports.userReadAll = (event, context, callback) => {
    userReadAll(event, (error, result) => {
        const response = {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin" : "*"
            },
            body: JSON.stringify(result),
        };
        context.succeed(response);
    });
};

module.exports.userGetOne = (event, context, callback) => {
    userGetOne(event, (error, result) => {
        const response = {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin" : "*"
            },
            body: JSON.stringify(result),
        };
        context.succeed(response);
    });
};

module.exports.userUpdate = (event, context, callback) => {
    userUpdate(event, (error, result) => {
        const response = {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin" : "*"
            },
            body: JSON.stringify(result),
        };
        context.succeed(response);
    });
};

module.exports.userDelete = (event, context, callback) => {
    userDelete(event, (error, result) => {
        const response = {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin" : "*"
            },
            body: JSON.stringify(result),
        };
        context.succeed(response);
    });
};




'use strict';

const userReadAll = require('./user-read-all');
const userGetOne = require('./user-get-one');
const userUpdate = require('./user-update');
const userDelete = require('./user-delete');

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


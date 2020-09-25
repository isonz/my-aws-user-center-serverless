'use strict';

const authRegister = require('./auth-register');
const authLogin = require('./auth-login');
const authDelete = require('./auth-delete');

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
    const headers = {"Access-Control-Allow-Origin": "*"};
    authLogin(event, (error, result) => {
        if (error){
            callback(error);
            context.succeed({
                statusCode: error.statusCode,
                headers: headers,
                body: error.code
            });
        }else {
            const response = {
                statusCode: 200,
                headers: headers,
                body: JSON.stringify(result),
            };
            context.succeed(response);
        }
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

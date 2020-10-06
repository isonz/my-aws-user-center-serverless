'use strict';
const config = require('./base');
const authRegister = require('./auth-register');
const authLogin = require('./auth-login');
const authDelete = require('./auth-delete');

let response = {
    headers: config.HEADERS,
    statusCode: 200,
    body: {},
};

module.exports.authRegister = (event, context, callback) => {
    authRegister(event, (error, result) => {
        // console.log(error, result);
        if (error){
            // callback(error);
            response.statusCode = error.statusCode;
            response.body = error.code;
        }else {
            response.body = JSON.stringify(result);
        }
        context.succeed(response);
    });
};

module.exports.authLogin = (event, context, callback) => {
    authLogin(event, (error, result) => {
        if (error){
            callback(error);
            context.succeed({
                statusCode: error.statusCode,
                headers: config.HEADERS,
                body: error.code
            });
        }else {
            response.body = JSON.stringify(result);
            context.succeed(response);
        }
    });
};

module.exports.authDelete = (event, context, callback) => {
    authDelete(event, (error, result) => {
        const response = {
            statusCode: 200,
            headers: config.HEADERS,
            body: JSON.stringify(result),
        };
        context.succeed(response);
    });
};

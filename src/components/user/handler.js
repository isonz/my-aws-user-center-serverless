'use strict';
const config = require('./base');
const userReadAll = require('./user-read-all');
const userGetOne = require('./user-get-one');
const userUpdate = require('./user-update');
const userDelete = require('./user-delete');
const authHeader = require( '../../helpers/auth-header');

module.exports.userReadAll = (event, context, callback) => {
    let response = authHeader(event, callback);
    if(200 === response.statusCode){
        userReadAll(event, (error, result) => {
            if (error){
                response.statusCode = error.statusCode;
                response.body = error.code;
            }else {
                response.body = JSON.stringify(result);
            }
            context.succeed(response);
        });
    }else{
        context.succeed(response);
    }
};

module.exports.userGetOne = (event, context, callback) => {
    let response = authHeader(event, callback);
    if(200 === response.statusCode){
        userGetOne(event, (error, result) => {
            const response = {
                body: JSON.stringify(result),
            };
            context.succeed(response);
        });
    }else{
        context.succeed(response);
    }
};

module.exports.userUpdate = (event, context, callback) => {
    let response = authHeader(event, callback);
    if(200 === response.statusCode){
        userUpdate(event, (error, result) => {
            const response = {
                body: JSON.stringify(result),
            };
            context.succeed(response);
        });
    }else{
        context.succeed(response);
    }
};

module.exports.userDelete = (event, context, callback) => {
    let response = authHeader(event, callback);
    if(200 === response.statusCode){
        userDelete(event, (error, result) => {
            const response = {
                body: JSON.stringify(result),
            };
            context.succeed(response);
        });
    }else{
        context.succeed(response);
    }
};


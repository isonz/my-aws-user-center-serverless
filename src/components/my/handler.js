'use strict';

const myGet = require('./my-get');
const myUpdate = require('./my-update');
const authHeader = require( '../../helpers/auth-header');

module.exports.myGet = (event, context, callback) => {
    let response = authHeader(event, callback);
    if(200 === response.statusCode){
        myGet(event, (error, result) => {
            const response = {
                body: JSON.stringify(result),
            };
            context.succeed(response);
        });
    }else{
        context.succeed(response);
    }
};

module.exports.myUpdate = (event, context, callback) => {
    let response = authHeader(event, callback);
    if(200 === response.statusCode){
        myUpdate(event, (error, result) => {
            const response = {
                body: JSON.stringify(result),
            };
            context.succeed(response);
        });
    }else{
        context.succeed(response);
    }
};


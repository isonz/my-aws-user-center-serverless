'use strict';

const upload = require('./upload');
const authHeader = require( '../../helpers/auth-header');

module.exports.upload = (event, context, callback) => {
    let response = authHeader(event, callback);
    if(200 === response.statusCode){
        upload(event, (error, result) => {
            console.log(result);
            const response = {
                body: JSON.stringify(result),
            };
            context.succeed(response);
        });
    }else{
        context.succeed(response);
    }
};


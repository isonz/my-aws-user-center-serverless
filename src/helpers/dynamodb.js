'use strict';

const AWS = require('aws-sdk');
let options = {};

// console.log(process.env.IS_OFFLINE);
if (process.env.IS_OFFLINE) {
    options = {
        region: 'localhost',
        endpoint: 'http://localhost:8000',
    };
}

const dynamoDb = new AWS.DynamoDB.DocumentClient(options);
module.exports = dynamoDb;

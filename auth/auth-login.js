'use strict';

const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports = (event, callback) => {
  const params = {
    TableName: 'auth',
    Key: {
      username: event.pathParameters.username,
      password: event.pathParameters.password,
    }
  };
  return dynamoDb.get(params, (error, data) => {
    if (error) {
      callback(error);
    }
    callback(error, data.Item);
  });
};

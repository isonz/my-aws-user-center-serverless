'use strict';
const dynamoDb = require('../../helpers/dynamodb');
const config = require('./base');

module.exports = (event, callback) => {
  const params = {
    TableName : config.TableName,
    Key: {
      id: event.pathParameters.id
    }
  };
  return dynamoDb.delete(params, (error, data) => {
    if (error) {
      callback(error);
    }
    callback(error, params.Key);
  });
};

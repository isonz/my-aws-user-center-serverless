'use strict';
const dynamoDb = require('../../helpers/dynamodb');
const config = require('./base');

module.exports = (event, callback) => {
  const params = {
    TableName: config.TableName,
    Key: {
      id: event.pathParameters.id
    }
  };
  return dynamoDb.get(params, (error, data) => {
    if (error) {
      callback(error);
    }
    callback(error, data.Item);
  });
};

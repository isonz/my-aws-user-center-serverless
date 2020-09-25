'use strict';
const dynamoDb = require('../../helpers/dynamodb');
const config = require('./base');

module.exports = (event, callback) => {
  const params = {
    TableName: config.TableName,
  };

  return dynamoDb.scan(params, (error, data) => {
    if (error) {
      callback(error);
    }
    callback(error, data.Items);
  });
};

'use strict';
const dynamoDb = require('../../helpers/dynamodb');
const config = require('./base');

module.exports = (event, callback) => {
  let data = JSON.parse(event.body).data;

  const params = {
    TableName: config.TableName,
    Key: {
      username: data.username,
      password: data.password,
    }
  };
  return dynamoDb.get(params, (error, data) => {
    if (error) {
      callback(error);
    }
    callback(error, data.Item);
  });
};

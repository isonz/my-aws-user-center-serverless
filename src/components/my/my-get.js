'use strict';

const dynamoDb = require('../../helpers/dynamodb');
const config = require('./base');
const authId = require( '../../helpers/auth-id');

module.exports = (event, callback) => {
  const params = {
    TableName: config.TableName,
    Key: {
      id: authId(event, callback),
    }
  };
  return dynamoDb.get(params, (error, data) => {
    if (error) {
      callback(error);
    }
    const item = {
      avatar: data.Item.avatar,
      createdAt: data.Item.createdAt,
      email: data.Item.email,
      id: data.Item.id,
      username: data.Item.username,
    };
    callback(error, item);
  });
};

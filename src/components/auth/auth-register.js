'use strict';
const dynamoDb = require('../../helpers/dynamodb');
const config = require('./base');
const uuid = require('uuid');

module.exports = (event, callback) => {
  const body = JSON.parse(event.body);
  let data = body.data;
  data.id = uuid.v1();
  data.createdAt = new Date().getTime();
  //console.log(data);

  const params = {
    TableName: config.TableName,
    Item: data
  };

  return dynamoDb.put(params, (error, data) => {
    if (error) {
      callback(error);
    }
    callback(error, params.Item);
  });
};

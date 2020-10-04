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

  return dynamoDb.get(params, (error, result) => {
    if (error) {
      callback(error);
      return null;
    }

    const updateItem = JSON.parse(event.body);
    result.Item.updatedAt = new Date().getTime();
    const allData = Object.assign(
        result.Item,
        updateItem,
    );

    const putParams = {
      TableName : config.TableName,
      Item: allData
    };

    dynamoDb.put(putParams, (error, data) => {
      if (error) {
        callback(error);
        return null;
      }

      const item = {
        avatar: allData.avatar,
        createdAt: allData.createdAt,
        email: allData.email,
        id: allData.id,
        username: allData.username,
      };

      callback(error, item);
    });
  });
};




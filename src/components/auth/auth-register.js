'use strict';

const func = require("../../common/functions");
const sha256 = require("../../common/crypto");

const dynamoDb = require('../../helpers/dynamodb');
const config = require('./base');
const err = require('../../common/errors');
const uuid = require('uuid');
const jwt = require('jsonwebtoken');

module.exports = (event, callback) => {
  const body = JSON.parse(event.body);
  let eventData = body.data;
  eventData.id = uuid.v1();
  eventData.createdAt = new Date().getTime();

  const username = eventData.username;
  let password = eventData.password;
  if('undefined' === typeof username|| !username) callback(null, err.errors(10101));
  if('undefined' === typeof password|| !password) callback(null, err.errors(10102));

  const slat = func.randomString(10);
  eventData.slat = slat;
  password = sha256(password + slat);
  eventData.password = password;

  const dbQueryParams = {
    TableName: config.TableName,
    // Key : username,
    IndexName : 'username-index',
    ExpressionAttributeValues : {':username': username,},
    KeyConditionExpression : 'username = :username',
  };
  const dbPutParams = {
    TableName: config.TableName,
    Item: eventData,
  };
  // console.log(dbQueryParams);
  // console.log(dbPutParams);


  return dynamoDb.query(dbQueryParams, (error, result) => {
    if (error) callback(error);

    //console.log(result);
    if (!result || result.Count < 1){
      return dynamoDb.put(dbPutParams, (error, regResult) => {
        if (error) callback(error);

        const token = jwt.sign({
          exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24),    //one day
          data: dbPutParams.Item.id
        }, process.env.JWT_SECRET);

        const regData = {
          id: dbPutParams.Item.id,
          username: dbPutParams.Item.username,
          token
        };

        callback(error, regData);
      });
    }

    callback(error, err.errors(10001));
  });

};

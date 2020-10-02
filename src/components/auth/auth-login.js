'use strict';

const sha256 = require("../../common/crypto");
const dynamoDb = require('../../helpers/dynamodb');
const config = require('./base');
const err = require('../../common/errors');
const jwt = require('jsonwebtoken');

module.exports = (event, callback) => {
  const body = JSON.parse(event.body);
  let eventData = body.data;

  const username = eventData.username;
  let password = eventData.password;
  if('undefined' === typeof username|| !username) callback(null, err.errors(10101));
  if('undefined' === typeof password|| !password) callback(null, err.errors(10102));

  const dbQueryParams = {
    TableName: config.TableName,
    IndexName : 'username-index',
    ExpressionAttributeValues : {':username': username,},
    KeyConditionExpression : 'username = :username',
  };

  return dynamoDb.query(dbQueryParams, (error, result) => {
    try {
      if (error){
        callback(error);
        return null;
      }
      if (!result || result.Count < 1){
        callback(error, err.errors(10103));
        return null;
      }
      result = result.Items[0];

      //console.log(result);
      const resultPassword = result.password;
      const slat = result.slat;
      password = sha256(password + slat);
      //console.log(password, resultPassword);
      if(password !== resultPassword){
        callback(error, err.errors(10104));
        return null;
      }

      // console.log(process.env.JWT_SECRET);
      const token = jwt.sign({
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24),    //one day
        data: result.id
      }, process.env.JWT_SECRET);

      const loginData = {
        id: result.id,
        username:result.username,
        token
      };

      callback(error, loginData);
    }catch (e) {
      //console.log(e);
      callback({statusCode: 400, code: "catch error"});
    }
  });
};

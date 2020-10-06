'use strict';
const dynamoDb = require('../../helpers/dynamodb');
const config = require('./base');

// /user/all?lastId=8d551010-02f4-11eb-958f-ab94ee35eb83
module.exports = (event, callback) => {
  let lastId = '';
  let pageSize = 50;
  if('undefined' !== typeof event.queryStringParameters){
    lastId = 'undefined' === typeof event.queryStringParameters.lastId ? '' : event.queryStringParameters.lastId;
    pageSize = 'undefined' === typeof event.queryStringParameters.pageSize ? 50 : event.queryStringParameters.pageSize;
  }
  // console.log(lastId);
  // console.log(pageSize);

  let params = {
    TableName: config.TableName,
    //IndexName: "username-index",
    Limit: pageSize,
    //ScanIndexForward: true,
    //ExclusiveStartKey: { id: '73961610-0141-11eb-ac2b-bb6c22e6b24c' },
  };
  if(lastId) params.ExclusiveStartKey = { id: lastId };


  return dynamoDb.scan(params, (error, result) => {
    if (error) {
      callback(error);
    }
    //console.log(result);
    if('undefined' === typeof result.LastEvaluatedKey) result.LastEvaluatedKey = {};
    callback(error, result);
  });
};




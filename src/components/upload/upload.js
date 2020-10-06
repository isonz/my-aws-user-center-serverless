'use strict';

const fetch = require('node-fetch');
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const authId = require( '../../helpers/auth-id');


module.exports = (event, callback) => {
  const fileBody = event.body;
  const userId = authId(event, callback);

  const getParams = {
    Bucket: process.env.BUCKET,
    Key: userId+'-avatar',
  };
  let putParams = getParams;
  putParams.Body = fileBody;

  s3.upload(putParams, function(err, data){
    if(err) {
      callback(err, null);
    } else {
      callback(null, data);
    }
  });

  // s3.getObject(getParams, function(err, data){
  //   if(err) {
  //     callback(err, null);
  //   } else {
  //     callback(null, data);
  //   }
  // });

  // const data = {
  //   ETag: '"c36ae3e21ccfc89a76aac83b4b729bb2"',
  //   Location: 'https://my-aws-user-center-server-upload-dev.s3.amazonaws.com/5dc14ff0-04af-11eb-bab3-6baa8e21290e-avatar',
  //   key: '5dc14ff0-04af-11eb-bab3-6baa8e21290e-avatar',
  //   Key: '5dc14ff0-04af-11eb-bab3-6baa8e21290e-avatar',
  //   Bucket: 'my-aws-user-center-server-upload-dev'
  // }
  //
  // callback(null, data);

};


/**

 module.exports.save = (event, context, callback) => {
  fetch(event.image_url)
    .then((response) => {
      if (response.ok) {
        return response;
      }
      return Promise.reject(new Error(
            `Failed to fetch ${response.url}: ${response.status} ${response.statusText}`));
    })
    .then(response => response.buffer())
    .then(buffer => (
      s3.putObject({
        Bucket: process.env.BUCKET,
        Key: event.key,
        Body: buffer,
      }).promise()
    ))
    .then(v => callback(null, v), callback);
};


 */

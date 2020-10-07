'use strict';

const mime = require('mime-types');
//const fetch = require('node-fetch');
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const authId = require( '../../helpers/auth-id');
const {parse} = require('aws-multipart-parser');

module.exports = (event, callback) => {
  const formData = parse(event, true);
  const avatarData = 'undefined' === typeof formData.avatar ? null : formData.avatar;
  if (!avatarData) return null;

  const contentType = avatarData.contentType;
  //const filename = avatarData.filename;
  const content = avatarData.content;

  const extension = contentType ? mime.extension(contentType) : '';
  const userId = authId(event, callback);
  const fullFileName = extension ? `${userId}.${extension}` : `${Date.now()}`;

  const putParams = {
    Bucket: process.env.BUCKET,
    Key: 'avatar/'+fullFileName,
    Body: content,
  };

  s3.upload(putParams, function(err, data){
    if(err) {
      callback(err, null);
    } else {
      callback(null, data);
    }
  });

  // const getParams = {
  //     Bucket: process.env.BUCKET,
  //     Key: 'avatar/'+fullFileName,
  // };
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

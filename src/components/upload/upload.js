'use strict';

const authId = require( '../../helpers/auth-id');


module.exports = (event, callback) => {
  // console.log(event.body);
  // const body = JSON.parse(event.body);
  // let eventData = body.data;
  //
  // console.log(eventData);
  // const userId = authId(event, callback);
  //
  // return eventData;
  const data = {
    "name": "avatar.png",
    "status": "done",
    "url": "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
  };

  callback(null, data);

};




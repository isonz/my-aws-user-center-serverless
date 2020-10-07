const jwt = require('jsonwebtoken');

module.exports = (event, callback) => {
    const authorization = 'undefined' === typeof event.headers.Authorization ? ('undefined' === typeof event.headers.authorization ? null: event.headers.authorization) : event.headers.Authorization;
    //console.log(authorization);
    let jwtInfo;
    try {
        jwtInfo = jwt.verify(authorization, process.env.JWT_SECRET);
    } catch(err) {
        jwtInfo = null;
        //callback(err);
    }
    //console.log(jwtInfo);
    if(!jwtInfo) return null;
    return jwtInfo.data;
};

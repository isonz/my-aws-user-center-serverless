const jwt = require('jsonwebtoken');

module.exports = (event, callback) => {
    const authorization = 'undefined' === typeof event.headers.Authorization ? null : event.headers.Authorization;
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

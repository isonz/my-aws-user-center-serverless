const jwt = require('jsonwebtoken');

let response = {
    headers: {"Access-Control-Allow-Origin": "*"},
    statusCode: 200,
    body: {},
};

module.exports.userId = (event, callback) => {
    const authorization = 'undefined' === typeof event.headers.Authorization ? null : event.headers.Authorization;
    let jwtInfo;
    try {
        jwtInfo = jwt.verify(authorization, process.env.JWT_SECRET);
    } catch(err) {
        jwtInfo = null;
        //callback(err);
    }
    console.log(jwtInfo);
    if(!jwtInfo) return null;
    return jwtInfo.data;
};

module.exports.authHeader = (event, callback) => {
    const userId = userId(event, callback);
    if(!userId) response.statusCode = 403;
    return response;
};

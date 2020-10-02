const userId = require( './auth-id');

let response = {
    headers: {"Access-Control-Allow-Origin": "*"},
    statusCode: 200,
    body: '',
};

module.exports = (event, callback) => {
    const id = userId(event, callback);
    //console.log(id);
    if(!id) response.statusCode = 403;
    return response;
};

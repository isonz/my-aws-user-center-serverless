//import {nowStr} from './libTime';

export const ApiResponseUtf8 = (event, body='', code=200, mimeType="text/html") => (
  { response: buildResponse(event, code, body, 0, mimeType) }
);
export const ApiResponseBinary = (event, base64Body='', code=200, mimeType='application/octet-stream') => (
  { response: buildResponse(event, code, base64Body, 1, mimeType) }
);
export const ApiResponseDownload = (event, body='', code=200, fileName,
  mimeType='application/octet-stream', isBase64=1) => (
  { response: buildResponse(event, code, body, isBase64, mimeType, fileName) }
);
export const ApiSuccess = (event, body, code=200) => (
  { event, body, code, success:1 } /* default mimetype json */
);
export const ApiFailure = (event, body, code=500) => (
  { event, body, code, success:0 } /* default mimetype json */
);
export function success(event, body, code=200) { return buildResponse(event, code, body); }
export function failure(event, body, code=500) { return buildResponse(event, code, body); }

function buildResponse(event, statusCode, body, isBase64, mimeType, fileName) {
  var orig = '*';
  if(event)
    if(event.headers)
      if(event.headers.origin)
        orig = event.headers.origin;
  const headers = {
    "Access-Control-Allow-Origin" : orig, // user Cookie need exact origin from request
    //"Access-Control-Allow-Origin" : "*", // Required for CORS support to work
    "Access-Control-Allow-Credentials" : true, // Required for cookies, authorization headers with HTTPS
    //"Set-Cookie": 'mySetCookie='+nowStr(),
    Server: 'noDisclose',
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'no-store', //'no-cache'
    'Expect-CT': 'max-age=86400, enforce',
    'X-XSS-Protection': '1; mode=block',
    'X-Frame-Options': 'SAMEORIGIN',
  };
  //debugLog('buildResponse()', {isBase64, body, mimeType, fileName});
  headers['Content-Type'] = mimeType||'application/json; charset=UTF-8'; //if(mimeType)  headers['Content-Type'] = mimeType; //default text/JSON
  if(fileName)  headers['Content-Disposition'] = 'attachment; filename="'+fileName+'"';
  const response = { statusCode, headers, body:(
    isBase64?body:
    mimeType?body:
    JSON.stringify(body)) //no mimetype, not base64 --> assume json
  };
  if(isBase64) response.isBase64Encoded = true;
  return response;
}

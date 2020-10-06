import fs from 'fs';

import { toStr } from '../libs/libType';
import { debugLog } from "../libs/libFormat";

export const fileExt = (n) => { return toStr(n).split('.').pop().trim().toLowerCase(); };

export const streamToBuffer = async (stream) => {
  //Read a whole stream into buffer
  return new Promise((resolve, reject) => {
    try {
      var buffers = [];
      stream.on('data', data => buffers.push(data));
      stream.on('end', () => {
        var buffer = Buffer.concat(buffers);
        resolve(buffer);
      });
    } catch (err) {
      reject(err);
    }
  });
};

export const S3CreateReadStream = (s3, Bucket, Key) => {
  return s3.getObject({ Bucket, Key }).createReadStream();
};

//todo Trunk Big S3 Access use: s3.getObjectMetadata({Bucket, Key}).getContentLength()
//var readStream = s3.getObject(new GetObjectRequest({Bucket, Key}).withRange(0, 999)).getObjectContent()

export const S3ReadFile = async (s3, Bucket, Key) => {
  const resp = await s3.getObject({ Bucket, Key }).promise();
  //debugLog({S3ReadFile:{Bucket, Key}});
  //debugLog({S3ReadFile:resp});
  return resp.Body;
};

/*
const CopyStream = (readStream, writeStream, cb) => {
  const wstream = fs.createWriteStream('myFileToWriteTo');
  const rstream = fs.createReadStream('myFileToReadFrom');
  // Every time readstream reads (Listen to stream events)
  rstream.on('data', chunk => {
    // progress += chunk.length
  });
  rstream.on('end', () => { cb(); });
  rstream.pipe(wstream);
}
*/


export const S3DeleteObj = async (s3, Bucket, Key) => {
  if (process.env.cfg === 'offline') {
    debugLog({ Func: 'S3DeleteObj() offline', Bucket, Key });
    return;
  }
  if (!s3 || !Bucket || !Key) return;
  try {
    await s3.deleteObject({ Bucket, Key }).promise();
  } catch (e) { console.error(e); };
};

export const S3WriteBuffer = async (s3, Bucket, Key, bin, publicRead = 0) => {
  if (process.env.cfg === 'offline') {
    debugLog({ Func: 'S3WriteBuffer() offline', Bucket, Key });
    fs.writeFileSync('../oupcardreact/public/fakes3/'+Key, bin);
    //fs.writeFileSync('../../x_import_sample/1/Pikachu dec2.jpg', Body);
    return;
  }
  const ACL = publicRead ? 'public-read' : 'bucket-owner-full-control';
  const params = {
    Bucket, Key, /* required */
    Body: bin, //Buffer.from('...') || 'STRING_VALUE' || streamObject,
    ContentType: 'binary',   // TODO: application/octet-stream for binary
    //ContentEncoding: 'utf8', //TODO: NO encoding for binary
    ACL, //private |  | public-read-write | authenticated-read | aws-exec-read | bucket-owner-read | ,
    //CacheControl: 'STRING_VALUE',
    //ContentDisposition: 'STRING_VALUE',
    //ContentLanguage: 'STRING_VALUE',
    //ContentLength: 'NUMBER_VALUE',
    //ContentMD5: 'STRING_VALUE',
    //Expires: new Date || 'Wed Dec 31 1969 16:00:00 GMT-0800 (PST)' || 123456789,
    //GrantFullControl: 'STRING_VALUE',
    //GrantRead: 'STRING_VALUE',
    //GrantReadACP: 'STRING_VALUE',
    //GrantWriteACP: 'STRING_VALUE',
    //Metadata: {
    //'<MetadataKey>': 'STRING_VALUE',
    //'<MetadataKey>': ...
    //},
    //ObjectLockLegalHoldStatus: ON | OFF,
    //ObjectLockMode: GOVERNANCE | COMPLIANCE,
    //ObjectLockRetainUntilDate: new Date || 'Wed Dec 31 1969 16:00:00 GMT-0800 (PST)' || 123456789,
    //RequestPayer: requester,
    //SSECustomerAlgorithm: 'STRING_VALUE',
    //SSECustomerKey: Buffer.from('...') || 'STRING_VALUE' /* Strings will be Base-64 encoded on your behalf */,
    //SSECustomerKeyMD5: 'STRING_VALUE',
    //SSEKMSEncryptionContext: 'STRING_VALUE',
    //SSEKMSKeyId: 'STRING_VALUE',
    //ServerSideEncryption: AES256 | aws:kms,
    //StorageClass: STANDARD | REDUCED_REDUNDANCY | STANDARD_IA | ONEZONE_IA | INTELLIGENT_TIERING | GLACIER | DEEP_ARCHIVE,
    //Tagging: 'STRING_VALUE',
    //WebsiteRedirectLocation: 'STRING_VALUE'
  };
  return s3.putObject(params).promise();
  /*
  return new Promise((resolve, reject) => {
    s3.putObject(params, function(err, data) {
      if (err){
        debugLog('S3WriteBuffer()err:', err, err.stack); // an error occurred
        reject(err);
      }else{
        debugLog('S3WriteBuffer()data:', data); // successful response
        resolve(data);
      }
    });
  });
  */
};

//https://github.com/aws/aws-sdk-js/issues/2741
//https://medium.com/@tsunghualee/how-to-upload-download-file-to-aws-s3-using-pre-signed-url-e38fa11562c2
export const S3SignDownload = async (s3, Bucket, Key) => {
  if (!Key) return '';
  if (process.env.cfg === 'offline') return '/fakes3/' + Key;
  const params = {
    Bucket,
    Key,
    Expires: 3600,
    //VersionId: versionId, //we use S3 versioning
    //ResponseContentType: 'image/png'
    //for put - ContentType: 'application/pdf', //pdf
    //for put - ACL: 'public-read'
  };
  return new Promise((resolve, reject) => {
    s3.getSignedUrl('getObject', params, function (err, url) {
      if (err) {
        reject(err);
      } else {
        resolve(url);
      }
    });
  });
};

export const S3SignUpload = async (s3, Bucket, key,
  Fields = {}, Expires = 3600, minSize = 0, maxSize = 10000000) => {
  // s3.getSignedUrl()
  //https://softwareontheroad.com/aws-s3-secure-direct-upload/
  //https://docs.aws.amazon.com/AmazonS3/latest/API/sigv4-post-example.html
  /*aws.config.update({
     signatureVersion: 'v4',
     region: 'eu-central-1',
     accessKeyId: config.aws.keyId,
     secretAccessKey: config.aws.keySecret
  });*/
  const params = {
    Bucket,
    Expires: 3600,
    Fields: { ...Fields, key },
    Conditions: [
      ['content-length-range', minSize, maxSize],
      //['acl', 'public-read'],
      //['eq', '$Content-Type', 'image/jpeg'], //upload type fix
      //['starts-with', '$Content-Type', 'image/'], //upload type wildcard
      //['starts-with', '$key', 'testdir/'], // interploated key
      //["starts-with", "$x-amz-meta-tag", ""],
      //{"success_action_redirect": "http://sigv4examplebucket.s3.amazonaws.com/successful_upload.html"},
      //{"x-amz-meta-uuid": "14365123651274"},
      //{"x-amz-server-side-encryption": "AES256"},
      //{"x-amz-credential": "AKIAIOSFODNN7EXAMPLE/20151229/us-east-1/s3/aws4_request"},
      //{"x-amz-algorithm": "AWS4-HMAC-SHA256"},
      //{"x-amz-date": "20151229T000000Z" }
    ],
  };
  return s3.createPresignedPost(params);
};

export const S3ListObjects = async (s3, Bucket) => {
  return s3.listObjects({ Bucket }).promise();
};

export const S3ObjectExist = (s3, bucket, key) => {
  return new Promise((resolve, reject) => {
    try {
      const params = {
        Bucket: bucket,
        Key: key
      };

      s3.headObject(params, (err, data) => {
        if (err) resolve(false);
        resolve(true);
      });
    } catch (error) {
      debugLog('Exception: ', error.code);
      reject(error);
    };
  });
};

export const listDir = async (path) => {
  await new Promise(resolve => {
    //CWD is .webpack/{apiname}/
    fs.readdir(path, function (err, files) {
      debugLog('err', err);
      debugLog('files', files);
      resolve();
    });
  });
};

import AWS from "aws-sdk";
import http from "http";
import {getEnvs} from './apis/appEnv';

export const baseCfg = () => {
    const cfg = { region: process.env.awsRegion, };
    if(process.env.awsAccessKeyId) cfg.accessKeyId = process.env.awsAccessKeyId;
    if(process.env.awsSecretAccessKey) cfg.secretAccessKey = process.env.awsSecretAccessKey;
    return cfg;
};
//debugLog({baseCfg:baseCfg()});
AWS.config.update(baseCfg());

const syncCfg = async () => {
    const {content_syncRegion, content_syncAccessKeyId, content_syncSecretAccessKey} = await getEnvs(
        ['content_syncRegion', 'content_syncAccessKeyId', 'content_syncSecretAccessKey']);
    return {
        region: content_syncRegion,
        accessKeyId: content_syncAccessKeyId,
        secretAccessKey: content_syncSecretAccessKey,
    };
};

export const newSES = async () => {
    const {notification_sesRegion, notification_sesAccessKeyId, notification_sesSecretAccessKey} = await getEnvs(
        ['notification_sesRegion', 'notification_sesAccessKeyId', 'notification_sesSecretAccessKey']);
    const sesCfg = {
        //apiVersion: '2010-12-01',
        region: notification_sesRegion,
        accessKeyId: notification_sesAccessKeyId,
        secretAccessKey: notification_sesSecretAccessKey,
    };
    return new AWS.SES(sesCfg);
};

export const newSSM = (extraCfg={}) => (new AWS.SSM({
    ...baseCfg(), ...extraCfg
}));

export const newLambda = () => {
    return (process.env.cfg === 'offline')? 
    new AWS.Lambda({
        apiVersion: '2020',
        endpoint: process.env.awsLambdaEndpoint,
        httpOptions: {agent: new http.Agent({})}
    }):
    new AWS.Lambda({
        apiVersion: '2020',
        endpoint: process.env.awsLambdaEndpoint
    });
};

export const newS3 = () => (new AWS.S3({ 
    ...baseCfg(),
    apiVersion: '2006-03-01', 
}));

export const newSyncS3 = async () => (new AWS.S3({ 
    apiVersion: '2006-03-01', 
    ...(await syncCfg())
}));

export const newDynamo = () => {
    const {dynamoRegion, dynamoHost} = process.env; 
    if(dynamoRegion && dynamoHost){
        const ddbCfg = { region:dynamoRegion, 
            endpoint:new AWS.Endpoint(dynamoHost), 
            httpOptions: {agent: new http.Agent({})}};
        //const ddbCfg = { region:'ap-east-1', endpoint:dynamoHost, };
        //debugLog("newDynamo()", ddbCfg);
        return new AWS.DynamoDB.DocumentClient(ddbCfg);
    }
    return new AWS.DynamoDB.DocumentClient({
        ...baseCfg(),
    });
};

export const newSyncDynamo = async () => {
    return new AWS.DynamoDB.DocumentClient({
        ...(await syncCfg())
    });
};

import crypto from "crypto";
//import * as ddb from '../libs/libDynamo';
import {toInt} from '../libs/libType';
import {debugLog} from '../libs/libFormat';

const _lockTable = process.env.tableNameLock; //stage+'-oup-card-lock';
const _partitionKey = 'id';
const _lockExpiryMs = 5000; // lock expiry if not re-lock (heartbeat + tolerance)
const _heartbeatMs = 1000; // re-lock interval
const _retryMs = 500; // Retry Lock when Blocked
const _retryCount = 180; // Retry Before Give up

//Delete the Lock, on the Lock is currently belong to me
const putLock = async (lock, ttl, expiry, now) => {
    const params = {
        TableName: _lockTable,
        Item:{
            [_partitionKey]: lock.id,
            ttl,
            expiry,
            rng: lock.rng,
        },
        ConditionExpression: " attribute_not_exists(#partitionKey) or (expiry < :expiry) or (rng= :rng) ",
        ExpressionAttributeNames: { "#partitionKey": _partitionKey },
        ExpressionAttributeValues: { ':rng': lock.rng, ':expiry': now, },
    };
    //debugLog('tryLockAcquire', {params});
    return lock.ddb.put(params).promise();
};

export const LockRelease = async(lock) => {
    if(!lock){
        debugLog('LockRelease, ERROR missing Lock', lock);
        return;
    }else if(lock.err){
        debugLog('LockRelease, ERROR Lock', lock.err);
        return;
    }
    try{
        if(lock.heartbeatTimeOut){
            clearTimeout(lock.heartbeatTimeOut);
            lock.heartbeatTimeOut = 0;
        }
    }catch(error){
        console.error('LockRelease, ERROR clear heartbeat');
    }
    try{
        /* const exp = */ await putLock(lock, 0, 0, 0);
        //debugLog("LockRelease exp", exp);
    }catch{
        debugLog('LockRelease, err mark expire');
    }
    const params = {
        TableName: _lockTable,
        Key: { [_partitionKey]: lock.id },
        ConditionExpression: " (attribute_exists(#partitionKey)) and (rng = :rng) ",
        ExpressionAttributeNames: { "#partitionKey": _partitionKey },
        ExpressionAttributeValues: { ":rng": lock.rng }
    };
    try{
        /* const rm = */ await lock.ddb.delete(params).promise();
        //debugLog("LockRelease rm", rm, params);
    }catch(error){
        //debugLog('LockRelease, err rm', params, error); //possible new lock before clear
    }
    //debugLog('LockRelease, released');
};

export const LockAcquire = async (ddb, id) => {
    var retry = 0;
    var error = false;
    do{
        const rng =  crypto.randomBytes(64).toString('base64');//random a new id
        const lock = {ddb, id, rng};
        //debugLog("LockAcquire", {id, rng});
        error = await tryLockAcquire(lock);
        if(error){
            if (error.code !== "ConditionalCheckFailedException"){
                debugLog('LockAcquire() errCode: ',error.code);
                debugLog('LockAcquire() err: ',error);
                break;
            }
            if((++retry) > _retryCount)
                break;
            //debugLog('LockAcquire() retry:', retry);
            //debugLog(await ddb.fetchRow(ddb, _lockTable,  { [_partitionKey]: lock.id } ));
            await sleep(_retryMs);
            continue;
        }
        setLockHeartBeat(lock, _heartbeatMs);
        //debugLog('LockAcquire() ok with try', retry);
        return lock;
    }while(1);
    debugLog('LockAcquire() exit loop', retry, error);
    return false;
};

//return the error, or false when ok
const tryLockAcquire = async (lock) => {
    try{
        //Apply Lock/ReLock, only if (not locked)||(lock expired now)||(is my lock)
        const timeStampNow = new Date().getTime();
        const ttl = toInt(Date.now()/1000) + 3600;
        const timeStampExpiry = timeStampNow + _lockExpiryMs; //next lock expiry (with tolerance)
        await putLock(lock, ttl, timeStampExpiry, timeStampNow);
/*
        const params = {
            TableName: _lockTable,
            Item:{
                [_partitionKey]: lock.id,
                expiry: timeStampExpiry,
                rng: lock.rng,
            },
            ConditionExpression: " attribute_not_exists(#partitionKey) or (expiry < :expiry) or (rng= :rng) ",
            ExpressionAttributeNames: { "#partitionKey": _partitionKey },
            ExpressionAttributeValues: { ':rng': lock.rng, ':expiry': timeStampNow, },
        };
        await lock.ddb.put(params).promise();
*/
        return false;
    }catch(error){
        //debugLog('tryLockAcquire() err:', {error});
        return error;
    }
};

//Initialize Lock HeartBeat
const setLockHeartBeat = async(lock, timeout) => {
    lock.heartbeatTimeOut = setTimeout(() => LockHeartBeat(lock, timeout));
};

//Keep re apply locking
const LockHeartBeat = async(lock, timeout) => {
    const error = await tryLockAcquire(lock);
    if(error){
        lock.heartbeatTimeOut = 0;
        return; //error re-locking //todo notice lock caller
    }
    if(lock.heartbeatTimeOut)
        setLockHeartBeat(lock, timeout);
};

const sleep = async (ms) => { return new Promise(resolve => setTimeout(resolve, ms)); };

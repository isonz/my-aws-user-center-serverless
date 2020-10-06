import uuid from "uuid";

import * as db from "./libDynamo";
import * as Response from "./libResponse";
import * as Lock from "./sessionLock";
import {toInt, toStr} from "./libType";
import {getEnvs} from "../apis/appEnv";

//The Name of Variable, To pass sessionId value between request and response,
//i.e.  [sessionWebKey] = {sessionIdValue}
export const sessionWebKey = 'sessionId'; //The Key used to pass sessionId over web
export const sessionDBKey = 'sessionId'; //The Key To Store sessionId in DB

const tableNameSession = process.env.tableNameSession; //stage+'-oup-card-session';

// ====== ====== ====== ====== ====== ====== ====== ====== ====== ====== ====== ======
export async function withSessionLock(ddb, event, context, request, callBack){
    var sessionId = _extractOrCreateSID(event, request);
    //debugLog("withSessionLock sid:", {sessionId});
    const lock = await Lock.LockAcquire(ddb, sessionId);
    //debugLog("withSessionLock lock", {lock});
    var ret = false;
    var errs = [];
    if(lock){
        try{
            var session = await loadSessionById(ddb, sessionId);
            //debugLog("withSessionLock loadSessionById", {session});
            ret = await callBack(event, context, request, session, ddb);
            await saveSession(ddb, sessionId, session);
            //debugLog("session saved");
        }catch(Error){
            errs = [Error];
        }
        await Lock.LockRelease(lock);
    }
    //debugLog("withSessionLock", {ret});
    const { admin_maintanceMode, admin_maintanceMsg, admin_maintanceMsgDateTime } = 
        await getEnvs(['admin_maintanceMode', 'admin_maintanceMsg', 'admin_maintanceMsgDateTime']);
    const jsonRetBase = {
        [sessionWebKey]: sessionId,
        uid: toStr(session&&session.uid),
        maintainMode: toStr(admin_maintanceMode),
        maintainMsg: toStr(admin_maintanceMsg),
        maintainId: toStr(admin_maintanceMsgDateTime),
    };
    if(!ret)
        return Response.failure(event, { status:false, errs, ...jsonRetBase});
    if(ret.response)
        return ret.response;
    //debugLog({withSessionLock:ret.body, success:ret.success});
    //debugLog(ret);
    if(ret.body.errs)
        errs = [...errs, ...ret.body.errs];
    const returnBody = {...ret.body, errs, ...jsonRetBase};
    const jsonResponse = (ret.success)
        ?Response.success(event, returnBody, ret.code)
        :Response.failure(event, returnBody, ret.code);
    //if(process.env.cfg==='offline') debugLog(jsonResponse.body);
    return jsonResponse;
}

// ====== ====== ====== ====== ====== ====== ====== ====== ====== ====== ====== ======
export async function saveSession(ddb, sessionId, sessionObj){
    //debugLog('saveSession', {sessionId, sessionObj} );
    const ttl = toInt(Date.now()/1000) + 3600;
    return await db.putItem(ddb, tableNameSession, db.stripEmpty({...sessionObj, [sessionDBKey]:sessionId, ttl}));
}

// Load Session Key from request, then Session Obj from Storage(DB), return Session session object & id
// auto create for new session
export async function loadSession(ddb, event, context, data){
    return loadSessionById(ddb, _extractOrCreateSID(event, data));
}

// Internal Functions Below ====== ====== ====== ====== ====== ====== ====== ====== ====== ====== ====== ======
async function loadSessionById(ddb, sessionId){
    var sessionObj = await db.fetchRow(ddb, tableNameSession, {[sessionDBKey]:sessionId,});
    if(!sessionObj){
        //debugLog("loadSessionById() New");
        sessionObj = {};
    }
    sessionObj[sessionDBKey] = sessionId;
    return sessionObj;
}

function _extractOrCreateSID(event, data){
    var sessionId = _extractSIDFromRequest(event, data);
    const SessIDValid = ((sessionId.length > 4) && (sessionId.length <= 128));
    return SessIDValid?sessionId:uuid.v4();
}

function _extractSIDFromRequest(event, data){
    //if Post have it, use Post, if not, look for query string,
    //return '' if both missing
    try{
        const sidPost = data?data[sessionWebKey]:false;
        const sidQueryStr = event.queryStringParameters?event.queryStringParameters[sessionWebKey]:false;
        const sid = sidPost || sidQueryStr;
        return toStr(sid);
    }catch(e){
        return '';
    }
}

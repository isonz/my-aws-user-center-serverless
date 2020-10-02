//https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_BatchWriteItem.html
//The BatchWriteItem operation puts or deletes multiple items in one or more tables.
//A single call to BatchWriteItem can write up to 16 MB of data,
//which can comprise as many as 25 put or delete requests.
//Individual items to be written can be as large as 400 KB.
//BatchWriteItem may returns a ProvisionedThroughputExceededException.
import {toInt, toStr} from '../libs/libType';
import { debugLog } from "../libs/libFormat";

import { DynamoDBStreams } from 'aws-sdk';


export const queryPage = async (ddb, page, rowPerPage, stopWhenEnough, TableName,
    KeyConditionExpression, _ExpressionAttributeValues=[], IndexName='', params={}) => {
  //todo;
  //limit over page to max page , keep last rpp items and use real total
  //if(first page) return totalrow (page)
  //skip page*rpp, load rpp item, stopquery
  //return {(optional TotalRow:row,) Items:[...item]}
  //const stopWhenEnough = (page > 1);
  var realTotal = -1;
  var tmpTotal = 0;
  page = Math.max(1, page);
  var rpp = Math.max(1, rowPerPage);
  var toSkip = ((page - 1) * rpp);
  var need = rpp;
  //debugLog({page, rpp, toSkip, stopWhenEnough});
  var _Items = [];
  var lastItems = [];
  try{
    var paras = { ...params, TableName, KeyConditionExpression };
    if(IndexName) paras.IndexName = IndexName;
    paras.ExpressionAttributeValues = convertEAV(_ExpressionAttributeValues);
    while(1){
        //debugLog('ddbQueryPage', JSON.stringify(p));
        const {LastEvaluatedKey, Items} = await ddb.query(paras).promise();
        const len = Items.length;
        tmpTotal += len;
        if(need > 0){
          lastItems = lastOfJoined(lastItems, Items, rpp);
          if(toSkip){
            if(len > toSkip){
              _Items = Items.slice(toSkip, toSkip + need);
              need -= _Items.length;
              toSkip = 0;
            }else{
              toSkip -= len;
            }
          }else{
            if(len > need){
              _Items = [..._Items, ...(Items.slice(0, need))];
              need = 0;
            }else{
              _Items = [..._Items, ...Items];
              need -= len;
            }
          }
        }
        if(!LastEvaluatedKey){
          realTotal = tmpTotal;
          break;  //stop because out of source
        }
        if(stopWhenEnough && (need <= 0))
          break;  //stop because got enough
        paras.ExclusiveStartKey = LastEvaluatedKey; //loop scan with LastEvaluatedKey;
    }
  }catch(e){
    realTotal = 0;
    console.error(e);
    console.error('queryPage()', KeyConditionExpression, _ExpressionAttributeValues, IndexName);
  }
  const totalPage = (realTotal>=0) ? Math.max(1, Math.ceil(realTotal/rpp)) : -1;
  if(need > 0){ //fall back to last page
    const remain = realTotal % rpp;
    _Items = lastPageItems(lastItems, remain);
  }
  return [_Items, realTotal, totalPage];
};

export const putItem = async (ddb, TableName, Item) => {
  try {
    await putItem_(ddb, TableName, Item);
    //if(process.env.cfg === 'offline'){ debugLog('putItem');  debugLog(Item); }
    return true;
  }catch(err){
    console.error('putItem() Err', {TableName, Item});
    console.error(err);
    return false;
  }
};
export const putItem_ = async (ddb, TableName, Item) => {
  return ddb.put( { TableName, Item } ).promise();
};

export const deleteItem = async (ddb, TableName, Key) => {
  try{
    //todo: deleteItem() queue deletes and execute once for all, ie deleteQueue[TableName].push(Key)....
    //debugLog('deleteItem()', {TableName, Key});
    return ddb.delete( {TableName, Key} ).promise();
  }catch(err){
    debugLog(err);
    return false;
  }
};

export const batchDeleteAll = async (ddb, TableName, allKeys, params={}) => {
  //per call limit:25 item x 400k per item, max 16MB total
  const keyLen = allKeys.length;
  const segSize = 25;
  var segHead = 0;
  try{
    while(segHead < keyLen){
      const Keys = (keyLen < segSize)?allKeys:allKeys.slice(segHead, segHead+segSize);
      const WrapKeys = Keys.map(Key => ({DeleteRequest:{Key}}));
      var p = { ...params, RequestItems:{ [TableName]: WrapKeys  } };
      while(1){
          //debugLog('batchDeleteAll', JSON.stringify(p));
          const ret = await ddb.batchWrite(p).promise();
          if(!ret.UnprocessedItems[TableName])
              break;
          p.RequestItems = ret.UnprocessedItems;
      }
      segHead += segSize;
    }
  }catch(err){
    debugLog(err);
    throw(err);
  }
};

export const batchPutAll = async (ddb, TableName, allItems, params={}) => {
  //per call limit:25 item x 400k per item, max 16MB total
  const len = allItems.length;
  const segSize = 25;
  var segHead = 0;
  try{
    while(segHead < len){
      const Items = (len < segSize)?allItems:allItems.slice(segHead, segHead+segSize);
      const WrapItems = Items.map(Item => ({PutRequest:{Item}}));
      var p = { ...params, RequestItems:{ [TableName]: WrapItems  } };
      while(1){
          //debugLog('batchPutAll', JSON.stringify(p));
          const ret = await ddb.batchWrite(p).promise();
          if(!ret.UnprocessedItems[TableName])
              break;
          p.RequestItems = ret.UnprocessedItems;
      }
      segHead += segSize;
    }
  }catch(err){
    debugLog(err);
    throw(err);
  }
};



export const batchGetAll = async (ddb, TableName, allKeys, params={}) => {
  var Items = [];
  const keyLen = allKeys.length;
  const segSize = 99; //ddb limit is 100, smaller is safer
  var segHead = 0;
  try{
    while(segHead < keyLen){
      const Keys = (keyLen < segSize)?allKeys:allKeys.slice(segHead, segHead+segSize);
      //debugLog(Keys);
      var p = { ...params, RequestItems:{ [TableName]:{ Keys } } };
      while(1){
          //debugLog('ddbBatchGetAll', JSON.stringify(p));
          const ret = await ddb.batchGet(p).promise();
          Items = [ ...Items, ...ret.Responses[TableName] ];
          if(!ret.UnprocessedKeys[TableName])
              break;
          p.RequestItems = ret.UnprocessedKeys;
      }
      segHead += segSize;
    }
  }catch(err){
    debugLog(err);
  }
  return Items;
};


/*
partitionKeyName = :partitionkeyval AND sortKeyName = :sortkeyval
• sortKeyName = :sortkeyval
• sortKeyName < :sortkeyval
• sortKeyName <= :sortkeyval
• sortKeyName > :sortkeyval
• sortKeyName >= :sortkeyval
• sortKeyName BETWEEN :sortkeyval1 AND :sortkeyval2
• begins_with ( sortKeyName, :sortkeyval )
*/
const convertEAV = (a) => a.reduce( (state, v, i) => ( v?{ ...state, [':v'+i]:v }:state ), {} );
export const queryAll = async (ddb, TableName, KeyConditionExpression, _ExpressionAttributeValues=[], IndexName='', params={}) => {
  var Items = [];
  try{
    var p = { ...params, TableName, KeyConditionExpression };
    if(IndexName) p.IndexName = IndexName;
    p.ExpressionAttributeValues = convertEAV(_ExpressionAttributeValues);
    while(1){
        //debugLog('queryAll()', p);
        const ret = await ddb.query(p).promise();
        Items = [...Items, ...ret.Items];
        if(!ret.LastEvaluatedKey)
            break;
        p.ExclusiveStartKey = ret.LastEvaluatedKey; //loop scan with LastEvaluatedKey;
    }
  }catch(e){
    debugLog(e);
    debugLog('queryAll()', KeyConditionExpression, _ExpressionAttributeValues, IndexName);
  }
  return Items;
};

export const scanAll = async (ddb, TableName, params={}) => {
  return scanN(ddb, 100000, TableName, params);
};
export const scanN = async (ddb, num, TableName, params={}) => {
  var Items = [];
  var count = 0;
  var p = { ConsistentRead:true, ...params, TableName };
  //IndexName
  //ExclusiveStartKey
  //LastEvaluatedKey
  try{
    while(count < num){
      const ret = await ddb.scan(p).promise();
      if(ret.Items){
        count += ret.Items.length;
        Items = [...Items, ...ret.Items];
      }
      p.ExclusiveStartKey = ret.LastEvaluatedKey;
      if(!p.ExclusiveStartKey)
        break;
    }
  }catch(err){
    debugLog(err);
  }
  return Items;
};


export const copyAll = async (ddb, TableName, ddbDest, TableDest) => {
  var count = 0;
  var p = { ConsistentRead:true, TableName };
  try{
    while(1){
      debugLog('copyAll() Reading...');
      const ret = await ddb.scan(p).promise();
      if(ret.Items){
        const Items = ret.Items;
        debugLog('copyAll() Writeing...', Items.length);
        if(Items.length)
          await batchPutAll(ddbDest, TableDest, Items);
      }
      p.ExclusiveStartKey = ret.LastEvaluatedKey;
      if(!p.ExclusiveStartKey)
        break;
    }
  }catch(err){
    console.error(err);
  }
  debugLog('copyAll() finished');
};



/*
export async function fetchRows(ddb, TableName, cond){
  //debugLog('fetchRows', {TableName, cond});
  const rows = await call(ddb, 'query', {TableName, ...cond});
  //debugLog('fetchRows', {TableName, cond}, rows);
  return rows.Items||false;
}
*/
export const fetchRow = async (ddb, TableName, Key) => {
  //debugLog({fetchRow:{TableName, Key}});
  try{
    const r = await ddb.get({ TableName, Key, ConsistentRead: true,
    }).promise();
    //debugLog('fetchRow', {TableName, Key}, r);
    return r.Item||false;
  }catch(err){
    debugLog('fetchRow() Err', TableName, Key, err);
  }
  return false;
};

// Util Functions ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- -----
export const ddbNow = () => (Date.now());

export const batchKeys = (base={}, key='', vals=[]) => {
  return vals.map(val => ({...base, [key]:val}) );
};

// Deplicated Function ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- -----
//function call(ddb, action, params) { return ddb[action](params).promise(); };

export const joinIds = (...args) => (args.join('|'));
export const splitIds = str => (str.split('|'));

//strip empty string before write ddb, because ddb empty string
export const stripEmpty = r => {
  const ret = {};
  Object.keys(r).forEach(key => {
    const val = r[key];
    if(val !== '')
      ret[key] = val;
  });
  return ret;
};

//remove keys from ddb returned record
export const stripKeys = r => {
  if(!r) return 0;
  const {ppk, psk, pk1, pk2, pk3, pk4, pk5, sk1, sk2, sk3, sk4, sk5, ...ret} = r;
  return ret;
};

//from rows of items, extract val of key to array
export const rows2Ids = (ary, key) => {
  var ret = {};
  ary.forEach( r => {
      const id = toStr(r[key]).trim();
      if(id) ret[id] = 1;
  });
  return Object.keys(ret);
};


//get last n of 2 array joined
const lastOfJoined = (ary1, ary2, need) => {
  //if part 2 is enough
  const l2 = ary2.length;
  if(l2 > need)
    return ary2.slice(l2 - need, l2);
  if(l2 === need)
    return l2;
  //if need some or all from part 1
  const need1 = need - l2;
  const l1 = ary1.length;
  if(need1 >= l1)
    return ary1.concat(ary2);
  return ary1.slice(l1 - need1, l1).concat(ary2);
};

const lastPageItems = (lastItems, remain) => {
  if(remain === 0)
    return lastItems;
  const lenLast = lastItems.length;
  return (lenLast <= remain)? lastItems: lastItems.slice(lenLast - remain, lenLast);
};

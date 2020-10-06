import github from '../external/octonodeX';
//import github from 'octonode';
import {debugLog} from './libFormat';

export const gitGetRepo = async (content_gitRepo, content_gitToken) => {
    const gitClient = github.client(content_gitToken);
    //debugLog({gitGetRepo:gitClient});
    return gitClient.repo(content_gitRepo);
};

export const gitPutFile =  async (gitRepo, binBuffer, gitPathFile, comment = 'update', branch = 'master') => {
    try{
        return new Promise(async (resolve, reject) => {
            const fileSHA = await gitGetFileSHA(gitRepo, gitPathFile, branch);
            //debugLog('gitPutFile', fileSHA);
            gitRepo.branch(branch, function(){
                //debugLog('gitPutFile CB001');
                const cb = (err, data) => {
                    //debugLog('gitPutFile CB002', err, data);
                    if(err){
                        console.error('gitPutFile()', err); //debugLog("git Put file error: ",err);
                        reject(false);
                    }else{
                        resolve(true);
                    }
                };
                if(fileSHA){
                    gitRepo.updateContents(gitPathFile, comment, binBuffer, fileSHA, cb);
                }else{
                    gitRepo.createContents(gitPathFile, comment, binBuffer, cb);
                }
            });
        });
    }catch(e){
        console.error('gitPutFile', e);
        throw(e);
    }
};

export const gitGetFile = async (gitRepo, gitPathFile, branch = 'master') => {
    try{
        const fileSHA = await gitGetFileSHA(gitRepo, gitPathFile, branch);
        if (!fileSHA)
            return false;
        return new Promise((resolve, reject) => {
            gitRepo.blob(fileSHA,function(err,data){
                if(err){
                    console.error('gitGetFile', err);
                    reject(false);
                }else{
                    resolve(Buffer.from(data.content, data.encoding));
                }
            });
        });
    }catch(e){
        console.error('gitGetFile', e);
        throw(e);
    }
};

export const gitRmFile = async (gitRepo, gitPathFile, branch = 'master') => {
    try{
        return new Promise(async (resolve, reject) => {
            const fileSHA = await gitGetFileSHA(gitRepo, gitPathFile, branch);
            if (!fileSHA) 
                reject('gitRmFile gitPathFile no SHA');
            gitRepo.deleteContents(gitPathFile, "delete", fileSHA, function(err,data){
                if(err) reject(err);
                if(data) resolve(data);
            });
        });
    }catch(e){
        console.error('gitRmFile', e);
        throw(e);
    }
};

export const getDeleteContent = async (gitRepo, deleteFiles, branch = 'master') => {
    for(var i=0; i<deleteFiles.length; i++){
        debugLog(deleteFiles[i]);
        const fileSHA = await gitGetFileSHA(gitRepo, deleteFiles[i], branch);
        debugLog(fileSHA);
        if (fileSHA){
            gitRepo.deleteContents(deleteFiles[i],"delete",fileSHA,function(err,data){
                if(err)
                    console.error("Delete File "+deleteFiles[i]+" : ", err);
                if(data)
                    debugLog("Delete File "+deleteFiles[i]+" : ", data);
            });
        }
    }
};

export const gitGetFileSHA = async (gitRepo, gitFullPath, branch = 'master') => {
    const gitPaths = gitFullPath.split('/');
    const len = gitPaths.length;
    const gitFolder = (len > 1)?gitPaths.slice(0, len-1).join('/'):'';
    const gitFile = gitPaths[len-1];
    //debugLog({gitFolder, gitFile});
    return new Promise((resolve, reject) => {
        gitRepo.contents(gitFolder,branch,function(err,data){
            if(err){
                debugLog(gitGetFileSHA, err); // no need to log, not found is normal
                resolve('');//reject(false);
            }else{
                //debugLog({gitGetFileSHA_data:data});
                var sha = '';
                var dataKey = data.forEach(function(item){
                    if(item.name !== gitFile)
                        return false; //mean continue; for some();
                    sha = item.sha;
                    return true; // mean break; for some();
                });
                resolve(sha);
            }
        });
    });
};


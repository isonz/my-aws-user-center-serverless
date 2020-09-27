module.exports = {
    errors : function error(errorCode) {
        let message = '';
        if (10001 === errorCode) {
            message = 'Username already exists';
        } else {
            message = 'Unknown Error';
        }
        return {errorCode, message}
    }
};

module.exports = {
    errors : function error(errorCode) {
        let message = '';
        if (10001 === errorCode) {
            message = 'Username already exists';
        } else if (10101 === errorCode) {
            message = 'Username cannot be empty';
        }else if (10102 === errorCode) {
            message = 'Password cannot be empty';
        }else if (10103 === errorCode) {
            message = 'Username does not exist';
        }else if (10104 === errorCode) {
            message = 'Password is incorrect';
        } else {
            message = 'Unknown Error';
        }
        return {errorCode, message}
    }
};

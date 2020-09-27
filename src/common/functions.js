const moment = require('moment');

module.exports = {

    // 生成随机数字 getRandomNum(1, 10)
    randomNum : function getRandomNum(min, max) {
        const Range = max - min;
        const Rand = Math.random();
        return (min + Math.round(Rand * Range));
    },

    // 生成随机字符
    randomString : function getRandomString(length) {
        const chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
        let res = '';
        for (let i = 0; i < length ; i++) {
            const id = Math.ceil(Math.random() * 61);
            res += chars[id];
        }
        return res;
    },

    // 验证手机号
    checkPhone : function checkPhone(phone) {
        return /^1[3456789]\d{9}$/.test(phone);
    },

    // 手机号中间几位变星号
    changePhone : function changePhone(phone) {
        const reg = /^(\d{3})\d*(\d{2})$/;
        return phone.replace(reg, '$1******$2');
    },

    // 获取当前标准时间
    getNow : function getNow() {
        return moment().format('YYYY-MM-DD HH:mm:ss');
    },
};

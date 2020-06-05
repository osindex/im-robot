const config = require('../config');
let CryptoJS = require('crypto-js');
let dayjs = require('dayjs')
require('dayjs/locale/zh-cn')
dayjs.locale('zh-cn')
//解密方法
function Decrypt(word) {
    // 借用token加解密 
    return CryptoJS.AES.decrypt(word, config.token).toString(CryptoJS.enc.Utf8);
}

//加密方法
function Encrypt(word) {
    if (typeof word !== 'string') {
        word = word.toString()
    }
    return CryptoJS.AES.encrypt(word, config.token).toString();
}

/**
 * utils工具
 * by: Peanut
 */


/**
 * 获取当前日期
 * @param {*} date 
 */
function getDay(date) {
    var date2 = new Date()
    var date1 = new Date(date)
    var iDays = parseInt(Math.abs(date2.getTime() - date1.getTime()) / 1000 / 60 / 60 / 24)
    return iDays
}
/**
 * rgb转base64
 * @param {*} color 
 */
function colorRGBtoHex(color) {
    var rgb = color.split(',')
    var r = parseInt(rgb[0].split('(')[1])
    var g = parseInt(rgb[1])
    var b = parseInt(rgb[2].split(')')[0])
    var hex = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
    return hex
}
/**
 * base64转rgb
 * @param {*} color 
 */
function colorHex(color) {
    // 16进制颜色值的正则
    var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/
    // 把颜色值变成小写
    if (reg.test(color)) {
        // 如果只有三位的值，需变成六位，如：#fff => #ffffff
        if (color.length === 4) {
            var colorNew = '#'
            for (var i = 1; i < 4; i += 1) {
                colorNew += color.slice(i, i + 1).concat(color.slice(i, i + 1))
            }
            color = colorNew
        }
        // 处理六位的颜色值，转为RGB
        var colorChange = []
        for (var i = 1; i < 7; i += 2) {
            colorChange.push(parseInt('0x' + color.slice(i, i + 2)))
        }
        return 'rgb(' + colorChange.join(',') + ')'
    } else {
        return color
    }
}
/**
 * sleep
 * @param {*} ms
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}
/***************************************
 * 生成从minNum到maxNum的随机数。
 * 如果指定decimalNum个数，则生成指定小数位数的随机数
 * 如果不指定任何参数，则生成0-1之间的随机数。
 *
 * @minNum：[数据类型是Integer]生成的随机数的最小值（minNum和maxNum可以调换位置）
 * @maxNum：[数据类型是Integer]生成的随机数的最大值
 * @decimalNum：[数据类型是Integer]如果生成的是带有小数的随机数，则指定随机数的小数点后的位数
 *
 ****************************************/
function randomNum(minNum, maxNum, decimalNum) {
    var max = 0,
        min = 0;
    minNum <= maxNum ? (min = minNum, max = maxNum) : (min = maxNum, max = minNum);
    switch (arguments.length) {
    case 1:
        return Math.floor(Math.random() * (max + 1));
        break;
    case 2:
        return Math.floor(Math.random() * (max - min + 1) + min);
        break;
    case 3:
        return (Math.random() * (max - min) + min).toFixed(decimalNum);
        break;
    default:
        return Math.random();
        break;
    }
}
/**
 * This is just a simple version of deep copy
 * Has a lot of edge cases bug
 * If you want to use a perfect deep copy, use lodash's _.cloneDeep
 * @param {Object} source
 * @returns {Object}
 */
function deepClone(source) {
    if (!source && typeof source !== 'object') {
        throw new Error('error arguments', 'deepClone')
    }
    const targetObj = source.constructor === Array ? [] : {}
    Object.keys(source).forEach(keys => {
        if (source[keys] && typeof source[keys] === 'object') {
            targetObj[keys] = deepClone(source[keys])
        } else {
            targetObj[keys] = source[keys]
        }
    })
    return targetObj
}
module.exports = {
    getDay,
    dayjs,
    colorRGBtoHex,
    colorHex,
    delay,
    Decrypt,
    Encrypt,
    randomNum,
    deepClone
}
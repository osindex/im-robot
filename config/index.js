module.exports = {
    token: '',
    name: '',
    database: {
        type: 'sqlite',
        dbname: './data.db'
    },
    redis: {
        host: 'localhost',
        port: 6379,
        auth: null
    },
    appToken: {
        tianxin: '',
    },
    autoFriend: 'ding', //自动同意好友口令
    welcome: `回复关键字/序号 获取对应服务
***陌生人发送ding加我为好友***
1.需要加入的群名如：带头大哥的群
2.场景模式
3.毒鸡汤
4.神回复(略微开车)
转小写(例：转小写PEANUT)
转大写(例：转大写peanut)
转rgb(例：转rgb#cccccc)
转16进制(例：转16进制rgb(255,255,255))
全国肺炎(实时肺炎数据)
省份/自治区 肺炎(例：河南肺炎)`,
    IGNORE: ['filehelper'], //忽略某个用户的消息
    SCHEDULEROOM: ['带头大哥的群'], //要管理的群名称
    MYSELF: '带头大哥' //大号的备注！！！
}
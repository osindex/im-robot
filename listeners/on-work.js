const schedule = require('../schedule');
const { register } = require('../models/user');
const { delGroup } = require('../models/group');
const { delay, randomNum } = require('../utils');

async function onUserInit(bot) {
    // 梳理好友关系并建档
    const contactList = await bot.Contact.findAll()
    contactList.forEach(async (e, k) => {
        // console.log(typeof e.payload)
        // console.log(e.payload)
        // return
        const u = {
            appid: e.id,
            name: e.name(),
            alias: e.payload && e.payload.alias || '',
            friend: e.friend(),
            extra: JSON.stringify(e.payload),
        }
        register(u)
    })
}
async function delRoom() {
    //匹配规则可参考 schedule/index.js
    const time = '5 * * * * *' //每分钟触发一次
    schedule.setSchedule(time, async (fireDate) => {
        console.log(fireDate + ' del groups');
        await delGroup()
    })
}
async function sendMsg(bot, msg, query) {
    const contact = await bot.Contact.find(query)
    if (contact) {
        await contactList.say(msg)
    }
}
async function sendMsgBatch(bot, msg, except = {}) {
    const contactList = await bot.Contact.findAll()
    contactList.forEach(async (contact, k) => {
        console.log(except)
        const keys = Object.keys(except)
        try {
            keys.forEach(e => {
                if (contact[key] == except[key]) {
                    throw new Error('不满足条件')
                }
            })
        } catch (e) {
            console.log('跳出来了')
            console.log(e.message);
            return false
        }
        await delay(randomNum(100, 500))
        await contact.say(msg)
    })
}
module.exports = {
    onUserInit,
    delRoom,
    sendMsg,
    sendMsgBatch
}
const schedule = require('../schedule');
const untils = require('../utils');
const api = require('../api');
const { log } = require('wechaty')
const { getSetting } = require('../models/cache');
/**
 * 8点40定时给指定群发送消息
 */
async function onRoom(wechaty) {
    //匹配规则可参考 schedule/index.js
    const time = '0 40 8 * * *'
    schedule.setSchedule(time, async (fireDate) => {
        console.log('This job was supposed to run at ' + fireDate + ', but actually ran at ' + new Date());
        let today = untils.dayjs().format('YYYY-MM-DD HH:mm dddd') //获取今天的日期
        let one = await api.getOne() //获取每日一句
        const englishData = await api.getEnglishOne() //英语一句话
        const poison = await api.getSoup() //毒鸡汤
        const str = `${today}\n元气满满的一天开始啦,要加油噢^_^\n\n每日一句：\n${one}\n\n英语一句话：\n${englishData}\n\n毒鸡汤：\n${poison}`
        // const str = 'etc...'
        const managerRoom = await getSetting('room')
        managerRoom.forEach(async roomName => {
            const room = await wechaty.Room.find({ topic: roomName })
            console.log(room)
            if (room) {
                try {
                    await untils.delay(Math.random() * 1000)
                    await room.say(str)
                } catch (e) {
                    console.error(e)
                    log.error('群定时消息发送失败')
                }
            }
        })
    })
}

module.exports.onLogin = function () {
    return (wechaty) => {
        wechaty.on('login', async (user) => {
            // console.log(`贴心小助理登录了`)
            await onRoom(wechaty)
        })
    }
}
/**
 * 处理好友关系模块
 */
const { Friendship } = require('wechaty');
const { delay } = require('../utils')
const { register } = require('../models/user');
const config = require('../config')
/**
 * 自动同意好友请求
 */
const onFriendship = () => {
    return (wechaty) => {
        wechaty.on('friendship', async friendship => {
            console.log(friendship)
            await delay(200)
            switch (friendship.type()) {
            case Friendship.Type.Receive:
                if (friendship.hello() === config.autoFriend) {
                    logMsg = 'accepted automatically because verify messsage is "' + config.autoFriend + '"'
                    console.log('before accept')
                    await friendship.accept()
                    // if want to send msg , you need to delay sometimes
                    await new Promise(r => setTimeout(r, 1000))
                    const hello = ['hello.', config.welcome]
                    const e = friendship.contact()
                    await e.say(hello[round(Math.random())])
                    // 注册到数据库
                    const u = {
                        appid: e.id,
                        name: e.name(),
                        alias: e.payload && e.payload.alias || '',
                        extra: JSON.stringify(e.payload),
                    }
                    register(u).then(res => {
                        console.log('register u')
                    })
                    console.log('after accept')
                } else {
                    logMsg = 'not auto accepted, because verify message is: ' + friendship.hello()
                }
                break
                /**
                 *
                 * 2. Friend Ship Confirmed
                 *
                 */
            case Friendship.Type.Confirm:
                logMsg = 'friend ship confirmed with ' + friendship.contact().name()
                break
            }
            console.log('after accept')
        })
    }
}
module.exports = onFriendship
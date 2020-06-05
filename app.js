const { Wechaty } = require('wechaty');
const { PuppetPadplus } = require('wechaty-puppet-padplus');
const { QRCodeTerminal, EventLogger, DingDong } = require('wechaty-plugin-contrib');
const QRoptions = {
    small: false, // default: false - the size of the printed QR Code in terminal
}
const config = require('./config');

const { onLogin, onMessage, onFriendship } = require('./listeners');
const { onUserInit, delRoom } = require('./listeners/on-work');
//ipad协议
if (config.token && config.name) {
    const bot = new Wechaty({
        puppet: new PuppetPadplus({
            token: config.token
        }),
        name: config.name
    })
    bot.use(
        QRCodeTerminal(QRoptions), //登录
        DingDong(),
        EventLogger(),
        onLogin(),
        onMessage(),
        onFriendship()
        // ,OnRoomJoin(), // 不处理
        // OnRoomLeave() // 不处理
    )
    bot
        .start()
        .then(() => console.log('开始登陆微信'))
        .then(() => {
            onUserInit(bot)
            delRoom()
        })
        .catch(e => console.error(e))
} else {
    console.log('请在config中配置 token 和 name')
}
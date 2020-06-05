const { delay, randomNum } = require('../utils')

async function toFriends(wechaty, friends, msg, custom = 'msg', exceptId) {
    // console.log(friends)
    friends.forEach(async e => {
        // findAll 没有用 还是一个一个的查找
        if (e.user_id != exceptId) {
            // 把排除ID放到此处 少一次循环
            const contactCard = await wechaty.Contact.find({ id: e.user_id })
            // console.log(contactCard)
            if (contactCard) {
                const imsg = msg.replace('#msg#', e[custom] || '')
                await contactCard.say(imsg)
                await delay(randomNum(200, 1500))
            }
        }
    })

}
async function toGroups(wechaty, groups, msg) {
    // wechaty.Room.findAll({topic: 'wechaty'})
}

module.exports = {
    toFriends,
    toGroups
}
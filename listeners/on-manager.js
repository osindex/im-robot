const { Message, FileBox, UrlLink, MiniProgram } = require('wechaty')
const { resetSettingCache, resetGameWordsCache } = require('../models/cache');
const { add,update,del } = require('../models/settings');
const { addWord } = require('../models/game_words');

/**
* - MessageType.Unknown     </br>
* - MessageType.Attachment  </br>
* - MessageType.Audio       </br>
* - MessageType.Contact     </br>
* - MessageType.Emoticon    </br>
* - MessageType.Image       </br>
* - MessageType.Text        </br>
* - MessageType.Video       </br>
* - MessageType.Url         </br>
* // 1. send Image
*
*   if (/^ding$/i.test(m.text())) {
*     const fileBox = FileBox.fromUrl('https://chatie.io/wechaty/images/bot-qr-code.png')
*     //FileBox.fromFile(path.join(__dirname,xxx))   
*     await msg.say(fileBox)
*     const message = await msg.say(fileBox) // only supported by puppet-padplus
*   }
*
* // 2. send Text
*
*   if (/^dong$/i.test(m.text())) {
*     await msg.say('dingdingding')
*     const message = await msg.say('dingdingding') // only supported by puppet-padplus
*   }
*
* // 3. send Contact
*
*   if (/^lijiarui$/i.test(m.text())) {
*     const contactCard = await bot.Contact.find({name: 'lijiarui'})
*     if (!contactCard) {
*       console.log('not found')
*       return
*     }
*     await msg.say(contactCard)
*     const message = await msg.say(contactCard) // only supported by puppet-padplus
*   }
*
* // 4. send Link
*
*   if (/^link$/i.test(m.text())) {
*     const linkPayload = new UrlLink ({
*       description : 'WeChat Bot SDK for Individual Account, Powered by TypeScript, Docker, and Love',
*       thumbnailUrl: 'https://avatars0.githubusercontent.com/u/25162437?s=200&v=4',
*       title       : 'Welcome to Wechaty',
*       url         : 'https://github.com/wechaty/wechaty',
*     })
*     await msg.say(linkPayload)
*     const message = await msg.say(linkPayload) // only supported by puppet-padplus
*   }
*
* // 5. send MiniProgram
*
*   if (/^link$/i.test(m.text())) {
*     const miniProgramPayload = new MiniProgram ({
*       username           : 'gh_xxxxxxx',     //get from mp.weixin.qq.com
*       appid              : '',               //optional, get from mp.weixin.qq.com
*       title              : '',               //optional
*       pagepath           : '',               //optional
*       description        : '',               //optional
*       thumbnailurl       : '',               //optional
*     })
*     await msg.say(miniProgramPayload)
*     const message = await msg.say(miniProgramPayload) // only supported by puppet-padplus
*   }
*
* })
* */
async function onManager(wechaty, msg) {
    console.log('进入管理模式')
    switch (msg.type()) {
        case Message.Type.Text:
            return onText(wechaty, msg)
        break;
        case Message.Type.Contact:
            return onContact(wechaty, msg, msg.toContact())
        break;
        default:
    }
}
async function onText(wechaty, msg) {
        const content = msg.text().trim() // 消息内容
        // 进入管理模式
        if (content.indexOf('重载配置') === 0) {
            const word = content.replace('重载配置', '').trim()
            switch (word) {
                case '谁是卧底':
                    resetGameWordsCache('iswho')
                break;
                case 'iswho':
                    resetGameWordsCache('iswho')
                break;
                default:
                    resetSettingCache()
            }
            // 把config的配置项加入redis
            await msg.say('已重新载入redis缓存！')
        } else if (content.indexOf('卧底词库') === 0) {
            const word = content.replace('卧底词库', '').trim().split(' ')
            switch (word[0]){
                case '增加':
                    const data = {
                        type: 'iswho',
                        value: JSON.stringify([word[1],word[2]])
                    }
                    addWord(data)
                await msg.say(`词库增加完毕！若需重载请输入口令： 
重载配置 谁是卧底`)
                break;
                default:
                await msg.say('[增加]指令未找到')
            }
            // 
        } else if (content.indexOf('设置##') === 0) {
            const word = content.replace('设置##', '').trim().split('##')
            const data = {
                label: word[0],
                value: word[1]
            }
            console.log(word)
            // 只能设置uni类型的
            update({label: word[0],type: 'uni'}, data)
            await msg.say(`设置完毕 可回复以下内容
重载配置`)
        } else if (content.indexOf('增加##') === 0) {
            const word = content.replace('增加##', '').trim().split('##')
            const data = {
                label: word[0],
                value: word[1],
                type: word[2] || 'uni',
            }
            add(data)
            await msg.say(`增加完毕 可回复以下内容
重载配置`)
        } else if (content.indexOf('加好友') === 0) {
            const word = content.replace('加好友', '').trim().split('#')
            let search = {}
            search[word[0]] = word[1]
            const newFriend = await wechaty.Friendship.search(search)
            return onContact(wechaty, msg, newFriend)
        } else {
            const letters = `回复特定前缀发送管理命令(部分以多个#分割以囊括空格)：
重载配置 谁是卧底/iswho/''
卧底词库 增加 词汇1 词汇2
加好友#phone/weixin#xxxxx
设置##key##value##?type=uni
增加##key##value##?type=uni[multi]
    `
            await msg.say(letters)
        }
}
async function onContact(wechaty, msg, newFriend) {
    if (!newFriend) {
        return await msg.say('我好像没有找到这个人~')
    }
    if(newFriend.type() === wechaty.Contact.Type.Official){
        // 关注公众号
        await msg.say('我暂时不想关注这个公众号')
    }else{
        if(newFriend.friend()){
            await msg.say(newFriend.name() + '已经是我的好友了！')
        }else{
            await wechaty.Friendship.add(newFriend, 'hello')
        }
    }

}
module.exports = {
    onManager
}
/**
 * 核心逻辑
 */
const { Message, UrlLink } = require('wechaty')
const path = require('path')
const { FileBox } = require('file-box')
const api = require('../api')
const config = require('../config')
const { dayjs, colorRGBtoHex, colorHex, delay, Decrypt, Encrypt } = require('../utils')
const { setScene, hasScene, getScene, delScene } = require('../models/redis');
const isWho = require('./games/iswho');
const { createGroup, getGroup, getGroups, mineGroups, currentGroup } = require('../models/group');
const { joinGroup, levelGroupByType, userGroupWithoutSelf } = require('../models/group_user');
const { toFriends } = require('../utils/broadcast');

const allKeywords = config.welcome
/**
 * 处理消息
 */
const onMessage = () => {
    return (wechaty) => {
        wechaty.on('message', async msg => {
            // const msg = args.payload
            // console.log(msg)
            // console.log('msg')
            //防止自己和自己对话
            if (msg.self()) return
            const room = msg.room() // 是否是群消息
            // 不处理超时1hour问题 
            if (msg.payload.timestamp < new Date().getTime() / 1000 - 60 * 60) {
                return
            }
            if (room) {
                //处理群消息
                await onWebRoomMessage(wechaty, msg)
            } else {
                //处理用户消息  用户消息暂时只处理文本消息。后续考虑其他
                const isText = msg.type() === Message.Type.Text
                if (isText) {
                    await onPeopleMessage(wechaty, msg)
                }
            }
        })
    }
}
/**
 * 处理用户消息
 */
async function onPeopleMessage(wechaty, msg) {
    //获取发消息人
    const contact = msg.from()
    //对config配置文件中 ignore的用户消息不必处理
    if (config.IGNORE.includes(contact.payload.name)) return
    await delay(200) // 统一延迟
    // 在场景中
    const sceneValue = await getScene(contact.id)

    console.log(sceneValue)
    // console.log(contact)
    if (sceneValue) {
        // 动态函数或switch
        switch (sceneValue) {
        case 'iswho':
            await onIsWho(wechaty, contact, msg)
            break;
        default:
            await onScene(wechaty, contact, msg)
        }
    } else {
        let content = msg.text().trim() // 消息内容 使用trim()去除前后空格
        // 不在场景
        if (content === '菜单') {
            await delay(100)
            await msg.say(allKeywords)
        } else if (content === '图片') {
            const fileBox = FileBox.fromFile(path.join(__dirname, '../imgs/dog.jpg'))
            await msg.say('dog!')
            await delay(200)
            await msg.say(fileBox)
        } else if (parseInt(content) === 1) {
            await msg.say('请回复以下任一群名：' + config.SCHEDULEROOM.join(","))
        } else if (config.SCHEDULEROOM.includes(content)) {
            const webRoom = await wechaty.Room.find({
                topic: content
            })
            if (webRoom) {
                const exsit = await webRoom.has(contact)
                await delay(200)
                if (exsit) {
                    await msg.say('别闹，你已经在群里了')
                } else {
                    try {
                        await delay(200)
                        // await msg.say('成功入群...【避免峰豪，测试即可】')
                        await webRoom.add(contact)
                    } catch (e) {
                        console.error(e)
                    }
                }
            }
        } else if (content === '场景模式' || parseInt(content) === 2) {
            // contact
            const letters = `你已进入场景模式，回复序号进行下一步操作：
0.退出所有场景
1.谁是卧底
        `
            setScene(contact.id)
            await msg.say(letters)
        } else if (content === '毒鸡汤' || parseInt(content) === 3) {
            let soup = await api.getSoup()
            await delay(200)
            await msg.say(soup)
        } else if (content === '神回复' || parseInt(content) === 4) {
            const { title, content } = await api.getGodReply()
            await delay(200)
            await msg.say(`标题：${title}\n\n神回复：${content}`)
        } else if (content === '客服') {
            const contactCard = await wechaty.Contact.find({ alias: config.MYSELF }) // change 'lijiarui' to any of the room member
            await msg.say(contactCard)
        } else {
            const noUtils = await onUtilsMessage(msg)
            if (noUtils) {
                await delay(200)
                await msg.say(allKeywords)
            }
        }
    }
}
/**
 * 处理群消息
 */
async function onWebRoomMessage(wechaty, msg) {
    const isText = msg.type() === Message.Type.Text
    console.log(isText, 'isText')
    if (isText) {
        const content = msg.text().trim() // 消息内容
        if (content === '毒鸡汤') {
            let poison = await api.getSoup()
            await delay(200)
            await msg.say(poison)
        } else if (content === '英语一句话') {
            const res = await api.getEnglishOne()
            await delay(200)
            await msg.say(res)
        } else if (content.includes('踢@')) {
            // 踢人功能  群里发送  踢@某某某  即可
            const room = msg.room()
            //获取发消息人
            const contact = msg.from()
            const alias = await contact.alias()
            //如果是机器人好友且备注是自己的大号备注  才执行踢人操作
            if (contact.friend() && alias === config.MYSELF) {
                const delName = content.replace('踢@', '').trim()
                const delContact = await room.member({ name: delName })
                await room.del(delContact)
                await msg.say(delName + '已被移除群聊。且聊且珍惜啊！')
            }
            // @用户
            // const room = msg.room()
            // const members = await room.memberAll() //获取所有群成员
            // const someMembers = members.slice(0, 3)
            // await room.say('Hello world!', ...someMembers) //@这仨人  并说 hello world
        } else {
            await onUtilsMessage(msg)
        }
    }
}
/**
 * 场景模式
 */
async function onScene(wechaty, who, msg) {
    let content = msg.text().trim() // 消息内容 使用trim()去除前后空格
    if (parseInt(content) === 0) {
        const res = await delScene(who.id)
        if (res) {
            await msg.say('你已退出场景')
        } else {
            await msg.say('操作失败，稍后重试')
        }
    } else if (parseInt(content) === 1) {
        // contact
        const groups = await getGroups()
        const glets = groups.map(e => `+${e.id}.[${e.name}] 截止游戏时间：${e.delete_at}`).join(`
`)

        const letters = `你已进入谁是卧底场景，回复序号(或+特定编号如 +1 )进行下一步操作：
0.退出场景
+a.创建房间
+go.开始游戏
`
        // iswho.
        setScene(who.id, 'iswho')
        await msg.say(letters + glets)
    } else {
        const letters = `你已进入场景模式，回复序号进行下一步操作：
0.退出所有场景
1.谁是卧底
    `
        await msg.say(letters)
    }
}
/**
 * 
 */
async function onIsWho(wechaty, who, msg) {
    const scene = 'iswho'
    let content = msg.text().trim() // 消息内容 使用trim()去除前后空格
    if (parseInt(content) === 0) {
        levelGroupByType(who.id, scene)
        const res = await delScene(who.id)
        if (res) {
            await msg.say('你已退出场景')
        } else {
            await msg.say('操作失败，稍后重试')
        }
    } else if (content === '规则') {
        const letters = `其它规则：
1.除离开游戏外，请勿单独回复0
2.所有对话，请勿以'+'开头
3.除投票环节，请勿以'@'开头
4.游戏结束：存活人数/游戏人数 <= 1/2时，即 2/4,2/5,3/6,3/7,4/8
胜利条件：
1.平民淘汰所有卧底和白板 平民胜
2.卧底存活至游戏结束 卧底胜
3.所有卧底出局后白板仍然存活 白板胜
4.白板绝地反击：游戏结束后白板准确猜出平民和卧底词汇，白板胜利。（暂无此功能）
    `
        await msg.say(letters)
    } else if (content.indexOf('+') === 0) {
        const cmd = content.replace('+', '').trim()
        if (cmd > 0) {
            const group = await getGroup(cmd)
            if (group) {
                let extra = { type: group.type }
                // 加入场景
                setScene(who.id, group.type)
                if (group.user_id == who.id) {
                  extra.self_id = 1
                }
                const selfId = await joinGroup(who.id, cmd, extra)
                await msg.say('你已进入：' + group.name + '你的序号是：' + selfId)
            } else {
                await msg.say('房间号不存在！')
            }
        } else {
            if (cmd.toLowerCase() === 'go') {
                // 游戏开始 存入redis 当前房间id和玩家id作为关键字 
                // 除投票环节 同时只允许一名玩家发言
                // 当前房间号 
                const group = await currentGroup(who.id)
                console.log(group)
                if (group) {
                    const list = await userGroupWithoutSelf(group.id, 0)
                    const gameInfo = isWho.defTurn(list)
                    console.log(gameInfo)
                    if (gameInfo) {
                        const letters = `游戏开始，本轮游戏：
平民 ${gameInfo['roleList'][0]} 人
卧底 ${gameInfo['roleList'][1]} 人
白板 ${gameInfo['roleList'][2]} 人
你的身份是：#msg#
*强制退出请回复：cmd:退出
下面请[${gameInfo.first}]号玩家发言`
                        // 当前发言人 playsList 存入redis
                        gameInfo.playsList.map(e => {
                            e.msg = `${e.self_id}号 - ${e.role}【${e.word}】`
                            e.live = true //存活状态
                            e.canSay = gameInfo.first == e.self_id
                            // 用户进入激活场景
                            setScene(e.user_id, group.id, 'active')
                            return e
                        })
                        setScene(group.id, JSON.stringify(gameInfo), 'sceneInfo')
                        await toFriends(wechaty, gameInfo.playsList, letters)
                    } else {
                        await msg.say(`参与人数不足，本游戏至少需要 4 人参与！ 当前人数: ${list.length}`)
                    }
                } else {
                    await msg.say('还未进入房间，无法开始！')
                }
            } else if (cmd.toLowerCase() === 'a') {
                let sceneValue = null
                let group = {}
                const groom = await mineGroups(who.id, { type: 'iswho' })
                if (groom[0]) {
                    group = groom[0]
                    sceneValue = group['id']
                } else {
                    sceneValue = await getScene(who.id, 'active')
                }
                // 检查房主 
                if (sceneValue) {
                    group = await getGroup(sceneValue)
                    const roomId = Encrypt(sceneValue)
                    console.log(group)
                    await msg.say(`已经存在id:${group.id} ${group.name},场景口令：
join:${roomId}`)
                } else {
                    // 创建房间
                    const obj = {
                        user_id: who.id,
                        name: who.name() + '的卧底房间',
                        type: 'iswho',
                        delete_at: dayjs().add(3, 'hour').format('YYYY-MM-DD HH:mm:ss')
                    }
                    const res = await createGroup(obj)
                    const roomId = Encrypt(res[0])
                    await msg.say(`成功创建房间，3小时后自动销毁。你的序号为[1]，好友发送以下口令给我快速加入房间[发送前确保本人不在任何场景]：
join:${roomId}`)
                }
            }
        }
    } else if (content.indexOf('@') === 0) {
        // 投票环节
        const current = content.replace('@', '').trim()
        // 序号 和 index的关系是 序号 = index+1
        // 存入avtive组
        const sceneValue = await getScene(who.id, 'active')
        const gameInfo = JSON.parse(await getScene(sceneValue, 'sceneInfo'))
        if (!gameInfo.playsList.hasOwnProperty(current - 1)) {
            await msg.say('编号错误，请重新投票')
        } else {
            const me = gameInfo.playsList.find(e => { return e.vote && e.user_id == who.id })
            if (me) {
                me.vote = false //不能再次投票
                const voted = gameInfo.playsList[current - 1]
                voted.count += 1
                const liveMan = gameInfo.playsList.filter(e => {
                    return e.live
                })
                const liveManNum = liveMan.length
                if (voted.count > liveManNum / 2) {
                    // 投票过半 直接出局
                    gameInfo.playsList.map((element, index) => {
                        element.msg = ''
                        element.count = 0
                        element.vote = false
                        element.live = current == element.self_id ? false : element.live
                        // 投票结束
                        return element
                    })
                    // console.log(gameInfo.playsList)
                    console.log('gameInfo.playsList')
                    const letters = current + '号玩家票数过半，已出局！'
                    await toFriends(wechaty, gameInfo.playsList, letters)
                    gameInfo = await overIsWho(wechaty, gameInfo, voted)
                } else {
                    // 计算票数与存活人数的关系
                    let count = 0
                    let maxCountMan = { count: 0 }
                    let maxCountManList = []
                    // 同票判断
                    gameInfo.playsList.map((element, index) => {
                        if (maxCountMan.count < element.count) {
                            maxCountMan = element
                            maxCountManList = [element.user_id]
                        } else if (maxCountMan.count == element.count) {
                            maxCountManList.push(element.user_id)
                        }
                        count += element.count
                    })
                    if (liveManNum === count) {
                        // 已经投票完毕
                        if (maxCountManList.length === 1) {
                            gameInfo.playsList.map(element => {
                                element.msg = ''
                                element.count = 0
                                element.vote = false
                                element.live = element === maxCountMan ? false: element.live
                                // 投票结束
                                return element
                            })
                            const letters = maxCountMan.self_id + '号玩家票数过半，已出局！'
                            await toFriends(wechaty, gameInfo.playsList, letters)
                            gameInfo = await overIsWho(wechaty, gameInfo, maxCountMan)
                        } else {
                            let playsList = []
                            gameInfo.playsList.map((element, index) => {
                                if (maxCountManList.indexOf(index) === -1) {
                                    playsList.push(element)
                                }
                            })
                            const letters = maxCountManList.join('、') + '号玩家同票，请重新投票！'
                            await toFriends(wechaty, playsList, letters)
                        }
                    } else {
                        // 未投票完毕
                        const letters = voted.self_id + '号玩家票数为：' + voted.count
                        await msg.say(letters)
                    }
                    // await msg.say('当前未到投票环节！！')
                }
                setScene(sceneValue, JSON.stringify(gameInfo), 'sceneInfo')
            } else {
                await msg.say('当前未到投票环节！')
            }
        }
    } else {
        // 存入avtive组
        const sceneValue = await getScene(who.id, 'active')
        if (sceneValue) {
            let gameInfo = JSON.parse(await getScene(sceneValue, 'sceneInfo'))
            console.log(typeof gameInfo)
            // console.log(gameInfo)
            console.log('gameInfo')
            let current = 0
            let me = gameInfo.playsList.find((element, index) => {
                current = element.self_id
                // 额外处理投票
                return element.user_id == who.id && element.canSay && !element.vote
            })
            if (me) {
                let msg = `[${current}]号玩家说：
${content}
#msg#`
                const resp = isWho.nextSay(gameInfo, current + 1)
                gameInfo = resp.gameInfo
                current = resp.current
                await toFriends(wechaty, gameInfo.playsList, msg, 'msg', who.id)
                if (current === gameInfo.first) {
                    // msg = '#msg#'
                    msg = `现在进入投票环节，回复:
@数字，如@1投票给1号玩家，玩家票数过半即出局`
                    // 如果回到了首位 大家都能投票
                    gameInfo.playsList.map((element, index) => {
                        element.msg = ''
                        element.count = 0
                        element.vote = true
                        // 投票环节
                        return element
                    })
                    await delay(1000)
                    await toFriends(wechaty, gameInfo.playsList, msg)
                }
                setScene(sceneValue, JSON.stringify(gameInfo), 'sceneInfo')
            } else {
                await msg.say('现在不是你的发言时间！若投票请回复 @玩家编号')
            }
            // await delay(180)
        } else {
            const groups = await getGroups()
            const glets = groups.map(e => `+${e.id}.[${e.name}] 截止游戏时间：${e.delete_at}`).join(`
`)
            const letters = `你已进入谁是卧底场景，回复序号(或特定编号如 +1 )进行下一步操作：
0.退出场景
+a.创建房间
+go.开始游戏
`
            await msg.say(letters + glets)
        }
        // whatIG //属于我的房间
        // 轮次
        // gameInfo.playsList
    }
}
async function overIsWho(wechaty, gameInfo, voted) {
    // 判断全部游戏结束
    const gameState = await isWho.gameOver(gameInfo)
    if (gameState) {
        // 给房主发消息重新开始
        gameInfo.playsList[0].msg = '发送+go,开始新一轮游戏！'
        await delay(150)
        await toFriends(wechaty, gameInfo.playsList, gameState + '#msg#')
    } else {
        // 未结束判断被提出人是否是下一个发言人
        const resp = isWho.nextSay(gameInfo, gameInfo.first)
        gameInfo = resp.gameInfo
        await toFriends(wechaty, gameInfo.playsList, '游戏尚未结束。#msg#')
    }
    return gameInfo
}
/**
 * utils消息处理
 */
async function onUtilsMessage(msg) {
    const contact = msg.from() // 发消息人
    const isText = msg.type() === Message.Type.Text
    if (isText) {
        let content = msg.text().trim() // 消息内容
        if (content.indexOf('转大写') === 0) {
            try {
                const str = content.replace('转大写', '').trim().toUpperCase()
                await msg.say(str)
            } catch (error) {
                await msg.say('转换失败，请检查')
            }
        } else if (content.indexOf('转小写') === 0) {
            try {
                const str = content.replace('转小写', '').trim().toLowerCase()
                await msg.say(str)
            } catch (error) {
                await msg.say('转换失败，请检查')
            }
        } else if (content.indexOf('转16进制') === 0) {
            try {
                const color = colorRGBtoHex(content.replace('转16进制', '').trim())
                await msg.say(color)
            } catch (error) {
                console.error(error)
                await msg.say('转换失败，请检查')
            }
        } else if (content.indexOf('转rgb') === 0) {
            try {
                const color = colorHex(content.replace('转rgb', '').trim())
                await msg.say(color)
            } catch (error) {
                console.error(error)
                await msg.say('转换失败，请检查')
            }
        } else if (content === '全国肺炎') {
            try {
                const res = await api.getChinaFeiyan()
                const chinaTotal = res.data.chinaTotal.total
                const chinaToday = res.data.chinaTotal.today
                const str = `全国新冠肺炎实时数据：\n确诊：${
          chinaTotal.confirm
        }\n较昨日：${
          chinaToday.confirm > 0 ? '+' + chinaToday.confirm : chinaToday.confirm
        }\n疑似：${chinaTotal.suspect}\n较昨日：${
          chinaToday.suspect > 0 ? '+' + chinaToday.suspect : chinaToday.suspect
        }\n死亡：${chinaTotal.dead}\n较昨日：${
          chinaToday.dead > 0 ? '+' + chinaToday.dead : chinaToday.dead
        }\n治愈：${chinaTotal.heal}\n较昨日：${
          chinaToday.heal > 0 ? '+' + chinaToday.heal : chinaToday.heal
        }\n------------------\n数据采集于网易，如有问题，请及时联系`
                msg.say(str)
            } catch (error) {
                msg.say('接口错误')
            }
        } else if (content.includes('肺炎')) {
            const config = [
        '北京',
        '湖北',
        '广东',
        '浙江',
        '河南',
        '湖南',
        '重庆',
        '安徽',
        '四川',
        '山东',
        '吉林',
        '福建',
        '江西',
        '江苏',
        '上海',
        '广西',
        '海南',
        '陕西',
        '河北',
        '黑龙江',
        '辽宁',
        '云南',
        '天津',
        '山西',
        '甘肃',
        '内蒙古',
        '台湾',
        '澳门',
        '香港',
        '贵州',
        '西藏',
        '青海',
        '新疆',
        '宁夏'
      ]
            let newContent = content.replace('肺炎', '').trim()
            if (config.includes(newContent)) {
                const data = await api.getProvinceFeiyan(newContent)
                let citystr = '名称  确诊  治愈  死亡\n'
                data.city.forEach(item => {
                    citystr =
                        citystr +
                        `${item.name}  ${item.conNum}  ${item.cureNum}  ${item.deathNum}\n`
                })
                const str = `${newContent}新冠肺炎实时数据：\n确诊：${data.value}\n较昨日：${data.adddaily.conadd}\n死亡：${data.deathNum}\n较昨日：${data.adddaily.deathadd}\n治愈：${data.cureNum}\n较昨日：${data.adddaily.cureadd}\n------------------\n各地市实时数据：\n${citystr}------------------\n数据采集于新浪，如有问题，请及时联系`
                msg.say(str)
            }
        } else if (content.indexOf('join:') === 0) {
            // 特定口令
            const join = Decrypt(content.replace('join:', '').trim())
            const group = await getGroup(join)
            if (group) {
                // 加入场景
                setScene(contact.id, group.type)
                const selfId = await joinGroup(contact.id, join, { type: group.type })
                let ext = ''
                if (!contact.friend()) {
                    ext = `
${contact.name()} 你还不是我的好友哦，点我头像，发送'ding'，自动接受好友位！加我为好友才能跟大家正常游戏！`
                }
                msg.say(`你已进入：${group.name}。你的序号为： ${selfId}。${ext}`)
            } else {
                msg.say('房间口令不存在！')
            }
        } else if (content.indexOf('cmd:') === 0) {
            // 特定口令
            const cmd = Decrypt(content.replace('cmd:', '').trim())
            switch (cmd) {
            case '退出':
                delScene(contact.id, 'active')
                console.log(typeof gameInfo)
                break;
            }
            msg.say(`你已完成：${cmd} 操作`)
        } else {
            // 后续引入机器人
            return true
        }
    } else {
        return true
    }
}
module.exports = onMessage
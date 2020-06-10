const redis = require('./redis');
const { getBy } = require('./settings');
const { getByType } = require('./game_words');

async function resetSettingCache() {
    // settings game_words 重载
    delCache('settings')
    redis.delKey('settings')
    redis.delKey('settings-multi')
    const where = () => function() {
      this.Where('id', '>', 0)
    }
    const data = await getBy(where)
    let multi = []
    data.forEach(async e => {
        if (e.type === 'multi') {
            if(multi.hasOwnProperty(e.label)){
                multi[e.label].push(e.value)
            }else{
                multi[e.label] = [e.value]
            }
        }else{
            await redis.setKey('settings:' + e.label, e.value, 0)
            await redis.saddScene('settings', 'settings:' + e.label)
        }
    })
    for( let ei in multi) {
        await redis.saddScene('settings-multi', 'settings:' + ei)
        // key value 
        // console.log('settings:' + ei, multi[ei])
        await redis.saddScene('settings:' + ei, multi[ei])
    }
}
async function resetGameWordsCache(type) {
    const key = 'game_words:' + type
    redis.delKey(key)
    const data = await getByType(type)
    const cData = data.map(e => 
        e.value
    )
    redis.saddScene(key, ...cData)
}
async function delCache(type) {
    const keys = await redis.smembersScene(type)
    return await redis.delKey(keys)
    // uni/multi 
}
async function getSetting(key) {
    const cKey = 'settings:' + key
    const isMulti = await redis.sismemberScene('settings-multi', cKey)
    if (isMulti) {
        return await redis.smembersScene(cKey)
    }else{
        return await redis.getKey(cKey)
    }
}
async function getGameWord(type) {
    const cKey = 'game_words:' + type
    // smembers game_words:iswho
    return await redis.smembersScene(cKey)
}
async function getGameWordRand(type, num = 1) {
    const cKey = 'game_words:' + type
    return await redis.srandmemberScene(cKey, num)
}
module.exports = {
    resetSettingCache,
    resetGameWordsCache,
    delCache,
    getSetting,
    getGameWord,
    getGameWordRand
}
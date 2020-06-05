const DB = require('../db')
const table = 'group_user'

async function joinGroup(uid, gid, extra = {}) {
    const obj = {
        user_id: uid,
        group_id: gid,
    }
    const exists = await DB(table).where(obj).count('self_id').first()
    if (exists.self_id) {
        return exists.self_id
    } else {
        Object.assign(obj, extra)
        if (!obj.self_id) {
            const self_id = await userGroupCount(gid)
            obj.self_id = self_id.count + 1
        }
        if (!obj.type) {
            obj.type = 'iswho'
        }
        await DB(table).insert(obj)
        // model层处理房间内部序号问题
        return obj.self_id
    }
}
async function userGroupWithoutSelf(gid, uid) {
    return DB(table).where('group_id', gid).whereNot('user_id', uid)
}
async function userGroupCount(gid) {
    const obj = {
        group_id: gid,
    }
    return DB(table).where(obj).count('id as count').first()
}
async function levelGroup(uid, gid) {
    return DB(table).where('user_id', uid).where('group_id', gid).del()
}
async function levelGroupByType(uid, type) {
    return DB(table).where('user_id', uid).where('type', type).del()
}
async function levelGroupByGid(uid, gid) {
    return DB(table).where('group_id', gid).del()
}
async function delGroupRelation(gids) {
    return DB(table).whereIn('group_id', gids).del()
}
module.exports = {
    joinGroup,
    userGroupWithoutSelf,
    userGroupCount,
    levelGroup,
    levelGroupByType,
    levelGroupByGid,
    delGroupRelation
}
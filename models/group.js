const DB = require('../db')
const table = 'groups'
const { joinGroup, levelGroupByGid, delGroupRelation } = require('./group_user')
async function getGroup(gid) {
    return DB(table).where('id', gid).first() //.toSQL()
}
async function getGroups() {
    return DB(table).where('active', 1) //.toSQL()
}
async function mineGroups(uid, extra = {}) {
    let where = {
        'user_id': uid
    }
    Object.assign(where, extra)
    return DB(table).where(where)
    // .toSQL()
}
async function currentGroup(uid) {
    return DB(table).where('user_id', uid).where('active', 1).first()
}
async function createGroup(obj) {
    // const obj = {
    // 	user_id: 'xxx',
    // 	name: 'who的房间',
    // 	type: '谁是卧底',
    // 	extra: '{"blank": 0,"undercover": 1}'
    // }
    const res = await DB(table).insert(obj) //.toSQL()
    console.log(res)
    // 本人加入房间
    joinGroup(obj.user_id, res[0], { self_id: 1 })
    return res
}
async function leaveGroup(gid) {
    return await levelGroupByGid(gid)
}
async function delGroup() {
    const gids = await DB(table).where('delete_at', '<', DB.fn.now()).pluck('id')
    console.log(gids)
    if (gids.length) {
        DB(table).whereIn('id', gids).del()
        delGroupRelation(gids)
    }
}
module.exports = {
    getGroup,
    getGroups,
    mineGroups,
    currentGroup,
    createGroup,
    leaveGroup,
    delGroup
}
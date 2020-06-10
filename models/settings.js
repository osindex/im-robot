const DB = require('../db')
const table = 'settings'

async function add(object) {
    return DB(table).insert(object)
}
async function update(where, object) {
    return DB(table).where(where).update(object)
}
async function del(where) {
    return DB(table).where(where).del()
}
async function getByLabel(label) {
    return getBy({'label': label})
}
async function getByType(type) {
    return getBy({'type': type})
}
async function getBy(where) {
    return DB(table).where(where)
}
module.exports = {
	add,
	update,
	del,
    getByLabel,
    getByType,
    getBy
}
const DB = require('../db')
const table = 'users'

async function exists(id) {
    return DB(table).where('appid', id).first('id')
}
async function register(object) {
    const exist = await exists(object.appid)
    if (exist) {
        return DB(table).where('appid', object.appid).update(object)
    } else {
        return DB(table).insert(object)
    }
}
module.exports = {
    register
}
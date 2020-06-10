const DB = require('../db')
const table = 'game_words'

async function addWord(object) {
    return DB(table).insert(object)
}
async function getByType(type) {
    return getBy({'type': type})
}
async function getBy(where) {
    return DB(table).where(where)
}
module.exports = {
	addWord,
    getByType,
    getBy
}
const config = require('./knexfile')
const Knex = require('knex')
const DB = Knex(process.env.NODE_ENV ? config[process.env.NODE_ENV] : config.development)
module.exports = DB
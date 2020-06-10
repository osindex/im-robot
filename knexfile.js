// Update with your config settings.
const config = require('./config')
module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './dev.db'
    },
    useNullAsDefault: true
  },
  production: {
    client: 'sqlite3',
    connection: {
      filename: config.database.dbname,
    },
    pool: {
      min: 2,
      max: 10
    },
    useNullAsDefault: true
  }
};

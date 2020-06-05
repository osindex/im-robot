exports.up = function (knex) {
    return knex.schema
        .createTable('users', function (table) {
            table.increments('id') // 此ID仅用于计数
            table.string('appid', 255).notNullable()
            table.string('name', 255).notNullable()
            table.string('alias', 255).nullable()
            table.boolean('friend').defaultTo(true)
            table.string('remark', 1000).nullable()
            table.string('extra', 1000).nullable()
            table.timestamp('created_at').defaultTo(knex.fn.now())
            table.unique('appid')
        })
        .createTable('groups', function (table) {
            table.increments('id')
            table.string('user_id', 255).notNullable()
            table.string('name', 255).notNullable()
            table.boolean('active').defaultTo(true)
            table.string('type', 255).notNullable()
            table.string('extra', 1000).nullable()
            table.timestamp('created_at').defaultTo(knex.fn.now())
            table.timestamp('delete_at').nullable()
            table.index(['user_id', 'type'])
        })
        .createTable('group_user', function (table) {
            table.increments('id')
            table.integer('self_id', 255).nullable()
            table.string('user_id', 255).notNullable()
            table.integer('group_id', 255).notNullable()
            table.string('type', 255).notNullable()
            table.string('name', 1000).nullable()
            table.string('extra', 1000).nullable()
            table.timestamp('created_at').defaultTo(knex.fn.now())
            table.index(['user_id', 'group_id'])
        })
}

exports.down = function (knex) {
    return knex.schema
        .dropTable('group_user')
        .dropTable('groups')
        .dropTable('users')
}
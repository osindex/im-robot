
exports.up = function(knex) {
    return knex.schema
        .createTable('settings', function (table) {
            table.increments('id')
            table.string('label', 255).notNullable()
            table.string('value', 1000).nullable()
            table.string('type', 255).nullable().defaultTo('uni')
            // uni/multi 
            table.timestamp('created_at').defaultTo(knex.fn.now())
        })
        .createTable('game_words', function (table) {
            table.increments('id')
            table.string('type', 255).notNullable()
            table.string('value', 1000).nullable()
            table.string('extra', 1000).nullable()
            table.string('user_id', 255).nullable()
            table.timestamp('created_at').defaultTo(knex.fn.now())
        })
};

exports.down = function(knex) {
    return knex.schema
        .dropTable('settings')
        .dropTable('game_words')
};

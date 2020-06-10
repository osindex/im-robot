var { wodi } = require('../utils/words');

exports.seed = function(knex) {
  // type
  // value
  // extra
  // user_id
  // Deletes ALL existing entries
  return knex('game_words').truncate()
    .then(function () {
      // Inserts seed entries
      const data = wodi.map(e => {
        return {
          type: 'iswho', value: JSON.stringify(e)
        }
      })
      console.log(data)
      return knex('game_words').insert(data);
    });
};

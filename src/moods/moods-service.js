const MoodsService = {
    getAllMoods(knex) {
        return knex.select('*').from('thoughtful_moods');
    },

    insertMood(knex, newMood){
        return knex 
            .insert(newMood)
            .into('thoughtful_moods')
            .returning('*')
            .then(rows => {
                return rows[0];
            });
    },

    getById(knex, id){
        return knex 
            .from('thoughtful_moods')
            .select('*')
            .where('id', id)
            .first();
    },

    deleteMood(knex, id){
        return knex('thoughtful_moods')
            .where('id', id)
            .delete();
    },

    updateMood(knex, id, newMoodFields){
        return knex('thoughtful_moods')
            .where('id', id)
            .update(newMoodFields);
    }
};

module.exports = MoodsService;
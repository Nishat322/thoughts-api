const ThoughtsService = {
    getAllThoughts(knex) {
        return knex.select('*').from('thoughtful_thoughts');
    },

    insertThought(knex, newThought) {
        return knex
            .insert(newThought)
            .into('thoughtful_thoughts')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },

    getById(knex, id){
        return knex 
            .from('thoughtful_thoughts')
            .select('*')
            .where('id', id)
            .first();
    },

    deleteThought(knex, id){
        return knex('thoughtful_thoughts')
            .where('id', id)
            .delete();
    },

    updateThought(knex, id, newThoughtField){
        return knex('thoughtful_thoughts')
            .where('id', id)
            .update(newThoughtField);
    }
}

module.exports = ThoughtsService
const UsersService = {
    getAllUsers(knex) {
        return knex.select('*').from('thoughtful_users')
    },

    insertUser(knex, newUser) {
        return knex
            .insert(newUser)
            .into('thoughtful_users')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },

    getById(knex, id) {
        return knex
            .from('thoughtful_users')
            .select('*')
            .where('id', id)
            .first()
    },

    deleteUser(knex, id){
        return knex('thoughtful_users')
            .where({id})
            .delete()
    },

    updateUser(knex, id, newUserFields) {
        return knex('thoughtful_users')
            .where({id})
            .update(newUserFields)
    }
}

module.exports = UsersService
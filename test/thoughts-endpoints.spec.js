const {expect} = require('chai')
const knex = require('knex')
const supertest = require('supertest')
const app = require('../src/app')
const {makeThoughtsArray} = require('./thoughts.fixtures')

describe.only('Thoughts Endpoints', function(){
    let db 

    before('make knex connection', () => {
        db = knex ({
            client: 'pg',
            connection: process.env.TEST_DB_URL
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('clean the table', () => db('thoughtful_thoughts').truncate())

    afterEach('cleanup', () => db('thoughtful_thoughts').truncate())

    describe('GET /thoughts', () => {
        context('Given no thoughts', () => {
            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get('/thoughts')
                    .expect(200, [])
            })
        })
        context('Given there are thoughts in the database', () => {
            const testThoughts = makeThoughtsArray()
    
            beforeEach('insert thoughts', () => {
                return db   
                    .into('thoughtful_thoughts')
                    .insert(testThoughts)
            })
    
            it('GET /thoughts responds with 200 and all of the thoughts', () => {
                return supertest(app)
                    .get('/thoughts')
                    .expect(200, testThoughts)
            })
        })
    })

    describe('GET /thoughts/:thought_id', () => {
        context('Given no thoughts', () => {
            it('responds with 404', () => {
                const thoughtId = 123456
                return supertest(app)
                    .get(`/thoughts/${thoughtId}`)
                    .expect(404, {error: {message: 'Thought doesn\'t exist'}})
            })
        })
        
        context('Given there are thoughts in the database', () => {
            const testThoughts = makeThoughtsArray()
    
            beforeEach('insert thoughts', () => {
                return db   
                    .into('thoughtful_thoughts')
                    .insert(testThoughts)
            })
    
            it('responds with 200 and the specified thought', () => {
                const thoughtId = 2
                const expectedThought = testThoughts[thoughtId-1]
                return supertest(app)
                    .get(`/thoughts/${thoughtId}`)
                    .expect(200, expectedThought)
            })
        })
    })
    
})
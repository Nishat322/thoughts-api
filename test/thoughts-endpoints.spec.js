const {expect} = require('chai')
const knex = require('knex')
const supertest = require('supertest')
const app = require('../src/app')
const {makeThoughtsArray} = require('./thoughts.fixtures')

describe('Thoughts Endpoints', function(){
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

    describe('GET /api/thoughts', () => {
        context('Given no thoughts', () => {
            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get('/api/thoughts')
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
    
            it('GET /api/thoughts responds with 200 and all of the thoughts', () => {
                return supertest(app)
                    .get('/api/thoughts')
                    .expect(200, testThoughts)
            })
        })
    })

    describe('GET /api/thoughts/:thought_id', () => {
        context('Given no thoughts', () => {
            it('responds with 404', () => {
                const thoughtId = 123456
                return supertest(app)
                    .get(`/api/thoughts/${thoughtId}`)
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
                    .get(`/api/thoughts/${thoughtId}`)
                    .expect(200, expectedThought)
            })
        })
    })

    describe('POST /api/thoughts', () => {
        it('creates a thought, responding with 201 and the new thought', function (){
            const newThought = {
                thought_name: 'Test new thought'
            }
            return supertest(app)
                .post('/api/thoughts')
                .send(newThought)
                .expect(201)
                .expect(res => {
                    expect(res.body.thought_name).to.eql(newThought.thought_name)
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.eql(`/api/thoughts/${res.body.id}`)
                })
                .then(postRes => 
                    supertest(app)
                        .get(`/api/thoughts/${postRes.body.id}`)
                        .expect(postRes.body)
                )
        })
    })

    describe('DELETE /api/thoughts/:thought_id', () => {
        context('Given there are thoughts in the database', () => {
            const testThoughts = makeThoughtsArray()

            beforeEach('insert thoughts', () => {
                return db 
                    .into('thoughtful_thoughts')
                    .insert(testThoughts)
            })

            it('responds with 204 and removes the thoughts', () => {
                const idToRemove = 2
                const expectedThoughts = testThoughts.filter(thought => thought.id !== idToRemove)
                return supertest(app)
                    .delete(`/api/thoughts/${idToRemove}`)
                    .expect(204)
                    .then(res => 
                        supertest(app)
                            .get('/api/thoughts')
                            .expect(expectedThoughts)
                    )
            })
        })
        context('Given no thought', () => {
            it('responds with 404', () => {
                const thoughtId = 123456
                return supertest(app)
                    .delete(`/api/thoughts/${thoughtId}`)
                    .expect(404, {error: {message: 'Thought doesn\'t exist'}})
            })
        })
    })

    
})
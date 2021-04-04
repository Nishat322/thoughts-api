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
            connection: process.env.TEST_DATABASE_URL
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
                const expectedThought = testThoughts[ thoughtId -1 ]
                return supertest(app)
                    .get(`/api/thoughts/${thoughtId}`)
                    .expect(200, expectedThought)
            })
        })

        context('Given an XSS attack thought', () => {
            const maliciousThought = {
                id: 911,
                thought_name: 'Naughty naughty very naughty <script>alert("xss");</script>',
                author: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
                date_added: '2021-04-03T17:28:08.321Z'
            }

            beforeEach('insert malicious thought', () => {
                return db
                    .into('thoughtful_thoughts')
                    .insert([maliciousThought])
            })

            it('removes XSS attack content', () => {
                return supertest(app)
                    .get(`/api/thoughts/${maliciousThought.id}`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body.thought_name).to.eql('Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;')
+                       expect(res.body.author).to.eql(`Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`)
                    })
            })
        }) 
    })

    describe('POST /api/thoughts', () => {
        it('creates a thought, responding with 201 and the new thought', () => {
            const newThought = {
                thought_name: 'Test new thought',
                author: 'new author'
            }

            return supertest(app)
                .post('/api/thoughts')
                .send(newThought)
                .expect(201)
                .expect(res => {
                    expect(res.body.thought_name).to.eql(newThought.thought_name)
                    expect(res.body.author).to.eql(newThought.author)
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.eql(`/api/thoughts/${res.body.id}`)
                    const expected = new Date().toLocaleString()
                    const actual = new Date(res.body.date_added).toLocaleString()
                    expect(actual).to.eql(expected)
                })
                .then(postRes => 
                    supertest(app)
                        .get(`/api/thoughts/${postRes.body.id}`)
                        .expect(postRes.body)
                )
        })

        it('responds with 400 and an error message when the \'title\' is missing', () => {
            return supertest(app)
                .post('/api/thoughts')
                .send({random: 'foo'})
                .expect(400, {error: {message: 'Missing \'thought_name\' in request body'}})
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
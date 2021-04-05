const path = require('path')
const express = require('express')
const xss = require('xss')
const ThoughtsService = require('./thoughts-service')

const thoughtsRouter = express.Router()
const jsonParser = express.json()

const serializeThought = thought => ({
    id: thought.id,
    thought_name: xss(thought.thought_name),
    author: xss(thought.author),
    date_added: thought.date_added
})

thoughtsRouter
    .route('/')
    .get((req,res,next) => {
        knexInstance = req.app.get('db')
        console.log('GET route')
        ThoughtsService.getAllThoughts(knexInstance)
            .then(thoughts => {
                console.log(thoughts)
                res.json(thoughts.map(serializeThought))
            })
            .catch(next)
    })
    .post(jsonParser, (req,res,next) => {
        const {thought_name, author} = req.body
        const newThought = {thought_name}
        const knexInstance = req.app.get('db')

        if(!thought_name) {
            return res.status(400).json({
                error: {message: 'Missing \'thought_name\' in request body'}
            })
        }

        newThought.author = author

        ThoughtsService.insertThought(knexInstance, newThought)
            .then(thought => {
                res.status(201)
                .location(path.posix.join(req.originalUrl,`/${thought.id}`))
                .json(thought)
            })
            .catch(next)
    })

thoughtsRouter
    .route('/:thought_id')
    .all((req,res,next) => {
        ThoughtsService.getById(
            req.app.get('db'), req.params.thought_id
        )
            .then (thought => {
                if(!thought) {
                    return res.status(404).json({
                        error: {message: 'Thought doesn\'t exist'}
                    })
                }
                res.thought = thought
                next()
            })
    })
    .get((req,res,next) => {
            res.json({
                id: res.thought.id,
                date_added: res.thought.date_added,
                thought_name: xss(res.thought.thought_name),
                author: xss(res.thought.author)
            })
    })
    .delete((req,res,next) => {
        ThoughtsService.deleteThought(
            req.app.get('db'), req.params.thought_id
        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = thoughtsRouter

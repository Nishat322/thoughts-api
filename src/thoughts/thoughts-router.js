const express = require('express')
const ThoughtsService = require('./thoughts-service')

const thoughtsRouter = express.Router()
const jsonParser = express.json()

thoughtsRouter
    .route('/')
    .get((req,res,next) => {
        knexInstance = req.app.get('db')
        ThoughtsService.getAllThoughts(knexInstance)
            .then(thoughts => {
                res.json(thoughts)
            })
            .catch(next)
    })
    .post(jsonParser, (req,res,next) => {
        const {thought_name} = req.body
        const newThought = thought_name
        ThoughtsService.insertThought(req.app.get('db'), newThought)
            .then(thought => {
                res.status(201)
                .location(`/thoughts/${thought.id}`)
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
                thought_name: res.thought.thought_name,
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

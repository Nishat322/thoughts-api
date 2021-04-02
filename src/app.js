require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const ThoughtsService = require('./thoughts-service')

const app = express()

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption))
app.use(cors())
app.use(helmet())

app.get('/thoughts', (req,res,next) => {
    knexInstance = req.app.get('db')
    ThoughtsService.getAllThoughts(knexInstance)
        .then(thoughts => {
            res.json(thoughts)
        })
        .catch(next)
})

app.get('/thoughts/:thought_id', (req,res,next) => {
    const knexInstance = req.app.get('db')
    const {thought_id} = req.params

    ThoughtsService.getById(knexInstance, thought_id)
        .then(thought => {
            if(!thought) {
                return res.status(404).json({
                    error: {message: 'Thought doesn\'t exist'}
                })
            }
            res.json(thought)
        })
        .catch(next)
})

app.get('/', (req, res) => {
    res.send('Hello, world!')
})

app.use(function errorHandler(error, req, res, next) {
    let response
    if (NODE_ENV === 'production') {
        response = { error: { message: 'server error' } }
    } else {
        console.error(error)
        response = { message: error.message, error }
    }
    res.status(500).json(response)
})
    
module.exports = app
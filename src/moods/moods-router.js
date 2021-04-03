const path = require('path');
const express = require('express');
const xss = require('xss');
const MoodsService = require('./moods-service');

const moodsRouter = express.Router();
const jsonParser = express.json();

const serializeMood = mood => ({
    id: mood.id,
    mood: xss(mood.mood),
    users_id: mood.users_id
});

moodsRouter
    .route('/')
    .get((req,res,next) => {
        const knexInstance = req.app.get('db');
        MoodsService.getAllMoods(knexInstance)
            .then(moods => {
                res.json(moods.map(serializeMood));
            });
    })
    .post(jsonParser, (req,res,next) => {
        const {mood, users_id} = req.body;
        const newMood = {mood, users_id};

        for(const [key,value] of Object.entries(newMood))
            if(value == null)
                return res.status(400).json({
                    error: {message: `Missing '${key}' in request body`}
                })

        MoodsService.insertMood(req.app.get('db'), newMood)
            .then(mood => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${mood.id}`))
                    .json(serializeMood(mood));
            })
            .catch(next);
    });

moodsRouter
    .route('/:mood_id')
    .all((req,res,next) => {
        const knexInstance = req.app.get('db');
        const {mood_id} = req.params;
        
        MoodsService.getById(knexInstance, mood_id)
            .then(mood => {
                if(!mood){
                    return res  
                        .status(404)
                        .json({error: {message: 'Mood doesn\'t exist'}});
                }
                res.mood = mood;
                next();
            })
            .catch(next);
    })
    .get((req,res,next) => {
        res 
            .json(serializeMood(res.mood));
    })
    .delete((req,res,next) => {
        const knexInstance = req.app.get('db');
        const {mood_id} = req.params;

        MoodsService.deleteMood(knexInstance, mood_id)
            .then(numRowsAffected => {
                res 
                    .status(204)
                    .end();
            })
            .catch(next);
    })
    .patch(jsonParser, (req,res,next) => {
        const {mood} = req.body;
        const moodToUpdate = mood;
        const knexInstance = req.app.get('db');
        const {mood_id} = req.params;

        if(!mood){
            return res  
                .status(400)
                .json({error: {message: 'Request body must contain mood'}});
        }

        MoodsService.updateMood(knexInstance, mood_id, moodToUpdate)
            .then(numRowsAffected => {
                res 
                    .status(204)
                    .end();
            });
    });

    module.exports = moodsRouter;
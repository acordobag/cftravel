var Place = require('../models/place.model');
var Image = require('../models/image.model');

async function save(req, res) {
    try {
        let place = await Place.create(req.body, { include: [{ model: Image }] })
        res.status(200).send(place).end()
    } catch (e) {
        next(e)
    }
}

async function findAll(req, res) {
    try {
        let places = await Place.findAll({ include: [{ model: Image }] })
        res.status(200).send(places).end()
    } catch (e) {
        next(e)
    }
}

export default {
    save,
    findAll
}

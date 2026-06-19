import PlaceModel from '../models/place.model';
import Image from '../models/image.model';

const defaultPlaces = [
    {
        name: 'SJO Airport',
        description: 'Reliable private pickups and drop-offs with flight-friendly scheduling and transparent route pricing.',
        images: [{ src: 'assets/images/airport.jpg' }]
    },
    {
        name: 'La Fortuna / Arenal',
        description: 'Door-to-door private transfers to La Fortuna, hot springs, boutique hotels, and adventure lodges near Arenal Volcano.',
        images: [{ src: 'assets/images/arenal.jpg' }]
    },
    {
        name: 'Jaco Beach',
        description: 'Easy coastal rides for surf trips, family vacations, marina connections, and hotel-to-hotel transfers.',
        images: [{ src: 'assets/images/jaco.jpg' }]
    },
    {
        name: 'Manuel Antonio',
        description: 'Hotel-to-hotel transfers to Quepos and Manuel Antonio with planned comfort stops along the coast.',
        images: [{ src: 'assets/images/t1.jpg' }]
    },
    {
        name: 'Monteverde',
        description: 'Mountain road transfers to cloud forest hotels, reserves, and adventure lodges.',
        images: [{ src: 'assets/images/h1.jpg' }]
    },
    {
        name: 'Tamarindo',
        description: 'Long-distance private shuttles to northern beaches, villas, and surf stays.',
        images: [{ src: 'assets/images/c1.jpg' }]
    }
]

const Place = {
    save: async (req, res, next) => {
        try {
            const place = await PlaceModel.create(req.body, { include: [{ model: Image }] })
            res.status(200).send(place).end()
        } catch (e) {
            next(e)
        }
    },

    findAll: async (req, res, next) => {
        try {
            let places = await PlaceModel.findAll({ include: [{ model: Image }], order: [['id', 'ASC']] })

            if (!places.length) {
                await PlaceModel.bulkCreate(defaultPlaces, { include: [{ model: Image }] })
                places = await PlaceModel.findAll({ include: [{ model: Image }], order: [['id', 'ASC']] })
            }

            res.status(200).send(places).end()
        } catch (e) {
            next(e)
        }
    }
}

module.exports = Place;

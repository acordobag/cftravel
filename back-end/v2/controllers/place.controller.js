import PlaceModel from '../models/place.model';
import Image from '../models/image.model';

const defaultPlaces = [
    {
        name: 'SJO Airport',
        zone: 'Alajuela',
        description: 'Reliable private pickups and drop-offs with flight-friendly scheduling and transparent route pricing.',
        featured: true,
        images: [{ src: 'assets/images/airport.jpg' }]
    },
    {
        name: 'La Fortuna / Arenal',
        zone: 'Northern Highlands',
        description: 'Door-to-door private transfers to La Fortuna, hot springs, boutique hotels, and adventure lodges near Arenal Volcano.',
        featured: true,
        images: [{ src: 'assets/images/arenal.jpg' }]
    },
    {
        name: 'Jaco Beach',
        zone: 'Central Pacific',
        description: 'Easy coastal rides for surf trips, family vacations, marina connections, and hotel-to-hotel transfers.',
        featured: true,
        images: [{ src: 'assets/images/jaco.jpg' }]
    },
    {
        name: 'Manuel Antonio',
        zone: 'Central Pacific',
        description: 'Hotel-to-hotel transfers to Quepos and Manuel Antonio with planned comfort stops along the coast.',
        featured: true,
        images: [{ src: 'assets/images/t1.jpg' }]
    },
    {
        name: 'Monteverde',
        zone: 'Cloud Forest',
        description: 'Mountain road transfers to cloud forest hotels, reserves, and adventure lodges.',
        featured: true,
        images: [{ src: 'assets/images/h1.jpg' }]
    },
    {
        name: 'Tamarindo',
        zone: 'Guanacaste',
        description: 'Long-distance private shuttles to northern beaches, villas, and surf stays.',
        featured: true,
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

    findBySlug: async (req, res, next) => {
        try {
            const place = await PlaceModel.findOne({
                where: { slug: req.params.slug, active: true },
                include: [{ model: Image }]
            })
            if (!place) {
                return res.status(404).json({ message: 'Destination not found.' })
            }
            res.status(200).send(place).end()
        } catch (e) {
            next(e)
        }
    },

    findAll: async (req, res, next) => {
        try {
            const where = req.path && req.path.indexOf('/admin/') === 0 ? {} : { active: true }
            let places = await PlaceModel.findAll({ where, include: [{ model: Image }], order: [['id', 'ASC']] })

            const placeCount = await PlaceModel.count()
            if (!placeCount) {
                await PlaceModel.bulkCreate(defaultPlaces, { include: [{ model: Image }] })
                places = await PlaceModel.findAll({ where, include: [{ model: Image }], order: [['id', 'ASC']] })
            }

            res.status(200).send(places).end()
        } catch (e) {
            next(e)
        }
    },

    update: async (req, res, next) => {
        try {
            const place = await PlaceModel.findOne({ where: { id: req.params.id }, include: [{ model: Image }] })
            if (!place) {
                return res.status(404).json({ message: 'Place not found.' })
            }

            place.name = req.body.name
            place.slug = req.body.slug || null
            place.description = req.body.description
            place.descriptionEs = req.body.descriptionEs || ''
            place.content = req.body.content || ''
            place.contentEs = req.body.contentEs || ''
            place.zone = req.body.zone || ''
            place.airportDistance = req.body.airportDistance == null ? null : Number(req.body.airportDistance)
            place.googlePlaceId = req.body.googlePlaceId || ''
            place.latitude = req.body.latitude == null ? null : Number(req.body.latitude)
            place.longitude = req.body.longitude == null ? null : Number(req.body.longitude)
            place.pricingZoneId = req.body.pricingZoneId || null
            place.featured = req.body.featured !== false
            place.active = req.body.active !== false
            await place.save()

            if (req.body.image) {
                const image = place.images && place.images.length ? place.images[0] : await Image.create({ placeId: place.id })
                image.src = req.body.image
                image.alt = req.body.imageAlt || ''
                image.credit = req.body.imageCredit || ''
                image.license = req.body.imageLicense || ''
                image.sourceUrl = req.body.imageSourceUrl || ''
                image.placeId = place.id
                await image.save()
            }

            const updated = await PlaceModel.findOne({ where: { id: req.params.id }, include: [{ model: Image }] })
            res.status(200).send(updated).end()
        } catch (e) {
            next(e)
        }
    },

    delete: async (req, res, next) => {
        try {
            await Image.destroy({ where: { placeId: req.params.id } })
            await PlaceModel.destroy({ where: { id: req.params.id } })
            res.status(200).send({ success: true }).end()
        } catch (e) {
            next(e)
        }
    }
}

module.exports = Place;

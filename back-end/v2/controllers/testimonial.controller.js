import TestimonialModel from '../models/testimonial.model'

const defaultTestimonials = [
  {
    name: 'Mariana G.',
    location: 'San Jose, Costa Rica',
    route: 'SJO Airport to La Fortuna',
    rating: 5,
    comment: 'The pickup was on time, the van was spotless, and the driver helped us plan a comfortable stop on the way to Arenal.',
    active: true
  },
  {
    name: 'David R.',
    location: 'Austin, USA',
    route: 'Jaco to Manuel Antonio',
    rating: 5,
    comment: 'Clear pricing before booking and a very relaxed ride. It felt private, safe, and easy after a long travel day.',
    active: true
  },
  {
    name: 'Sofia L.',
    location: 'Madrid, Spain',
    route: 'Liberia Airport to Tamarindo',
    rating: 5,
    comment: 'Our driver tracked the arrival time and was waiting when we landed. The whole transfer was smooth from airport to hotel.',
    active: true
  },
  {
    name: 'Andrew K.',
    location: 'Toronto, Canada',
    route: 'Monteverde to SJO Airport',
    rating: 5,
    comment: 'Great communication, careful driving, and enough room for our luggage. We would book the same service again.',
    active: true
  }
]

const Testimonial = {
  save: async (req, res, next) => {
    try {
      const testimonial = await TestimonialModel.create(req.body)
      res.status(200).send(testimonial).end()
    } catch (e) {
      next(e)
    }
  },

  findAll: async (req, res, next) => {
    try {
      let testimonials = await TestimonialModel.findAll({
        where: { active: true },
        order: [['id', 'ASC']]
      })

      if (!testimonials.length) {
        await TestimonialModel.bulkCreate(defaultTestimonials)
        testimonials = await TestimonialModel.findAll({
          where: { active: true },
          order: [['id', 'ASC']]
        })
      }

      res.status(200).send(testimonials).end()
    } catch (e) {
      next(e)
    }
  },

  findAllAdmin: async (req, res, next) => {
    try {
      const testimonials = await TestimonialModel.findAll({
        order: [['id', 'ASC']]
      })
      res.status(200).send(testimonials).end()
    } catch (e) {
      next(e)
    }
  },

  update: async (req, res, next) => {
    try {
      const testimonial = await TestimonialModel.findOne({ where: { id: req.params.id } })
      if (!testimonial) {
        return res.status(404).json({ message: 'Testimonial not found.' })
      }

      testimonial.name = req.body.name
      testimonial.location = req.body.location
      testimonial.route = req.body.route
      testimonial.rating = req.body.rating
      testimonial.comment = req.body.comment
      testimonial.active = req.body.active
      await testimonial.save()

      res.status(200).send(testimonial).end()
    } catch (e) {
      next(e)
    }
  },

  delete: async (req, res, next) => {
    try {
      await TestimonialModel.destroy({ where: { id: req.params.id } })
      res.status(200).send({ success: true }).end()
    } catch (e) {
      next(e)
    }
  }
}

module.exports = Testimonial

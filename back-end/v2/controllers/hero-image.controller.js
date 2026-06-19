import Image from '../models/image.model'

const defaultHeroImages = [
  { src: 'assets/images/banner_0.jpg' },
  { src: 'assets/images/banner_1.png' }
]

const HeroImage = {
  findAll: async (req, res, next) => {
    try {
      let images = await Image.findAll({
        where: { placeId: null },
        order: [['id', 'ASC']]
      })

      if (!images.length) {
        await Image.bulkCreate(defaultHeroImages)
        images = await Image.findAll({
          where: { placeId: null },
          order: [['id', 'ASC']]
        })
      }

      res.status(200).send(images).end()
    } catch (e) {
      next(e)
    }
  },

  save: async (req, res, next) => {
    try {
      const image = await Image.create({ src: req.body.src, placeId: null })
      res.status(201).send(image).end()
    } catch (e) {
      next(e)
    }
  },

  update: async (req, res, next) => {
    try {
      const image = await Image.findOne({ where: { id: req.params.id, placeId: null } })
      if (!image) {
        return res.status(404).json({ message: 'Hero image not found.' })
      }

      image.src = req.body.src
      await image.save()
      res.status(200).send(image).end()
    } catch (e) {
      next(e)
    }
  },

  delete: async (req, res, next) => {
    try {
      await Image.destroy({ where: { id: req.params.id, placeId: null } })
      res.status(200).send({ success: true }).end()
    } catch (e) {
      next(e)
    }
  }
}

module.exports = HeroImage

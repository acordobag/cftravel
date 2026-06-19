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
  }
}

module.exports = HeroImage

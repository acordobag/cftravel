import Place from '../models/place.model';
import Image from '../models/image.model';

async function save(req, res) {

    Place.create(req.body, { include: [{ model: Image, as: 'images' }] }).then(function (place) {
        if (place) {
            res.send(place);
        } else if (!place) {
            res.send({ status: 400, msj: "NO SE REGISTRO!" });
        }

    });
};

async function findAll(req, res) {
    try {
        let places = await Place.findAll({ include: [{ model: Image, as: 'images' }] })
        if (places) {
            res.send(places);
        } else if (!places) {
            res.send({ status: 400, msj: "NO HAY NINGUN REGISTRO" });
        }
    } catch (e) {
        next(e)
        console.error(e)
    }

};

export default {
    save,
    findAll
}

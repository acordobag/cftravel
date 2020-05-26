'use strict'
import chalk from 'chalk'
import db from './index'

import Company from '../models/company.model'
import Image from '../models/image.model'
import Reservation from '../models/reservation.model'
import Shuttle from '../models/shuttle.model'
import Phone from '../models/phone.model'
import Place from '../models/place.model'
import User from '../models/user.model'

export default async () => {
    // User relations

    Company.hasMany(Phone);
    Phone.belongsTo(Company);

    Place.hasMany(Image);
    Image.belongsTo(Place);

    User.hasMany(Shuttle)
    Reservation.belongsTo(User);

    Reservation.hasMany(Shuttle);
    Shuttle.belongsTo(Reservation)

    Shuttle.belongsTo(Place, {as: 'departing'});
    
    Shuttle.belongsTo(Place, {as: 'destination'});


    try {
        await db.sync({
            //alter: true
        })
    } catch (e) {
        console.log(e)
    }

    console.log(chalk.cyan('[Database] Database initialized'))
}

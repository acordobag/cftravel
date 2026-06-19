'use strict'
import chalk from 'chalk'
import db from './index'

import Company from '../models/company.model'
import Image from '../models/image.model'
import Reservation from '../models/reservation.model'
import Shuttle from '../models/shuttle.model'
import Phone from '../models/phone.model'
import Place from '../models/place.model'
import Testimonial from '../models/testimonial.model'
import User from '../models/user.model'
import PricingRule from '../models/pricing-rule.model'
import FixedRoutePrice from '../models/fixed-route-price.model'
import ServicePricingRule from '../models/service-pricing-rule.model'
import UserMessage from '../models/user-message.model'
import bcrypt from 'bcryptjs'

const defaultPricingRules = [
    { name: 'Very short routes', minDistance: 0, maxDistance: 50, pricePerKm: 3.57, discount: 1, sortOrder: 1 },
    { name: 'Short route promo', minDistance: 55, maxDistance: 65, pricePerKm: 2.24, discount: 0.8, sortOrder: 2 },
    { name: 'Short routes', minDistance: 50, maxDistance: 75, pricePerKm: 2.24, discount: 0.9, sortOrder: 3 },
    { name: 'Mid route promo', minDistance: 97.2, maxDistance: 99, pricePerKm: 1.68, discount: 0.9, sortOrder: 4 },
    { name: 'Mid routes', minDistance: 75, maxDistance: 100, pricePerKm: 1.68, discount: 0.8, sortOrder: 5 },
    { name: 'Specific route adjustment A', minDistance: 113, maxDistance: 116, pricePerKm: 1.42, discount: 0.3, sortOrder: 6 },
    { name: 'Specific route adjustment B', minDistance: 124, maxDistance: 126, pricePerKm: 1.42, discount: 0.3, sortOrder: 7 },
    { name: 'Specific route adjustment C', minDistance: 105, maxDistance: 107, pricePerKm: 1.42, discount: 1.35, sortOrder: 8 },
    { name: 'Long mid routes', minDistance: 100, maxDistance: 150, pricePerKm: 1.42, discount: 0.55, sortOrder: 9 },
    { name: 'Long route base', minDistance: 161, maxDistance: 180, pricePerKm: 1.03, discount: 0, sortOrder: 10 },
    { name: 'Long route adjustment A', minDistance: 180, maxDistance: 185, pricePerKm: 1.03, discount: 0.42, sortOrder: 11 },
    { name: 'Long route adjustment B', minDistance: 191, maxDistance: 193.1, pricePerKm: 1.43, discount: 1, sortOrder: 12 },
    { name: 'Extended route adjustment A', minDistance: 205, maxDistance: 215, pricePerKm: 1.03, discount: 0.24, sortOrder: 13 },
    { name: 'Extended route adjustment B', minDistance: 229, maxDistance: 231, pricePerKm: 1.12, discount: 0.42, sortOrder: 14 },
    { name: 'Extended route band', minDistance: 230, maxDistance: 259, pricePerKm: 1.12, discount: 0.67, sortOrder: 15 },
    { name: 'Extended route fallback A', minDistance: 220, maxDistance: 230, pricePerKm: 1.03, discount: 0.4, sortOrder: 16 },
    { name: 'Extended route fallback B', minDistance: 150, maxDistance: 262, pricePerKm: 1.03, discount: 0.75, sortOrder: 17 },
    { name: 'Far route adjustment A', minDistance: 262, maxDistance: 264, pricePerKm: 1.07, discount: 0.67, sortOrder: 18 },
    { name: 'Far route adjustment B', minDistance: 300, maxDistance: 310, pricePerKm: 1.07, discount: 0.16, sortOrder: 19 },
    { name: 'Far route band', minDistance: 264, maxDistance: 315, pricePerKm: 1.07, discount: 0.3, sortOrder: 20 },
    { name: 'Far route adjustment C', minDistance: 315, maxDistance: 320, pricePerKm: 1.07, discount: 0.22, sortOrder: 21 },
    { name: 'Very far routes', minDistance: 320, maxDistance: 370, pricePerKm: 0.9, discount: 0.07, sortOrder: 22 }
]

const defaultServiceRules = [
    { title: 'Fixed route prices win first', description: 'If a route has a fixed price, the customer quote uses that amount instead of the distance formula.', sortOrder: 1 },
    { title: 'Distance rules fill the gaps', description: 'When no fixed price exists, the quote uses route distance, operations distance, rate per km, and discount.', sortOrder: 2 },
    { title: 'Final confirmation stays human', description: 'Special luggage, custom stops, late-night timing, or unusual access roads should be reviewed before final confirmation.', sortOrder: 3 }
]

const defaultCompany = {
    name: 'CR Travel Service',
    email: 'reservations@crtravelservice.com',
    tagline: 'Private shuttle transportation in Costa Rica',
    address: 'Costa Rica',
    website: 'https://crtravelservice.com',
    isDefault: true
}

const defaultContactMethods = [
    { type: 'phone', label: 'Costa Rica', code: 'Costa Rica', number: '+506 0000-0000', href: 'tel:+50600000000', sortOrder: 1 },
    { type: 'phone', label: 'US & Canada', code: 'US & Canada', number: '+1 (800) 000-0000', href: 'tel:+18000000000', sortOrder: 2 },
    { type: 'whatsapp', label: 'WhatsApp', code: 'WhatsApp', number: '+506 0000-0000', href: 'https://wa.me/50600000000', sortOrder: 3 },
    { type: 'email', label: 'Email', code: 'Email', number: 'reservations@crtravelservice.com', href: 'mailto:reservations@crtravelservice.com', sortOrder: 4 },
    { type: 'social', label: 'Instagram', code: 'Instagram', number: '@crtravelservice', href: 'https://instagram.com/', sortOrder: 5 },
    { type: 'social', label: 'Facebook', code: 'Facebook', number: 'CR Travel Service', href: 'https://facebook.com/', sortOrder: 6 }
]

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

    User.hasMany(UserMessage)
    UserMessage.belongsTo(User)

    Shuttle.belongsTo(Place, {as: 'departing'});
    
    Shuttle.belongsTo(Place, {as: 'destination'});

    FixedRoutePrice.belongsTo(Place, {as: 'departing'});
    FixedRoutePrice.belongsTo(Place, {as: 'destination'});

    try {
        await db.sync({
            alter: true
        })

        const superEmail = process.env.SUPER_USER_EMAIL || 'admin@crtravelservice.com'
        const superPassword = process.env.SUPER_USER_PASSWORD || 'Admin123!'
        const [superUser, created] = await User.findOrCreate({
            where: { email: superEmail },
            defaults: {
                name: 'CR Travel',
                lastName: 'Super Admin',
                email: superEmail,
                phone: '',
                password: bcrypt.hashSync(superPassword, bcrypt.genSaltSync(8)),
                role: 'SUPER',
                active: true,
                token: ''
            }
        })

        if (!created && (superUser.role !== 'SUPER' || !superUser.active)) {
            superUser.role = 'SUPER'
            superUser.active = true
            await superUser.save()
        }

        const pricingCount = await PricingRule.count()
        if (!pricingCount) {
            await PricingRule.bulkCreate(defaultPricingRules)
        }

        let company = await Company.findOne({ where: { isDefault: true } })
        if (!company) {
            const [createdCompany] = await Company.findOrCreate({
                where: { name: defaultCompany.name },
                defaults: defaultCompany
            })
            company = createdCompany
            if (!company.isDefault) {
                company.isDefault = true
                await company.save()
            }
        }

        for (let i = 0; i < defaultContactMethods.length; i++) {
            const contact = defaultContactMethods[i]
            const existingContact = await Phone.findOne({
                where: {
                    companyId: company.id,
                    type: contact.type,
                    label: contact.label
                }
            })

            if (!existingContact) {
                await Phone.create({
                    ...contact,
                    active: true,
                    companyId: company.id
                })
            }
        }

        const serviceRuleCount = await ServicePricingRule.count()
        if (!serviceRuleCount) {
            await ServicePricingRule.bulkCreate(defaultServiceRules)
        }
    } catch (e) {
        console.log(e)
    }

    console.log(chalk.cyan('[Database] Database initialized'))
}

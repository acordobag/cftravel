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
import PricingZone from '../models/pricing-zone.model'
import FixedRoutePrice from '../models/fixed-route-price.model'
import ServicePricingRule from '../models/service-pricing-rule.model'
import UserMessage from '../models/user-message.model'
import BookingPolicy from '../models/booking-policy.model'
import bcrypt from 'bcryptjs'
import { confirmedFixedRoutes, standardizedPricingRules } from './pricing-standardization.data'

const defaultPricingRules = standardizedPricingRules

const normalizePlaceName = value => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

const matchesAlias = (place, aliases) => {
    const name = normalizePlaceName(place.name)
    return aliases.some(alias => name.includes(normalizePlaceName(alias)))
}

const syncConfirmedFixedRoutes = async () => {
    const places = await Place.findAll()

    for (const item of confirmedFixedRoutes) {
        const departing = places.find(place => matchesAlias(place, item.departingAliases))
        const destination = places.find(place => matchesAlias(place, item.destinationAliases))

        if (!departing || !destination) {
            console.log(`[Pricing] Fixed route skipped because a place was not found: ${item.label}`)
            continue
        }

        let route = await FixedRoutePrice.findOne({
            where: { departingId: departing.id, destinationId: destination.id }
        })
        if (!route) {
            route = await FixedRoutePrice.findOne({
                where: { departingId: destination.id, destinationId: departing.id }
            })
        }
        if (!route) {
            route = await FixedRoutePrice.create({
                departingId: departing.id,
                destinationId: destination.id,
                price: item.price,
                roundTripPrice: null,
                label: item.label,
                notes: 'Customer-confirmed commercial fare.',
                active: true
            })
        }

        route.price = item.price
        route.label = item.label
        route.active = true
        await route.save()
    }
}

const defaultServiceRules = [
    { title: 'Fixed route prices win first', description: 'If a route has a fixed price, the customer quote uses that amount instead of the distance formula.', sortOrder: 1 },
    { title: 'SJO zones standardize common routes', description: 'When a destination belongs to an SJO price zone, every hotel in that zone inherits the same commercial base price.', sortOrder: 2 },
    { title: 'Distance rules fill the gaps', description: 'When neither a fixed price nor a zone applies, the quote uses route and operations distance with a continuous fallback rate.', sortOrder: 3 },
    { title: 'Final confirmation stays human', description: 'Ferries, borders, remote roads, custom stops, late-night timing, or special luggage require operational review.', sortOrder: 4 }
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

    Place.belongsTo(PricingZone, {
        foreignKey: { name: 'pricingZoneId', allowNull: true },
        constraints: false
    });
    PricingZone.hasMany(Place, {
        foreignKey: { name: 'pricingZoneId', allowNull: true },
        constraints: false
    });
    PricingZone.belongsTo(Place, { as: 'origin', foreignKey: 'originPlaceId' });

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

        await syncConfirmedFixedRoutes()

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

        const policyCount = await BookingPolicy.count()
        if (!policyCount) {
            await BookingPolicy.create({
                infantRate: 0,
                toddlerRate: 0,
                preschoolRate: 15,
                childRate: 25,
                minHoursCancel: 48,
                cancelFeePercent: 50,
                minHoursEdit: 24,
                editFeePercent: 25,
                isDefault: true
            })
        }
    } catch (e) {
        console.log(e)
        throw e
    }

    console.log(chalk.cyan('[Database] Database initialized'))
}

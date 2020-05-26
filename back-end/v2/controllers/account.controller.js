import Account from '../models/account.model'
import Payment from '../models/payment.model'
import User from '../models/user.model'
import PaymentTerm from '../models/paymentTerm.model'



async function save(req, res, next) {
    try {
        let account = {
            name: req.body.name,
            initialAmmount: req.body.initialAmmount,
            actualAmmount: req.body.actualAmmount,
            interestRate: req.body.interestRate,
            numberOfPayments: req.body.numberOfPayments,
            charge: req.body.charge,
            paymentTermId: req.body.paymentTerm.id,
            customerId: req.body.customer.id,
            already_pay: req.body.already_pay
        }
        account = await Account.create(account)
        res.status(200).send(account).end()
    } catch (e) {
        next(e)
        console.error(e)
    }

}

async function findAll(req, res, next) {
    try {
        let accounts = await Account.findAll({ include: [PaymentTerm] })
        res.status(200).send(accounts).end()
    } catch (e) {
        next(e)
    }

}

async function findById(req, res, next) {
    try {
        let account = await Account.find({
            where: { id: req.body.id },
            include: [{ model: Payment, include: [User] }]
        })
        res.status(200).send(account).end()
    } catch (e) {
        next(e)
    }
}

async function addPayment(req, res, next) {
    try {
        let payment = {
            ammount: req.body.ammount,
            approved: req.body.approved,
            date: req.body.date,
            userId: req.body.user.id,
            accountId: req.body.account.id
        }
        payment = await Payment.create(payment)
        res.status(200).send(payment).end()
    } catch (e) {
        next(e)
    }
}

async function findAllPendingPayments(req, res, next) {
    try {
        let payments = await Payment.findAll({
            where: { approved: false },
            include: [User, Account]
        })
        res.status(200).send(payments).end()
    } catch (e) {
        next(e)
    }

}

async function approvePayment(req, res, next) {
    try {
        let payment = await Payment.find({ where: { id: req.body.id } })
        payment.approved = true
        await payment.save()
        res.status(200).send(payment).end()
    } catch (e) {
        next(e)
    }
}
async function approveListOfPayments(req, res, next) {
    try {
        let payments = req.body.payments
        let payment
        for (let p of payments) {
            payment = await Payment.findOne({ where: { id: p.id } })
            payment.approved = true
            await payment.save()
        }
        res.status(200).send({}).end()
    } catch (e) {
        next(e)
    }
}

async function findAccountPayments(req, res, next) {
    try {
        let payments = await Payment.find({ where: { accountId: req.body.id } })
        res.status(200).send(payments).end()
    } catch (e) {
        next(e)
    }

}

async function findAllPaymentsTerms(req, res, next) {
    try {
        let payments = await PaymentTerm.findAll()
        res.status(200).send(payments).end()
    } catch (e) {
        next(e)
    }
}

export default {
    save,
    findAll,
    findById,
    addPayment, 
    findAllPendingPayments,
    approvePayment,
    approveListOfPayments,
    findAccountPayments,
    findAllPaymentsTerms
}
'use strict'

import bcrypt from 'bcryptjs'
import jwt from 'jwt-simple'
import settings from '../config'
import User from '../models/user.model'
import Mail from '../utils/mail.util'

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  lastName: user.lastName,
  email: user.email,
  phone: user.phone,
  role: user.role,
  active: user.active,
  mustChangePassword: user.mustChangePassword || false
})

const createToken = (user) => jwt.encode({
  id: user.id,
  email: user.email,
  role: user.role
}, settings.authentication.jwtSecret)

const Auth = {
  signup: async (req, res, next) => {
    try {
      const existing = await User.findOne({ where: { email: req.body.email } })
      if (existing && existing.emailVerified) {
        return res.status(409).json({ message: 'This email is already registered.' })
      }

      const code = generateCode()

      if (existing && !existing.emailVerified) {
        // Resend verification code to an unverified account
        existing.emailVerificationCode = code
        await existing.save()
        Mail.emailVerification(existing, code).catch(() => {})
        return res.status(200).json({ pendingVerification: true })
      }

      const user = await User.create({
        name: req.body.name,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone || '',
        password: '',
        role: 'USER',
        active: true,
        token: '',
        emailVerified: false,
        emailVerificationCode: code,
        mustChangePassword: false
      })

      Mail.emailVerification(user, code).catch(() => {})
      res.status(200).json({ pendingVerification: true })
    } catch (e) {
      next(e)
    }
  },

  verifyEmail: async (req, res, next) => {
    try {
      const user = await User.findOne({ where: { email: req.body.email } })
      if (!user) {
        return res.status(404).json({ message: 'Account not found.' })
      }
      if (user.emailVerified) {
        return res.status(409).json({ message: 'Email already verified.' })
      }
      if (!req.body.code || user.emailVerificationCode !== String(req.body.code)) {
        return res.status(400).json({ message: 'Invalid or expired verification code.' })
      }
      if (!req.body.password || req.body.password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters.' })
      }

      user.emailVerified = true
      user.emailVerificationCode = null
      user.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8))

      const token = createToken(user)
      user.token = token
      await user.save()

      Mail.welcomeCustomer(user).catch(() => {})
      res.status(200).json({ token, user: sanitizeUser(user) })
    } catch (e) {
      next(e)
    }
  },

  login: async (req, res, next) => {
    try {
      const user = await User.findOne({ where: { email: req.body.email } })
      if (!user || !user.active) {
        return res.status(401).json({ message: 'Invalid email or password.' })
      }
      if (!user.emailVerified) {
        return res.status(403).json({ message: 'Please verify your email before logging in.' })
      }

      const isMatch = bcrypt.compareSync(req.body.password || '', user.password || '')
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password.' })
      }

      const token = createToken(user)
      user.token = token
      await user.save()

      res.status(200).json({ token, user: sanitizeUser(user) })
    } catch (e) {
      next(e)
    }
  },

  changePassword: async (req, res, next) => {
    try {
      const user = req.authUser
      if (!req.body.password || req.body.password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters.' })
      }

      const dbUser = await User.findOne({ where: { id: user.id } })
      dbUser.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8))
      dbUser.mustChangePassword = false
      await dbUser.save()

      res.status(200).json({ message: 'Password updated.' })
    } catch (e) {
      next(e)
    }
  },

  me: async (req, res) => {
    res.status(200).json(sanitizeUser(req.authUser))
  },

  findAll: async (req, res, next) => {
    try {
      const users = await User.findAll({ order: [['id', 'ASC']] })
      res.status(200).json(users.map(sanitizeUser))
    } catch (e) {
      next(e)
    }
  },

  createPrivileged: async (req, res, next) => {
    try {
      const role = req.body.role === 'SUPER' ? 'SUPER' : 'ADMIN'
      const existing = await User.findOne({ where: { email: req.body.email } })
      if (existing) {
        return res.status(409).json({ message: 'This email is already registered.' })
      }

      const user = await User.create({
        name: req.body.name,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
        password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8)),
        role,
        active: true,
        token: '',
        emailVerified: true,
        mustChangePassword: false
      })

      res.status(201).json(sanitizeUser(user))
    } catch (e) {
      next(e)
    }
  },

  updateUser: async (req, res, next) => {
    try {
      const user = await User.findOne({ where: { id: req.params.id } })
      if (!user) {
        return res.status(404).json({ message: 'User not found.' })
      }

      user.name = req.body.name
      user.lastName = req.body.lastName
      user.phone = req.body.phone
      user.active = req.body.active
      user.role = req.body.role === 'SUPER' ? 'SUPER' : req.body.role === 'ADMIN' ? 'ADMIN' : 'USER'

      if (req.body.password) {
        user.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8))
      }

      await user.save()
      res.status(200).json(sanitizeUser(user))
    } catch (e) {
      next(e)
    }
  }
}

module.exports = Auth

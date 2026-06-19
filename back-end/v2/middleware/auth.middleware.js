import jwt from 'jwt-simple'
import settings from '../config'
import User from '../models/user.model'

const getToken = (req) => {
  const header = req.headers.authorization || ''
  if (header.startsWith('Bearer ')) {
    return header.replace('Bearer ', '')
  }

  if (header.startsWith('JWT ')) {
    return header.replace('JWT ', '')
  }

  return ''
}

export const requireAuth = async (req, res, next) => {
  try {
    const token = getToken(req)
    if (!token) {
      return res.status(401).json({ message: 'Authentication required.' })
    }

    const payload = jwt.decode(token, settings.authentication.jwtSecret)
    const user = await User.findOne({ where: { id: payload.id, active: true } })

    if (!user) {
      return res.status(401).json({ message: 'Invalid session.' })
    }

    req.authUser = user
    next()
  } catch (e) {
    res.status(401).json({ message: 'Invalid session.' })
  }
}

export const requirePrivileged = async (req, res, next) => {
  await requireAuth(req, res, () => {
    if (!['ADMIN', 'SUPER'].includes(req.authUser.role)) {
      return res.status(403).json({ message: 'Privileged access required.' })
    }
    next()
  })
}

export const requireSuper = async (req, res, next) => {
  await requireAuth(req, res, () => {
    if (req.authUser.role !== 'SUPER') {
      return res.status(403).json({ message: 'Super user access required.' })
    }
    next()
  })
}

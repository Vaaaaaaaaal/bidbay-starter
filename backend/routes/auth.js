import { User } from '../orm/index.js'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../consts/secret.js'
import express from 'express'
import { getDetails } from '../validators/index.js'
/**
 * @typedef {import('../orm/models/user.js')}
 */
/**
 * @typedef {import('../types/types.js')}
 */

const router = express.Router()

/**
 * @typedef {object} RegisterRequestBody
 * @property {string} username
 * @property {string} email
 * @property {string} password
 */

/**
 * Endpoint pour la création d'un nouvel utilisateur
 * @param {import('express').Request<{}, {}, RegisterRequestBody>} req
 * @param {import('express').Response} res
 */
router.post('/api/auth/register', async (req, res) => {
  try {
    /** @type {RegisterRequestBody} */
    const reqBody = req.body
    const { username, email, password } = reqBody

    // Vérifier si l'utilisateur existe déjà
    /** @type {UserObject | null} */
    const userWithSameEmail = await User.findOne({ where: { email } })

    if (userWithSameEmail) {
      return res.status(409).json({ error: 'E-mail already used' })
    }

    // Vérifier si l'utilisateur existe déjà
    /** @type {UserObject | null} */
    const userWithSameUsername = await User.findOne({
      attributes: ['id', 'username', 'email', 'admin'],
      where: { username }
    })

    if (userWithSameUsername) {
      return res.status(409).json({ error: 'Username already used' })
    }

    // Créer le nouvel utilisateur
    /** @type {UserObject} */
    const newUser = await User.create({
      username,
      email,
      password
    })

    // Générer un token JWT pour l'authentification future
    /** @type {Token} */
    const payload = {
      id: newUser.id,
      username,
      email,
      admin: email.endsWith('@admin.org')
    }
    /** @type {string} */
    const token = jwt.sign(payload, JWT_SECRET)



    // Renvoyer l'utilisateur et le token
    res.status(201).json({ access_token: token})
  } catch (e) {
    res.status(400).json({ error: 'Invalid or missing information' })
  }
})

/**
 * @typedef {object} LoginRequestBody
 * @property {string} email
 * @property {string} password
 */

/**
 * Endpoint pour l'authentification d'un utilisateur enregistré
 * @param {import('express').Request<{}, {}, LoginRequestBody>} req
 * @param {import('express').Response} res
 */
router.post('/api/auth/login', async (req, res) => {
  /** @type {LoginRequestBody} */
  const reqBody = req.body
  const { email, password } = reqBody

  try {
    // Vérifier si l'utilisateur existe
    /** @type {UserObject | null} */
    const user = await User.findOne({
      where: { email }
    })

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    console.log(user.password, password)

    // Vérifier le mot de passe de l'utilisateur
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials.' })
    }

    // Générer un token JWT pour l'authentification future
    /** @type {Token} */
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      admin: user.admin
    }
    /** @type {string} */
    const token = jwt.sign(payload, JWT_SECRET)

    // Renvoyer le token
    res.status(200).json({ access_token: token })
  } catch (e) {
    res.status(401).json({ error: 'Invalid credentials', details: getDetails(e) })
  }
})

export default router

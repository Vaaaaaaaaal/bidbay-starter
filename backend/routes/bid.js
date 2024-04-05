import authMiddleware from '../middlewares/auth.js'
import { Bid, Product } from '../orm/index.js'
import express from 'express'
import { getDetails } from '../validators/index.js'

const router = express.Router()

/**
 * @typedef {object} RegisterRequestBody
 * @property {string} id
 * @property {int} price
 * @property {string} bidderId
 * @property {Date} date
 */



/**
 * Endpoint pour la suppression d'un bid
 * @param {import('express').Request<{}, {}, RegisterRequestBody>} req
 * @param {import('express').Response} res
 */

router.delete('/api/bids/:bidId', authMiddleware, async (req, res) => {
  try {
    /** @type {BidObject} */
    const bidToDestroy = await Bid.findByPk(req.params.bidId)
    if (!bidToDestroy) {
      return res.status(404).json({ message: 'Bid non trouvé' })
    }
    if (bidToDestroy.bidderId !== req.user.id && !req.user.admin) {
      return res.status(403).json({ message: 'Action non autorisée' })
    }
    await bidToDestroy.destroy()
    res.status(204).json()
  } catch (err) {
    res.status(401).json({ message: err.message })
  }
})

/**
 * Endpoint pour la création d'un bid
 * @param {import('express').Request<{}, {}, RegisterRequestBody>} req
 * @param {import('express').Response} res
 */
router.post('/api/products/:productId/bids', authMiddleware, async (req, res) => {
  try {
    /** @type {RegisterRequestBody} */
    const { price } = req.body
    if (!req.user.id && !req.user.admin) {
      return res.status(401).json({ message: 'Action non autorisée' })
    }
    /** @type {BidObject} */
    let bid
    try {
      bid = await Bid.create({
        productId: req.params.productId,
        price,
        date: Date.now(),
        bidderId: req.user.id
      })
    } catch (er) {
      return res.status(400).json({ error: 'Invalid or missing fields', details: 'Missing price field' })
    }
    res.status(201).json(bid)
  } catch (err) {
    res.status(401).json({ message: err.message })
  }
})

export default router

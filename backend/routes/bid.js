import authMiddleware from '../middlewares/auth.js'
import { Bid, Product } from '../orm/index.js'
import express from 'express'
import { getDetails } from '../validators/index.js'

const router = express.Router()

router.delete('/api/bids/:bidId', async (req, res) => {
  res.status(600).send()
})

router.post('/api/products/:productId/bids', authMiddleware, async (req, res) => {
  try {
    const { price } = req.body
    if (!req.user.id && !req.user.admin) {
      return res.status(401).json({ message: 'Action non autorisée' })
    }
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

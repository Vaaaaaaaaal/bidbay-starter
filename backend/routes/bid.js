import authMiddleware from '../middlewares/auth.js'
import { Bid, Product } from '../orm/index.js'
import express from 'express'
import { getDetails } from '../validators/index.js'

const router = express.Router()

router.delete('/api/bids/:bidId', authMiddleware, async (req, res) => {
  try {
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

router.post('/api/products/:productId/bids', async (req, res) => {
  res.status(600).send()
})

export default router

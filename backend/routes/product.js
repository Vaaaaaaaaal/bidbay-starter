import express from 'express'
import { Product, Bid, User } from '../orm/index.js'
import authMiddleware from '../middlewares/auth.js'
import { getDetails } from '../validators/index.js'

const router = express.Router()

router.get('/api/products', async (req, res, next) => {
  res.status(600).send()
})

router.get('/api/products/:productId', async (req, res) => {
  res.status(600).send()
})

router.post('/api/products/add', async (req, res) => {
  try {
    /** @type {AddRequestBody} */
    const reqBody = req.body
    const {name, description, category, originalPrice, pictureUrl, endDate, sellerId } = reqBody

    // Créer le nouveau produit
    /** @type {ProductObject} */
    const newProduct = await Product.create({
      name,
      description,
      category,
      originalPrice,
      pictureUrl,
      endDate,
      sellerId,
    });

    res.status(201).json({newProduct : newProduct})
  } catch (e) {
    res.status(400).json({ error: 'Invalid or missing information', details: e })
  }
  
});


router.put('/api/products/:productId', async (req, res) => {
  res.status(600).send()
})

router.delete('/api/products/:productId', async (req, res) => {
  res.status(600).send()
})

export default router

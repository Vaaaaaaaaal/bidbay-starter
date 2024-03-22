import express from 'express'
import { Product, Bid, User } from '../orm/index.js'
import authMiddleware from '../middlewares/auth.js'
import { getDetails } from '../validators/index.js'

const router = express.Router()



router.get('/api/products', async (req, res, next) => {
  try {
    res.json(await Product.findAll(
      {
        include: [{
          model: User,
          as: 'seller',
          attributes: ['id', 'username']
        }, {
          model: Bid,
          as: 'bids',
          attributes: ['id', 'price', 'date']
        }]
      }
    ))
  } catch (error) {
    res.status(400).json({ error })
  }
  res.status(600).send()
})





router.get('/api/products/:productId', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.productId, {
      include: [{
        model: User,
        as: 'seller'
      }, {
        model: Bid,
        as: 'bids',
        include: {
          model: User,
          as: 'bidder'  
        }
      }]
    });
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
    } else {
      res.status(200).json(product);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// You can use the authMiddleware with req.user.id to authenticate your endpoint ;)

router.post('/api/products', (req, res) => {
  res.status(600).send()
})

router.put('/api/products/:productId', async (req, res) => {
  res.status(600).send()
})

router.delete('/api/products/:productId', authMiddleware, async (req, res) => {
  const { productId } = req.params;

  let product = await Product.findByPk(productId)

  if (!product) {
    res.status(404).json({
      'error': 'Product not found'
    })
    return
  }

  if (product.sellerId != req.user.id && !req.user.admin) {
    res.status(403).json({
      'error': 'User not granted'
    })
    return
  }

  await product.destroy()

  res.status(204).json()
})


export default router

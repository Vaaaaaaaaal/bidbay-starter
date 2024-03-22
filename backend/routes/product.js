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

  try {

    let { productId } = req.params;

    req.body.sellerId = req.user.id;

    let data = await Product.findOne(
      {
        where: { id: productId },
        include: [{
          model: User,
          as: 'seller',
          attributes: ['id', 'username', 'admin']
        }, {
          model: Bid,
          as: 'bids',
          attributes: ['id', 'price', 'date'],
          include: [{
            model: User,
            as: 'bidder',
            attributes: ['id', 'username']
          }]
        }]
      }
    )

    if (!data) {
      res.status(404).send()
    } else if (data.sellerId !== req.user.id && !req.user.admin) {
      res.status(403).send()
    } else {
      res.status(204).json(await Product.destroy(
        { where: { id: productId } }
      ))
    }

  } catch (error) {
    res.status(400).json({ error: "Invalid or missing fields", details: error })
  }

  res.status(600).send()
  const found = Product.some(todo => todo.id === req.params.id)
  if (!found) {
    res.status(400).json({ msg: `No meber whit id of ${req.params.id}` })
  } else {
    Product.filter(todo => todo.id !== req.params.id)
    res.json(Product)
  }
})


export default router

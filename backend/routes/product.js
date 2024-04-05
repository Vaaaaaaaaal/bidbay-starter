import express from 'express'
import { Product, Bid, User } from '../orm/index.js'
import authMiddleware from '../middlewares/auth.js'
import { getDetails } from '../validators/index.js'

const router = express.Router()
/**
 * @typedef {object} RegisterRequestBody
 * @property {string} name
 * @property {string} description
 * @property {string} pictureUrl
 * @property {string} category
 * @property {int} originalPrice
 * @property {Date} endDate
 * @property {string} sellerId
 * 
 */

/**
 * @typedef {object} ProductObject
 * @property {string} name
 * @property {string} description
 * @property {string} pictureUrl
 * @property {string} category
 * @property {int} originalPrice
 * @property {Date} endDate
 * @property {string} sellerId
 * 
 */

/**
 * Endpoint pour récupérer les produits
 * @param {import('express').Request<{}, {}, RegisterRequestBody>} req
 * @param {import('express').Response} res
 * @param {} next  
 */
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




/**
 * Endpoint pour récupérer un produit
 * @param {import('express').Request<{}, {}, RegisterRequestBody>} req
 * @param {import('express').Response} res
 */
router.get('/api/products/:productId', async (req, res) => {
  try {
    /** @type {ProductObject} */
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

/**
 * Endpoint pour créer un produit
 * @param {import('express').Request<{}, {}, RegisterRequestBody>} req
 * @param {import('express').Response} res
 */
router.post('/api/products', authMiddleware, async (req, res) => {
  /** @type {RegisterRequestBody} */
  const { name, description, pictureUrl, category, originalPrice, endDate } = req.body;

  try {
    /** @type {ProductObject} */
    let product = await Product.create({
      name, 
      description, 
      pictureUrl, 
      category, 
      originalPrice, 
      endDate, 
      sellerId : req.user.id
    })

    res.status(201).json(product)
  } catch (e) {
    res.status(400).json({
      'error': 'Invalid or missing fields', 
      'details': getDetails(e)
    })
  }
})

/**
 * Endpoint pour modifier un produit
 * @param {import('express').Request<{}, {}, RegisterRequestBody>} req
 * @param {import('express').Response} res
 */
router.put('/api/products/:productId', authMiddleware, async (req, res) => {
  /**@type {int} */
  const { productId } = req.params;
  /**@type {RegisterRequestBody} */
  const { name, description, pictureUrl, category, originalPrice, endDate } = req.body;
  /** @type {ProductObject} */
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

  try {
    /** @type {ProductObject} */
    let updatedProduct = await product.update({
      name,
      description,
      pictureUrl,
      category,
      originalPrice,
      endDate
    })

    /** @type {JSON} */ 
    const response = updatedProduct.toJSON()
    delete response['createdAt']
    delete response['updatedAt']

    res.status(200).json(response)

  } catch (e) {
    res.status(400).json({
      'error': 'Invalid or missing fields', 
      'details': getDetails(e)
    })
  }
})

/**
 * Endpoint pour supprimer un produit
 * @param {import('express').Request<{}, {}, RegisterRequestBody>} req
 * @param {import('express').Response} res
 */

router.delete('/api/products/:productId', authMiddleware, async (req, res) => {
  const { productId } = req.params;
  /** @type {ProductObject} */
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

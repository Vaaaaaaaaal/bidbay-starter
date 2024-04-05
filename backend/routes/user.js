import express from 'express'
import { User, Product, Bid } from '../orm/index.js'
/**
 * @typedef {import('../orm/models/user.js')}
 */

const router = express.Router()

/**
 * @typedef {object} RegisterRequestBody
 * @property {string} username
 * @property {string} email
 * @property {string} password
 */


router.get('/api/users/:userId', async (req, res) => {
  /** @type {string} */
  const userId = req.params.userId;
  try {
    /** @type {UserObject} */
    const user = await User.findOne({
      where: { id: userId },
      include: [
        { model: Product, as: 'products' },
        { model: Bid, as: 'bids' , include: [{ model: Product, as: 'product' }] }
      ]
    });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.status(200).json(user);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router
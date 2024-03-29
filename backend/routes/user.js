import express from 'express'
import { User, Product, Bid } from '../orm/index.js'

const router = express.Router()

router.get('/api/users/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
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
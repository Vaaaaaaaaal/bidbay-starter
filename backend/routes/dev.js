import express from 'express'
import { regenerateFixtures } from '../orm/fixtures/index.js'

const router = express.Router()
/**
 * Endpoint pour
 * @param {import('express').Request<{}, {}, RegisterRequestBody>} req
 * @param {import('express').Response} res
 */
router.get('/api/dev/reset', async (req, res) => {
  await regenerateFixtures()
  res.status(200).send('OK')
})

export default router

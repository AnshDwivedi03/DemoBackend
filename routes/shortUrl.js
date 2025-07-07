const { Router } = require('express');
const { nanoid } = require('nanoid'); // or use crypto
const Cache = require('../models/user');
const {requireAuth}= require('../middleware/auth');


const axios = require('axios');
const { createClient } = require('redis');

const redisClient = createClient({
  url: 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.error('Redis Error:', err));

(async () => {
  await redisClient.connect();
})();

const router = Router();

router.post('/setup', requireAuth, async (req, res) => {
  const { curl, updateMethod } = req.body;

  if (!curl || !updateMethod) {
    return res.status(400).json({ error: 'curl and updateMethod are required' });
  }

  const shortId = nanoid(8);

  try {
    const cacheEntry = new Cache({
      user: req.user.id,
      curl,
      shortId,
      updateMethod,
    });

    await cacheEntry.save();
    const response = await axios.get(curl);
    await redisClient.set(`cache:${shortId}`, JSON.stringify(response.data));

    res.status(201).json({
      message: 'Short URL created and stored',
      shortUrl: `/api/${shortId}`
    });
  } catch (err) {
    console.error('Error saving cache entry:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:shortId', async (req, res) => {
  const { shortId } = req.params;

  const cached = await redisClient.get(`cache:${shortId}`);
  if (!cached) return res.status(404).json({ error: 'Not found in Redis' });

  res.json(JSON.parse(cached));
});


module.exports = router;

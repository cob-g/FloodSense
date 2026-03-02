import express from 'express';

const router = express.Router();

// @route   GET /api/geocode/reverse?lat=&lng=
// @desc    Proxy Nominatim reverse geocoding to avoid browser CORS blocks
// @access  Public
router.get('/reverse', async (req, res) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: 'lat and lng query params are required' });
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
    const response = await fetch(url, {
      headers: {
        // Nominatim requires a User-Agent identifying the application
        'User-Agent': 'FloodSense/1.0 (flood monitoring app)',
        'Accept-Language': 'en',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Nominatim request failed' });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Reverse geocode proxy error:', err.message);
    res.status(500).json({ error: 'Failed to fetch geocoding data' });
  }
});

export default router;

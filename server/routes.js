import express from 'express';
import passport from 'passport';
import Search from './models/search.js';
import User from './models/User.js';
import fetch from 'node-fetch';

const router = express.Router();

const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Please log in to access this resource' });
};

router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/auth/google/callback',
  passport.authenticate('google', { 
    failureRedirect: `${process.env.CLIENT_URL}/login`,
    session: true 
  }),
  (req, res) => {
    res.redirect(`${process.env.CLIENT_URL}/dashboard`);
  }
);

router.get('/auth/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.displayName,
        email: req.user.email,
        avatar: req.user.avatar
      }
    });
  } else {
    res.json({
      success: false,
      user: null
    });
  }
});

router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

router.get('/top-searches', async (req, res) => {
  try {
    const topSearches = await Search.aggregate([
      {
        $group: {
          _id: '$term',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      },
      {
        $project: {
          term: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);
    
    res.json({ success: true, data: topSearches });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/search', ensureAuthenticated, async (req, res) => {
  try {
    const { term } = req.body;
    
    if (!term || term.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        error: 'Search term is required' 
      });
    }

    const searchTerm = term.trim();
    
    await Search.create({
      userId: req.user._id,
      term: searchTerm
    });

    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchTerm)}&per_page=20&client_id=${process.env.UNSPLASH_ACCESS_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Unsplash API request failed');
    }
    
    const data = await response.json();
    
    const images = data.results.map(image => ({
      id: image.id,
      urls: image.urls,
      alt_description: image.alt_description,
      description: image.description,
      user: {
        name: image.user.name,
        username: image.user.username
      },
      likes: image.likes
    }));
    
    res.json({
      success: true,
      data: {
        term: searchTerm,
        total: data.total,
        results: images
      }
    });
    
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch images' 
    });
  }
});

router.get('/search/history', ensureAuthenticated, async (req, res) => {
  try {
    const history = await Search.find({ userId: req.user._id })
      .sort({ timestamp: -1 })
      .limit(20)
      .select('term timestamp -_id');
    
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
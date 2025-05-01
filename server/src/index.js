require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const User = require('./models/User');
const Store = require('./models/Store');
const Rating = require('./models/Rating');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// MongoDB connection with better error handling
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Error handling for MongoDB connection after initial connection
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Validation middleware
const validateUser = [
  body('name').isLength({ min: 20, max: 60 }),
  body('email').isEmail(),
  body('password').matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/),
  body('address').isLength({ max: 400 }),
];

const validateStore = [
  body('name').isLength({ min: 3, max: 100 }).withMessage('Store name must be between 3 and 100 characters'),
  body('email').isEmail().withMessage('Invalid email format'),
  body('address').isLength({ min: 10, max: 400 }).withMessage('Address must be between 10 and 400 characters'),
  body('owner_id').isMongoId().withMessage('Invalid owner ID')
];

const validateRating = [
  body('store_id').isMongoId().withMessage('Invalid store ID'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
];

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Role-based authorization middleware
const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }
    next();
  };
};

// Auth routes
app.post('/api/auth/register', validateUser, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, address, role = 'user' } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      address,
      role
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Registration failed', details: error.message });
    }
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
});

// Store routes
app.post('/api/stores', authenticateToken, authorizeRole(['admin']), validateStore, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, address, owner_id } = req.body;
    
    // Check if owner exists
    const owner = await User.findById(owner_id);
    if (!owner) {
      return res.status(400).json({ error: 'Owner not found' });
    }

    const store = new Store({
      name,
      email,
      address,
      owner: owner_id
    });

    await store.save();
    res.status(201).json(store);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'Store email already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create store', details: error.message });
    }
  }
});

app.get('/api/stores', async (req, res) => {
  try {
    const { search, sort, order } = req.query;
    let query = Store.find();

    if (search) {
      query = query.or([
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ]);
    }

    if (sort) {
      const sortOrder = order === 'desc' ? -1 : 1;
      query = query.sort({ [sort]: sortOrder });
    }

    const stores = await query.populate('owner', 'name email');
    res.json(stores);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stores', details: error.message });
  }
});

app.put('/api/stores/:id', authenticateToken, authorizeRole(['admin']), validateStore, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, address, owner_id } = req.body;
    const storeId = req.params.id;

    // Check if store exists
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Check if owner exists
    const owner = await User.findById(owner_id);
    if (!owner) {
      return res.status(400).json({ error: 'Owner not found' });
    }

    const updatedStore = await Store.findByIdAndUpdate(
      storeId,
      { name, email, address, owner: owner_id },
      { new: true, runValidators: true }
    );

    res.json(updatedStore);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'Store email already exists' });
    } else {
      res.status(500).json({ error: 'Failed to update store', details: error.message });
    }
  }
});

app.delete('/api/stores/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const storeId = req.params.id;
    
    // Check if store exists
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Delete associated ratings
    await Rating.deleteMany({ store: storeId });
    
    // Delete store
    await Store.findByIdAndDelete(storeId);
    
    res.json({ message: 'Store and associated ratings deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete store', details: error.message });
  }
});

// Rating routes
app.post('/api/ratings', authenticateToken, authorizeRole(['user']), validateRating, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { store_id, rating } = req.body;
    const user_id = req.user.id;

    // Check if store exists
    const store = await Store.findById(store_id);
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const ratingDoc = await Rating.findOneAndUpdate(
      { store: store_id, user: user_id },
      { rating },
      { upsert: true, new: true }
    );

    res.status(201).json(ratingDoc);
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit rating', details: error.message });
  }
});

app.delete('/api/ratings/:id', authenticateToken, async (req, res) => {
  try {
    const ratingId = req.params.id;
    const userId = req.user.id;

    const rating = await Rating.findById(ratingId);
    if (!rating) {
      return res.status(404).json({ error: 'Rating not found' });
    }

    // Check if user is the owner of the rating or an admin
    if (rating.user.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this rating' });
    }

    await Rating.findByIdAndDelete(ratingId);
    res.json({ message: 'Rating deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete rating', details: error.message });
  }
});

// Admin dashboard routes
app.get('/api/admin/stats', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      User.countDocuments(),
      Store.countDocuments(),
      Rating.countDocuments()
    ]);

    res.json({
      total_users: totalUsers,
      total_stores: totalStores,
      total_ratings: totalRatings
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch statistics', details: error.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 
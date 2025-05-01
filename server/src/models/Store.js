const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    maxlength: 400
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Virtual for average rating
storeSchema.virtual('averageRating').get(function() {
  return this.ratings.reduce((acc, curr) => acc + curr.rating, 0) / this.ratings.length || 0;
});

module.exports = mongoose.model('Store', storeSchema); 
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  preferences: {
    favoriteGenres: [{
      type: String
    }],
    interests: [{
      type: String
    }],
    scanPaths: [{
      type: String
    }]
  }
}, {
  timestamps: true
});

export default mongoose.model('User', userSchema);

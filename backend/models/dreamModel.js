import mongoose from 'mongoose';

const dreamSchema = new mongoose.Schema({
  userId: {
    type: String, // Clerk user ID
    required: true,
    index: true
  },
  dream: {
    type: String,
    required: true
  },
  interpretation: {
    type: String,
    required: true
  },
  rawResponse: {
    type: Object
  },
  date: {
    type: Date,
    default: Date.now
  }
});

export const Dream = mongoose.model('Dream', dreamSchema);

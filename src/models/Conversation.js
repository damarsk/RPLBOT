const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: String,
  parts: [{ text: String }],
  tokenCount: Number,
});

const conversationSchema = new mongoose.Schema({
  channelId: String,
  messages: [messageSchema],
  totalTokens: { type: Number, default: 0 },
});

module.exports = mongoose.model('Conversation', conversationSchema);
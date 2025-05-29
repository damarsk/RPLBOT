const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  userId: String,
  tasks: [
    {
      text: String,
      completed: { type: Boolean, default: false }
    }
  ]
});

module.exports = mongoose.model('Todo', todoSchema);
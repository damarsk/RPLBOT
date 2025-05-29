const mongoose = require('mongoose');

module.exports = () => {
    mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB!');
    }).catch((err) => {
        console.log('❌ Failed to connect to MongoDB:', err);
    })
}
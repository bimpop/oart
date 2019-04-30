
const mongoose = require('mongoose');

// comment schema
const commentSchema = new mongoose.Schema({
    text: String,
    author: String
});

// comment model
module.exports = mongoose.model('Comment', commentSchema);
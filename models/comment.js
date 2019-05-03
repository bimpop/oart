
const mongoose = require('mongoose');

// comment schema
const commentSchema = new mongoose.Schema({
    author: String,
    text: String
});

// comment model
module.exports = mongoose.model('Comment', commentSchema);
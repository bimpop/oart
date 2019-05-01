
const mongoose = require('mongoose');

// comment schema
const commentSchema = new mongoose.Schema({
    text: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        username: String
    }
});

// comment model
module.exports = mongoose.model('Comment', commentSchema);
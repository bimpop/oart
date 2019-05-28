
var mongoose = require('mongoose');

// comment schema
var commentSchema = new mongoose.Schema({
    author: String,
    text: String,
    createdAt: {type: Date, default: Date.now}
});

// comment model
module.exports = mongoose.model('Comment', commentSchema);
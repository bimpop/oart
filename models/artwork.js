
var mongoose = require('mongoose');

// artwork schema
var artworkSchema = new mongoose.Schema({
    title: String,
    image: String,
    imageId: String,
    desc: String,
    createdAt: {type: Date, default: Date.now},
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        username: String
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }]
});
// artwork model from schema
module.exports = mongoose.model('Artwork', artworkSchema);
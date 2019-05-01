
const mongoose = require('mongoose');

// artwork schema
const artworkSchema = new mongoose.Schema({
    title: String,
    image: String,
    desc: String,
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
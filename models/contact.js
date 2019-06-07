
var mongoose = require('mongoose');

// contact schema
var contactSchema = new mongoose.Schema({
    name: String,
    email: String,
    image: String,
    imageId: String,
    message: String,
    status: {
        type: String,
        default: 'unchecked'
    }
});
// contact model from schema
module.exports = mongoose.model('Contact', contactSchema);
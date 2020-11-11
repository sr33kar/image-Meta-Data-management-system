const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ItemSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    pass: {
        type: String,
        required: true
    }
}, {
    strict: false
});

module.exports = User = mongoose.model('user', ItemSchema);
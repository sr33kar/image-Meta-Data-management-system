const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const imageSc = new Schema({
    ImageDescription: { type: String, required: true },
    XResolution: { type: Number, required: true },
    YResolution: { type: Number, required: true },
    ResolutionUnit: { type: Number, required: true },
    Software: { type: String, required: false },
    ModifyDate: { type: String, required: false },
    ExifOffset: { type: Number, required: false }
});

const ItemSchema = new Schema({
    path: { type: String }
}, {
    strict: false
});

module.exports = ImageData = mongoose.model('imageData', ItemSchema);
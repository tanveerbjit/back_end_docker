const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  },
  description: String,
});

const Subcategory = mongoose.model('Subcategory', subcategorySchema);

module.exports = Subcategory;

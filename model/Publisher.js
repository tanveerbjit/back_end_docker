const mongoose = require('mongoose');

const publisherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  location: String,
  foundingYear: Number,
});

const Publisher = mongoose.model('Publisher', publisherSchema);

module.exports = Publisher;

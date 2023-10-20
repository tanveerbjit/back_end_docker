const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  biography: String,
  birthDate: Date,
});

authorSchema.virtual("name").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

const Author = mongoose.model('Author', authorSchema);

module.exports = Author;

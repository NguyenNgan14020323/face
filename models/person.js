const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var personSchema = new Schema({
  id: Number,
  personId: String,
  name: String,
});

module.exports = mongoose.model('Person', personSchema);
const { Schema, model } = require('mongoose');

const pisteSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
});

const Piste = model('Piste', pisteSchema);
module.exports = Piste;

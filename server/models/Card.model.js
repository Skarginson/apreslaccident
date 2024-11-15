const { Schema, model } = require('mongoose');

const cardSchema = new Schema({
  suit: {
    type: String,
    enum: ['Coeur', 'Carreau', 'Trèfle', 'Pique'],
    required: true,
  },
  rank: {
    type: String,
    enum: [
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
      'Valet',
      'Dame',
      'Roi',
      'As',
    ],
    required: true,
  },
  prompt: {
    type: String,
    required: true,
  },
  isPisteCard: {
    type: Boolean,
    default: false,
  },
  pistes: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Piste',
    },
  ],
});

const Card = model('Card', cardSchema);
module.exports = Card;

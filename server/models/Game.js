const { Schema, model } = require('mongoose');

const gameSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  deck: {
    type: Schema.Types.ObjectId,
    ref: 'Deck',
    required: true,
  },
  status: {
    type: String,
    enum: ['IN_PROGRESS', 'COMPLETED'],
    default: 'IN_PROGRESS',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Game = model('Game', gameSchema);
module.exports = Game;

const { Schema, model } = require('mongoose');

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  games: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Game',
    },
  ],
});

const User = model('User', userSchema);
module.exports = User;

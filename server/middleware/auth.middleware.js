const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const { TOKEN_SECRET, passwordRegex, emailRegex } = require('../../consts');
const User = require('../models/User');

// Endpoint pour l'inscription des utilisateurs
router.post('/signup', async (req, res, next) => {
  const { email, password, username } = req.body;

  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message:
        'Password must be at least 8 characters long, contain at least one number, and one special character (!, @, #, $, %, etc).',
    });
  }

  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format.' });
  }

  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(password, salt);

  try {
    const createdUser = await User.create({
      email,
      password: hashedPassword,
      username,
    });

    delete createdUser._doc.password; // Retirer le mot de passe de la réponse

    res.status(201).json(createdUser);
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const authToken = jwt.sign({ id: user._id, email }, TOKEN_SECRET, {
      algorithm: 'HS256',
      expiresIn: '7d',
    });

    res.json({
      authToken,
      user: { id: user._id, email, username: user.username },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

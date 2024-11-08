const express = require('express');\nconst dotenv = require('dotenv');\nconst mongoose = require('mongoose');\ndotenv.config();\nconst app = express();\napp.use(express.json());\n
// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI || '', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB', err));

app.listen(process.env.PORT || 5000, () => console.log('Server running'));


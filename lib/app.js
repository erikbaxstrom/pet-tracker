const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const app = express();
const authenticate = require('./middleware/authenticate.js');

// Built in middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [
      'http://10.0.0.128:3000',
      'http://localhost:3000',
      'https://deploy-preview-5--pet-tracker.netlify.app',
      'https://pet-tracker.netlify.app',
    ],
    credentials: true,
  })
);

// App routes
app.use('/api/v1/users', require('./controllers/users'));
app.use('/api/v1/tasks', authenticate, require('./controllers/tasks'));
app.use('/api/v1/pets', authenticate, require('./controllers/pets.js'));

// Error handling & 404 middleware for when
// a request doesn't match any app routes
app.use(require('./middleware/not-found'));
app.use(require('./middleware/error'));

module.exports = app;

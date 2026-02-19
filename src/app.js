require('express-async-errors');
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const LogtoExpressConfig = require ('../src/config/logotoExpressConfig');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const {handleAuthRoutes, withLogto} = require('@logto/express')


const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session(
  { secret: 'dkjA957BE2CoWHSItzfyUjCuVABlRxrk', 
    cookie: { maxAge: 14 * 24 * 60 * 60 } 
  }
));
app.use(handleAuthRoutes(LogtoExpressConfig));


app.get('/', withLogto(LogtoExpressConfig), (req, res) => {
  res.setHeader('content-type', 'text/html');
  if (req.user.isAuthenticated) {
    res.end(`<div>Hello ${req.user.claims?.sub}, <a href="/logto/sign-out">Sign Out</a></div>`);
  } else {
    res.end('<div><a href="/logto/sign-in">Sign In</a></div>');
  }
});

// Routes
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;

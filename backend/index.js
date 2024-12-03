const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios'); 
require('dotenv').config();
const chatRoutes = require('./routes/chatroutes');
const authRoutes = require('./routes/authRoutes');

// Create an Express application
const app = express();

// CORS configuration
app.use(cors({
  origin: true, // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // Cache preflight request for 24 hours
}));

// Handle OPTIONS preflight requests
app.options('*', cors());

// Body parsing middleware - MUST come before logging middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware to log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  console.log('Origin:', req.headers.origin);
  console.log('Headers:', req.headers);
  if (req.method === 'POST') {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ message: 'Invalid JSON payload' });
  }
  next(err);
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
  });

// Define routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to CurioBot API',
    status: 'Server is running'
  });
});

// API routes
app.use('/api/chat', chatRoutes);
app.use('/api/auth', authRoutes);

// Proxy route to fetch Google Translate TTS audio
app.get('/proxy-tts', async (req, res) => {
  const ttsUrl = req.query.url;

  if (!ttsUrl) {
    return res.status(400).send('URL query parameter is required.');
  }

  try {
    const response = await axios.get(decodeURIComponent(ttsUrl), {
      responseType: 'arraybuffer',
    });

    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(response.data);
  } catch (error) {
    console.error('Error fetching TTS:', error.message);
    res.status(500).send('Failed to fetch audio');
  }
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: 'The requested endpoint does not exist'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

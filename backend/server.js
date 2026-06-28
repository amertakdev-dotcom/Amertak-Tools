const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

const authRouter = require('./server/authRoutes');
const imageToUrlRouter = require('./api/tools/image-to-url');
const downloaderRouter = require('./api/tools/downloader');
const transcribeRouter = require('./api/tools/transcribe');
const qrCodeRouter = require('./api/tools/qr-code');
const textTranslatorRouter = require('./api/tools/text-translator');
const textCounterRouter = require('./api/tools/text-counter');
const colorConverterRouter = require('./api/tools/color-converter');

const app = express();

// CORS configuration for frontend domains
const configuredOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

const allowedOrigins = [
  'https://amertak-tools.vercel.app',
  'https://tools-amertak.vercel.app',
  'https://www.amertak-tools.vercel.app',
  'https://www.tools-amertak.vercel.app',
  'https://amertak.tools',
  'https://www.amertak.tools',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  ...configuredOrigins
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));
app.use(cookieParser());

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/tools/image-to-url', imageToUrlRouter);
app.use('/api/tools/downloader', downloaderRouter);
app.use('/api/tools/transcribe', transcribeRouter);
app.use('/api/tools/qr-code', qrCodeRouter);
app.use('/api/tools/text-translator', textTranslatorRouter);
app.use('/api/tools/text-counter', textCounterRouter);
app.use('/api/tools/color-converter', colorConverterRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

// Catch-all for undefined routes
app.use((req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`🚀 Amertak Tools API Server listening on port ${port}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
